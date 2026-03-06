from datetime import datetime
from typing import Optional

from sqlalchemy import String
from sqlmodel import ARRAY, Column, DateTime, Field, Relationship, func, text

from app.backend.db.config import BaseModel
from sqlalchemy.dialects.postgresql import JSONB

from app.backend.db.models.address import Address
from app.backend.db.models.seller import Seller
from app.backend.db.models.types import (
    BathroomType,
    GasType,
    HeatingType,
    HouseMaterialType,
    LandType,
    OfferType,
    ParkingType,
    PropertyType,
    RenovationType,
    SewerageType,
    WindowViewType,
)
from app.backend.db.models1 import WaterSupplyType


class OfferBase(BaseModel):
    is_active: bool = Field(
        default=True,
        sa_column_kwargs={"server_default": text("true")},
    )

    price: int
    price_per_square_meter: int
    price_category: str | None
    price_history: list[dict] | None = Field(sa_column=Column(JSONB))

    total_area: float
    living_area: float | None
    kitchen_area: float | None
    land_area: float | None

    rooms_count: int | None
    bedrooms_count: int | None
    bathrooms_count: int | None
    floor: int | None
    house_floors_count: int | None
    ceiling_height: float | None

    is_new_house: bool | None
    house_built_year: int | None
    is_build_complete: bool | None

    has_water_supply: bool | None
    has_electricity: bool | None
    has_gas: bool | None
    has_sewerage: bool | None
    has_heating: bool | None

    elevators_count: int | None
    has_elevator: bool | None
    balconies_count: int | None
    has_balcony: bool | None
    has_garbage_chute: bool | None
    has_furniture: bool | None
    has_guard: bool | None
    has_garage: bool | None
    has_bathhouse: bool | None
    has_pool: bool | None
    has_terrace: bool | None

    title: str
    description: str | None
    images_urls: list[str] | None = Field(sa_column=Column(ARRAY(String(500))))
    url: str = Field(max_length=500)
    identical_urls: list[str] | None = Field(sa_column=Column(ARRAY(String(500))))
    source: str

    transport_access_score: float | None
    transport_access_category: str | None
    elderly_score: float | None
    elderly_category: str | None
    family_score: float | None
    family_category: str | None

    views_count: int
    daily_views_count: int | None
    last_ten_days_views_count: int | None
    views_history: list[dict] | None = Field(sa_column=Column(JSONB))

    contact_phone: str | None = Field(max_length=20)

    creation_date_source: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True))
    )
    update_date_source: datetime | None = Field(
        sa_column=Column(DateTime(timezone=True))
    )
    update_date: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
        )
    )


class Offer(OfferBase, table=True):
    __table_args__ = {"extend_existing": True}
    id: int | None = Field(primary_key=True)
    address_id: int | None = Field(
        foreign_key="address.id", ondelete="CASCADE", index=True
    )
    address: Optional["Address"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )
    seller_id: int | None = Field(foreign_key="seller.id")
    seller: Optional["Seller"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    offer_type_id: int | None = Field(foreign_key="offer_type.id")
    offer_type: Optional["OfferType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    property_type_id: int | None = Field(foreign_key="property_type.id")
    property_type: Optional["PropertyType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    land_type_id: int | None = Field(foreign_key="land_type.id")
    land_type: Optional["LandType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    bathroom_type_id: int | None = Field(foreign_key="bathroom_type.id")
    bathroom_type: Optional["BathroomType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    renovation_type_id: int | None = Field(foreign_key="renovation_type.id")
    renovation_type: Optional["RenovationType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    window_view_type_id: int | None = Field(foreign_key="window_view_type.id")
    window_view_type: Optional["WindowViewType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    parking_type_id: int | None = Field(foreign_key="parking_type.id")
    parking_type: Optional["ParkingType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    house_material_type_id: int | None = Field(foreign_key="house_material_type.id")
    house_material_type: Optional["HouseMaterialType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    heating_type_id: int | None = Field(foreign_key="heating_type.id")
    heating_type: Optional["HeatingType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    gas_type_id: int | None = Field(foreign_key="gas_type.id")
    gas_type: Optional["GasType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    sewerage_type_id: int | None = Field(foreign_key="sewerage_type.id")
    sewerage_type: Optional["SewerageType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )

    water_supply_type_id: int | None = Field(foreign_key="water_supply_type.id")
    water_supply_type: Optional["WaterSupplyType"] = Relationship(
        back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"}
    )
