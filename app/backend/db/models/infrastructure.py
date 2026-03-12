from typing import Any

from geoalchemy2 import Geography
from sqlmodel import Column, Field, Relationship

from app.backend.db.config import BaseModel

from app.backend.db.models.types import InfrastructureType


class InfrastructureBase(BaseModel):
    name: str | None
    coordinates: Any | None = Field(sa_column=Column(Geography(geometry_type="POINT", srid=4326)))


class Infrastructure(InfrastructureBase, table=True):
    id: int | None = Field(primary_key=True)
    infrastructure_type_id: int | None = Field(foreign_key="infrastructure_type.id")

    infrastructure_type: "InfrastructureType" = Relationship(back_populates="infrastructures")

    address_links: list["AddressInfrastructureLink"] = Relationship(back_populates="infrastructure")
