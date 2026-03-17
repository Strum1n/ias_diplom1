from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.api.analysis_routers import analysis_router
from app.backend.api.auth_routers import auth_router
from app.backend.api.offer_routers import offer_router
from app.backend.auth_utils.auth import get_current_user, oauth2_scheme
from app.backend.db.models.user import UserRead

app = FastAPI()
app.include_router(auth_router)
app.include_router(offer_router)
# app.include_router(analysis_router)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # или ["*"] — для разработки
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # адрес твоего фронта
    allow_credentials=True,  # важно для cookie
    allow_methods=["*"],  # POST, GET и т.д.
    allow_headers=["*"],
)


@app.get("/users/me", response_model=UserRead)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
