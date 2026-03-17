from typing import Any, Optional

from geoalchemy2 import Geography
from pydantic import field_serializer
from shapely.geometry import mapping
from geoalchemy2.shape import to_shape
from sqlalchemy import Index
from sqlmodel import Column, Field, Relationship

from app.backend.db.config import BaseModel
from sqlalchemy.dialects.postgresql import TSVECTOR

from app.backend.db.models.address_infrastructure_link import AddressInfrastructureLink


class AddressBase(BaseModel):
    house_number: str | None
    full_address: str | None
    coordinates: Any | None

    @field_serializer("coordinates")
    def serialize_coordinates(self, geom):
        if geom is None:
            return None
        shape = to_shape(geom)
        return list(mapping(shape)["coordinates"])


class Address(AddressBase, table=True):
    __table_args__ = (Index("ix_address_search_vector", "search_vector", postgresql_using="gin"),)

    id: int | None = Field(primary_key=True)

    search_vector: Any | None = Field(sa_column=Column(TSVECTOR))
    coordinates: Any = Field(sa_column=Column(Geography(geometry_type="POINT", srid=4326), unique=True))

    region_id: int | None = Field(foreign_key="region.id", ondelete="SET NULL")
    municipality_id: int | None = Field(foreign_key="municipality.id", ondelete="SET NULL")
    partnership_id: int | None = Field(foreign_key="partnership.id", ondelete="SET NULL")
    settlement_id: int | None = Field(foreign_key="settlement.id", ondelete="SET NULL")
    district_id: int | None = Field(foreign_key="district.id", ondelete="SET NULL")
    microdistrict_id: int | None = Field(foreign_key="microdistrict.id", ondelete="SET NULL")
    street_id: int | None = Field(foreign_key="street.id", ondelete="SET NULL")
    residential_complex_id: int | None = Field(foreign_key="residential_complex.id", ondelete="SET NULL")

    region: "Region" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    municipality: "Municipality" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    partnership: "Partnership" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    settlement: "Settlement" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    district: "District" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    microdistrict: "Microdistrict" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    street: "Street" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    residential_complex: "ResidentialComplex" = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})

    offers: list["Offer"] = Relationship(back_populates="address")
    infrastructure_links: list["AddressInfrastructureLink"] = Relationship(
        back_populates="address", sa_relationship_kwargs={"lazy": "selectin"}
    )


class AddressComponent(BaseModel):
    id: int | None = Field(primary_key=True)
    name: str | None
    full_name: str | None = Field(unique=True)
    short_name: str | None


class Region(AddressComponent, table=True):
    addresses: list["Address"] = Relationship(back_populates="region")


class Municipality(AddressComponent, table=True):
    municipality_type_id: int | None = Field(foreign_key="municipality_type.id")

    municipality_type: Optional["MunicipalityType"] = Relationship(back_populates="municipalities")
    addresses: list["Address"] = Relationship(back_populates="municipality")


class Partnership(AddressComponent, table=True):
    partnership_type_id: int | None = Field(foreign_key="partnership_type.id")

    partnership_type: Optional["PartnershipType"] = Relationship(back_populates="partnerships")
    addresses: list["Address"] = Relationship(back_populates="partnership")


class Settlement(AddressComponent, table=True):
    settlement_type_id: int | None = Field(foreign_key="settlement_type.id")

    settlement_type: Optional["SettlementType"] = Relationship(back_populates="settlements")
    addresses: list["Address"] = Relationship(back_populates="settlement")


class District(AddressComponent, table=True):
    addresses: list["Address"] = Relationship(back_populates="district")


class Microdistrict(AddressComponent, table=True):
    addresses: list["Address"] = Relationship(back_populates="microdistrict")


class Street(AddressComponent, table=True):
    street_type_id: int | None = Field(foreign_key="street_type.id")

    street_type: Optional["StreetType"] = Relationship(back_populates="streets")
    addresses: list["Address"] = Relationship(back_populates="street")


class ResidentialComplex(AddressComponent, table=True):
    is_suburban: bool | None

    addresses: list["Address"] = Relationship(back_populates="residential_complex")


class AddressRead(AddressBase):
    id: int
    region: Region | None
    municipality: Municipality | None
    partnership: Partnership | None
    settlement: Settlement | None
    district: District | None
    microdistrict: Microdistrict | None
    street: Street | None
    residential_complex: ResidentialComplex | None


class AddressReadShort(AddressBase):
    pass
