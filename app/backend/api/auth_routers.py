from datetime import timedelta
from typing import Literal
from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Form, Response, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from jwt import PyJWTError, decode
import jwt
from pydantic import EmailStr
from sqlmodel import or_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.backend.auth_utils.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECRET_KEY,
    authenticate_user,
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    get_password_hash,
    send_reset_link_email,
    send_welcome_email,
)
from app.backend.db.config import BaseModel, get_async_session
from app.backend.db.models.password import Password
from app.backend.db.models.types import Role
from app.backend.db.models.user import User


auth_router = APIRouter(prefix="/auth", tags=["Authentification"])


class RegisterBody(BaseModel):
    email: EmailStr
    name: str
    surname: str
    login: str
    role: Literal["Стандарт", "Премиум"]
    password: str


@auth_router.post("/login")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect login or password")

    token_data = {"sub": user.email, "username": user.login, "role": user.role.name}

    access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_refresh_token(data=token_data, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    if isinstance(access_token, bytes):
        access_token = access_token.decode("utf-8")
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )
    return response


class PasswordResetRequestBody(BaseModel):
    email: EmailStr


@auth_router.post("/request-password-reset")
async def request_password_reset(
    data: PasswordResetRequestBody = Form(),
    session: AsyncSession = Depends(get_async_session),
):
    statement = select(User).where(User.email == data.email)
    result = await session.exec(statement)
    user = result.first()

    if user:
        token = create_password_reset_token(data.email)
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        await send_reset_link_email(data.email, reset_link)

    return {"message": "Если пользователь существует, ссылка отправлена"}


class ConfirmPasswordResetBody(BaseModel):
    token: str
    new_password: str


@auth_router.post("/confirm-password-reset")
async def confirm_password_reset(
    data: ConfirmPasswordResetBody = Form(),
    session: AsyncSession = Depends(get_async_session),
):

    payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    statement = select(User).where(User.email == email)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(status_code=400, detail="Пользователь не найден")

    user.password.hash = get_password_hash(data.new_password)
    session.add(user)
    await session.commit()

    return {"message": "Пароль успешно обновлен"}


@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}


@auth_router.post("/refresh-token")
async def refresh_access_token(
    refresh_token: str = Cookie(),
    session: AsyncSession = Depends(get_async_session),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        print("Юзер ", username)
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        statement = select(User).where(or_(User.email == username, User.login == username))
        result = await session.exec(statement)
        user = result.first()
        token_data = {"sub": user.email, "username": user.login, "role": user.role.name}
        access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        new_refresh_token = create_refresh_token(data=token_data, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    response = JSONResponse(
        content={
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )
    return response


@auth_router.post("/validate-reset-token")
async def validate_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    return {"valid": True}


@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: RegisterBody = Body(), session: AsyncSession = Depends(get_async_session)):

    statement = select(User).where(User.email == user_data.email)
    result = await session.exec(statement)
    existing_user = result.first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    hashed_password = get_password_hash(user_data.password)
    password_entry = Password(hash=hashed_password)
    session.add(password_entry)
    stmt = select(Role).where(Role.name == user_data.role)
    result = await session.exec(stmt)
    role = result.first()
    await session.commit()
    await session.refresh(password_entry)

    new_user = User(
        user_name=user_data.login,
        email=user_data.email,
        name=user_data.name,
        surname=user_data.surname,
        role=role,
        login=user_data.login,
        password_id=password_entry.id,
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    await send_welcome_email(user_data.email)
    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "username": new_user.login,
    }
