import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.backend.config import settings
from app.backend.db.config import get_async_session
from app.backend.db.models import *

SECRET_KEY = settings.SECRET_KEY
REFRESH_SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
APP_PASSWORD = settings.APP_PASSWORD

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


async def authenticate_user(session: AsyncSession, email: str, password: str):
    statement = select(User).where(User.email == email)
    result = await session.exec(statement)
    user = result.first()
    if not user:
        return False
    if not verify_password(password, user.password.hash):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: AsyncSession = Depends(get_async_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = username
    except InvalidTokenError:
        raise credentials_exception
    statement = select(User).where(User.email == token_data)
    result = await session.exec(statement)
    user = result.first()
    if user is None:
        raise credentials_exception
    return user


async def send_welcome_email(to_email: str) -> bool:
    try:
        smtp_server = smtplib.SMTP("smtp.gmail.com", 587)
        my_email = "keklol0713@gmail.com"

        smtp_server.starttls()
        smtp_server.login(my_email, APP_PASSWORD)

        msg = MIMEMultipart("alternative")
        msg["From"] = f"Аналитика Недвижимости"
        msg["To"] = to_email
        msg["Subject"] = "Добро пожаловать в Аналитику Недвижимости 🏙️"

        html = """
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background: linear-gradient(90deg, #007BFF, #00b386); color: white; text-align: center; padding: 25px;">
                    <h2 style="margin: 0;">Добро пожаловать в Аналитику Недвижимости 🏡</h2>
                </div>
                <div style="padding: 25px; color: #333; line-height: 1.6;">
                    <p>Привет 👋,</p>
                    <p>Спасибо за регистрацию в <b>Аналитике Недвижимости</b> — платформе для глубокого анализа рынка жилья и инвестиций.</p>
                    <p>Теперь вы можете отслеживать динамику цен, сравнивать районы и находить выгодные предложения быстрее, чем когда-либо раньше 💡</p>
                    <p>Чтобы начать работу, войдите в свой аккаунт:</p>
                    <p style="text-align: center;">
                        <a href="https://example.com/login"
                        style="display: inline-block; padding: 12px 22px; background-color: #00b386; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Перейти в приложение
                        </a>
                    </p>
                    <p>Если у вас возникнут вопросы — просто ответьте на это письмо, и мы с радостью поможем 🧩</p>
                    <p>С уважением,<br>Команда <b>Аналитики Недвижимости</b> 💚</p>
                </div>
                <div style="background-color: #f0f5f2; text-align: center; font-size: 12px; color: #666; padding: 15px;">
                    © 2025 Аналитика Недвижимости. Все права защищены.
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))
        smtp_server.sendmail(my_email, to_email, msg.as_string())
        smtp_server.quit()
        return True
    except Exception as e:
        print(e)
        return False
