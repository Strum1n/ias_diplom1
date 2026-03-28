from datetime import datetime
from sqlmodel import Column, DateTime, Field, Relationship, func

from app.backend.db.config import BaseModel
from app.backend.db.models.favorites import Favorites
from app.backend.db.models.password import Password
from app.backend.db.models.types import Role


class UserBase(BaseModel):
    email: str = Field(unique=True)
    login: str = Field(unique=True)
    name: str | None
    surname: str | None
    registration_date: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()))


class User(UserBase, table=True):
    id: int | None = Field(primary_key=True)
    role_id: int | None = Field(foreign_key="role.id")
    role: "Role" = Relationship(back_populates="users", sa_relationship_kwargs={"lazy": "selectin"})

    password_id: int | None = Field(foreign_key="password.id")
    password: "Password" = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False, "lazy": "selectin"},
    )

    offer_links: list["Favorites"] = Relationship(back_populates="user", sa_relationship_kwargs={"lazy": "selectin"})


class UserRead(UserBase):
    role: Role
