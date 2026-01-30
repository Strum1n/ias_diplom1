from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from jwt import PyJWTError, decode
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.backend.api.response_models import UserRequest
from app.backend.auth_utils.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_EXPIRE_DAYS,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    send_welcome_email,
)
from app.backend.db.config import get_async_session
from app.backend.db.models import *

auth_router = APIRouter(prefix="/auth", tags=["Authentification"])


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


@auth_router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # Создаем payload с email и role_id
    token_data = {"sub": user.email, "role": user.role.name}

    access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_refresh_token(data=token_data, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    if isinstance(access_token, bytes):
        access_token = access_token.decode("utf-8")
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    # HttpOnly cookie для refresh_token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # в проде https
        samesite="none",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )
    return response


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@auth_router.post("/refresh", response_model=Token)
async def refresh_access_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access_token = create_access_token(data={"sub": username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    # (опционально) создаём новый refresh_token
    new_refresh_token = create_refresh_token(data={"sub": username}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

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


@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRequest, session: AsyncSession = Depends(get_async_session)):
    # Проверяем, существует ли пользователь с таким именем
    statement = select(User).where(User.email == user_data.email)
    result = await session.exec(statement)
    existing_user = result.first()
    print(existing_user)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Хэшируем пароль и создаём запись в таблице Password
    hashed_password = get_password_hash(user_data.password)
    password_entry = Password(hash=hashed_password)
    session.add(password_entry)
    await session.commit()
    await session.refresh(password_entry)

    # Создаём нового пользователя и связываем с Password
    new_user = User(
        user_name=user_data.user_name,
        email=user_data.email,
        full_name=user_data.full_name,
        role_id=user_data.role_id,
        password_id=password_entry.id,
        registration_date=datetime.now(timezone.utc),
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    await send_welcome_email(user_data.email)
    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "username": new_user.user_name,
    }
