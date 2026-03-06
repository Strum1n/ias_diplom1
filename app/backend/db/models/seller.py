from typing import Optional

from sqlmodel import Field, Relationship

from app.backend.db.config import BaseModel
from app.backend.db.models1 import Offer
from app.backend.db.models.types import SellerType


class Seller(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    rating: float | None
    foundation_date: int | None

    seller_type_id: int | None = Field(foreign_key="seller_type.id")
    seller_type: Optional["SellerType"] = Relationship(
        back_populates="sellers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    offers: list["Offer"] = Relationship(back_populates="seller")
