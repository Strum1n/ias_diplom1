from typing import Any, Optional

from geoalchemy2 import Geography
from sqlmodel import Column, Field, Index, Relationship

from app.backend.db.config import BaseModel
from sqlalchemy.dialects.postgresql import TSVECTOR


from app.backend.db.models1 import MunicipalityType


class Address(BaseModel, table=True):
    __table_args__ = (
        Index("idx_address_search_vector", "search_vector", postgresql_using="gin"),
    )

    id: int | None = Field(primary_key=True)
    house_number: str | None
    full_address: str | None
    search_vector: Any | None = Field(
        sa_column=Column(TSVECTOR), description="Полнотекстовый индекс (tsvector)"
    )
    coordinates: Any = Field(
        sa_column=Column(Geography(geometry_type="POINT", srid=4326), unique=True)
    )

    region_id: int | None = Field(foreign_key="region.id", ondelete="SET NULL")
    municipality_id: int | None = Field(
        foreign_key="municipality.id", ondelete="SET NULL"
    )

    region: Optional["Region"] = Relationship(
        back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"}
    )
    municipality: Optional["Municipality"] = Relationship(
        back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"}
    )


class Region(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    addresses: list["Address"] = Relationship(back_populates="region")


class Municipality(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    municipality_type_id: int | None = Field(foreign_key="municipality_type.id")

    municipality_type: Optional["MunicipalityType"] = Relationship(
        back_populates="municipalities"
    )
    addresses: list["Address"] = Relationship(back_populates="municipality")
