from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.api.analysis_routers1 import analysis_router
from app.backend.api.auth_routers import auth_router
from app.backend.api.offer_routers import offer_router
from app.backend.auth_utils.auth import get_current_user
from app.backend.db.models.user import UserRead

app = FastAPI()
app.include_router(auth_router)
app.include_router(offer_router)
app.include_router(analysis_router)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # локальная разработка
        "http://frontend:3000",  # внутри Docker сети
        "http://nginx_app",  # через Nginx
        # Добавьте другие origins по необходимости
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],  # или конкретные: ["Authorization", "Content-Type", ...]
    expose_headers=["Content-Length", "Content-Range"],
    max_age=3600,
)

# Ваши роуты...


@app.get("/users/me", response_model=UserRead)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
