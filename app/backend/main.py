from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.api.analysis_routers import analysis_router
from app.backend.api.auth_routers import auth_router
from app.backend.api.offer_routers import offer_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(offer_router)
app.include_router(analysis_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
