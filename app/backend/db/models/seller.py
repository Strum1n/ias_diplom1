from sqlmodel import Field, Relationship

from app.backend.db.config import BaseModel


class SellerBase(BaseModel):
    name: str | None = Field(unique=True)
    rating: float | None
    foundation_date: int | None


class Seller(SellerBase, table=True):
    id: int | None = Field(primary_key=True)
    seller_type_id: int | None = Field(foreign_key="seller_type.id")
    seller_type: "SellerType" = Relationship(back_populates="sellers")

    offers: list["Offer"] = Relationship(back_populates="seller")
