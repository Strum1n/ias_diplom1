from datetime import datetime

from sqlalchemy import String
from sqlmodel import ARRAY, Column, DateTime, Field, func, text

from app.backend.db.config import BaseModel
from sqlalchemy.dialects.postgresql import JSONB


class Offer(BaseModel, table=True):
    id: int | None = Field(primary_key=True)

    is_active: bool = Field(
        default=True,
        sa_column_kwargs={"server_default": text("true")},
    )

    price: int | None
    price_per_square_meter: int | None
    price_category: str | None
    price_history: list[dict] | None = Field(sa_column=Column(JSONB))

    total_area: float | None
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

    title: str | None
    description: str | None
    images_urls: list[str] | None = Field(sa_column=Column(ARRAY(String(500))))
    url: str | None = Field(max_length=500)
    identical_urls: list[str] | None = Field(sa_column=Column(ARRAY(String(500))))
    source: str | None

    transport_access_score: float | None
    transport_access_category: str | None
    elderly_score: float | None
    elderly_category: str | None
    family_score: float | None
    family_category: str | None

    views_count: int | None
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
