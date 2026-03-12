from datetime import datetime

from sqlmodel import Column, DateTime, Field, Relationship, func

from app.backend.db.config import BaseModel


class Favorites(BaseModel, table=True):
    user_id: int | None = Field(foreign_key="user.id", primary_key=True)
    offer_id: int | None = Field(foreign_key="offer.id", primary_key=True)

    added_date: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
        )
    )

    offer: "Offer" = Relationship(back_populates="user_links", sa_relationship_kwargs={"lazy": "selectin"})
    user: "User" = Relationship(back_populates="offer_links", sa_relationship_kwargs={"lazy": "selectin"})
