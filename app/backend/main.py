from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.api.analysis_routers import analysis_router
from app.backend.api.auth_routers import auth_router
from app.backend.api.offer_routers import offer_router
from app.backend.auth_utils.auth import get_current_user, oauth2_scheme
from app.backend.db.models import User

app = FastAPI()
app.include_router(auth_router)
app.include_router(offer_router)
app.include_router(analysis_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # или ["*"] — для разработки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/items/")
async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}


@app.get("/users/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
