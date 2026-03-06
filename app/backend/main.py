from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.api.analysis_routers import analysis_router
from app.backend.api.auth_routers import auth_router
from app.backend.api.offer_routers import offer_router
from app.backend.auth_utils.auth import get_current_user, oauth2_scheme
from app.backend.db.models1 import User

app = FastAPI()
app.include_router(auth_router)
app.include_router(offer_router)
app.include_router(analysis_router)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # или ["*"] — для разработки
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8000",
        "http://frontend:3000",
        "http://127.0.0.1:3000",  # Nuxt dev server
        "http://192.168.0.168:3000",  # Ваш локальный IP с портом
        "http://192.168.1.*:3000",  # Все устройства в сети
        "http://192.168.0.168:8000",
    ],
    allow_credentials=True,  # КРИТИЧЕСКИ ВАЖНО!
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials",
    ],
    expose_headers=["*"],
    max_age=3600,
)


@app.get("/users/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
