from sqlmodel import Field, Relationship

from app.backend.db.config import BaseModel
from app.backend.db.models.infrastructure import Infrastructure


class AddressInfrastructureLink(BaseModel, table=True):
    address_id: int | None = Field(foreign_key="address.id", primary_key=True)
    infrastructure_id: int | None = Field(foreign_key="infrastructure.id", primary_key=True)

    distance: float | None

    address: "Address" = Relationship(back_populates="infrastructure_links")
    infrastructure: "Infrastructure" = Relationship(back_populates="address_links")
