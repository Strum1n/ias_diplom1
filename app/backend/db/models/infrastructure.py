from typing import Any

from geoalchemy2 import Geography
from sqlmodel import Column, Field, Relationship

from app.backend.db.config import BaseModel

from app.backend.db.models.types import InfrastructureType, TypeBase
from pydantic import field_serializer
from shapely.geometry import mapping
from geoalchemy2.shape import to_shape


class InfrastructureBase(BaseModel):
    name: str | None
    coordinates: Any | None = Field(sa_column=Column(Geography(geometry_type="POINT", srid=4326)))

    @field_serializer("coordinates")
    def serialize_coordinates(self, geom):
        if geom is None:
            return None
        shape = to_shape(geom)
        return list(mapping(shape)["coordinates"])


class Infrastructure(InfrastructureBase, table=True):
    id: int | None = Field(primary_key=True)
    infrastructure_type_id: int | None = Field(foreign_key="infrastructure_type.id")

    infrastructure_type: "InfrastructureType" = Relationship(back_populates="infrastructures", sa_relationship_kwargs={"lazy": "selectin"})

    address_links: list["AddressInfrastructureLink"] = Relationship(back_populates="infrastructure")


class InfrastructureRead(InfrastructureBase):
    infrastructure_type: TypeBase
