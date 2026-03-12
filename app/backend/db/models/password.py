from sqlmodel import Field, Relationship

from app.backend.db.config import BaseModel


class Password(BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hash: str

    user: "User" = Relationship(back_populates="password")
