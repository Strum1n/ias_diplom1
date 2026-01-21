from datetime import datetime, timezone
from typing import Any, List, Optional

from geoalchemy2 import Geography
from geoalchemy2.shape import to_shape
from pydantic import field_serializer
from shapely.geometry import mapping
from sqlalchemy import Column, String, func
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlmodel import ARRAY, Boolean, DateTime, Field, Index, Relationship, UniqueConstraint, text

from app.backend.db.config import BaseModel

# TODO ПОМЕНЯТЬ ТИПЫ У КООРДИНАТ НА GEOGRAPHY 4691
# 4593 московская область
# 4562 брянская


class Favorite(BaseModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    offer_id: int = Field(foreign_key="offer.id", primary_key=True)


class Offer(BaseModel, table=True):
    # 1. Идентификаторы
    id: int | None = Field(primary_key=True)

    is_active: bool = Field(
        default=True,
        sa_column_kwargs={"server_default": text("true")},
    )

    # 4. Цена
    price: int | None
    price_per_square_meter: int | None
    price_category: str | None
    price_history: List[dict] | None = Field(sa_column=Column(JSONB))

    # 5. Площади
    total_area: float | None
    living_area: float | None
    kitchen_area: float | None
    land_area: float | None

    # 6. Планировка
    rooms_count: int | None
    bedrooms_count: int | None
    bathrooms_count: int | None
    floor: int | None
    house_floors_count: int | None
    ceiling_height: float | None

    # 7. Дом и состояние
    is_new_house: bool | None
    house_built_year: int | None
    is_build_complete: bool | None

    # 8. Коммуникации
    has_water_supply: bool | None
    has_electricity: bool | None
    has_gas: bool | None
    has_sewerage: bool | None
    has_heating: bool | None

    # 9. Удобства
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

    # 10. Контент
    title: str | None
    description: str | None
    images_urls: List[str] | None = Field(sa_column=Column(ARRAY(String(500))))
    url: str | None = Field(max_length=500)
    identical_urls: List[str] | None = Field(sa_column=Column(ARRAY(String(500))))
    source: str | None

    # 11. Аналитика и скоринг
    transport_access_score: float | None
    transport_access_category: str | None
    elderly_score: float | None
    elderly_category: str | None
    family_score: float | None
    family_category: str | None

    # 12. Просмотры
    views_count: int | None
    daily_views_count: int | None
    last_ten_days_views_count: int | None
    views_history: List[dict] | None = Field(sa_column=Column(JSONB))

    # 13. Контакты
    contact_phone: str | None = Field(max_length=20)

    # 14. Служебные даты
    creation_date_source: datetime | None = Field(sa_column=Column(DateTime(timezone=True)))
    update_date_source: datetime | None = Field(sa_column=Column(DateTime(timezone=True)))
    update_date: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
        )
    )
    address_id: int | None = Field(foreign_key="address.id", ondelete="CASCADE")
    address: Optional["Address"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    seller_id: int | None = Field(foreign_key="seller.id")
    seller: Optional["Seller"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    offer_type_id: int | None = Field(foreign_key="offer_type.id")
    offer_type: Optional["OfferType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    property_type_id: int | None = Field(foreign_key="property_type.id")
    property_type: Optional["PropertyType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    land_type_id: int | None = Field(foreign_key="land_type.id")
    land_type: Optional["LandType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    # 3. Типы и классификаторы
    bathroom_type_id: int | None = Field(foreign_key="bathroom_type.id")
    bathroom_type: Optional["BathroomType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    renovation_type_id: int | None = Field(foreign_key="renovation_type.id")
    renovation_type: Optional["RenovationType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    window_view_type_id: int | None = Field(foreign_key="window_view_type.id")
    window_view_type: Optional["WindowViewType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    parking_type_id: int | None = Field(foreign_key="parking_type.id")
    parking_type: Optional["ParkingType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    house_material_type_id: int | None = Field(foreign_key="house_material_type.id")
    house_material_type: Optional["HouseMaterialType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    heating_type_id: int | None = Field(foreign_key="heating_type.id")
    heating_type: Optional["HeatingType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    gas_type_id: int | None = Field(foreign_key="gas_type.id")
    gas_type: Optional["GasType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    sewerage_type_id: int | None = Field(foreign_key="sewerage_type.id")
    sewerage_type: Optional["SewerageType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})

    water_supply_type_id: int | None = Field(foreign_key="water_supply_type.id")
    water_supply_type: Optional["WaterSupplyType"] = Relationship(back_populates="offers", sa_relationship_kwargs={"lazy": "selectin"})
    # 15. Связи many-to-many
    users: List["User"] = Relationship(back_populates="offers", link_model=Favorite)


class Seller(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    rating: float | None
    foundation_date: int | None

    seller_type_id: int | None = Field(foreign_key="seller_type.id")
    seller_type: Optional["SellerType"] = Relationship(back_populates="sellers", sa_relationship_kwargs={"lazy": "selectin"})

    offers: List["Offer"] = Relationship(back_populates="seller")


class SellerType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    sellers: List["Seller"] = Relationship(back_populates="seller_type")


class OfferType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="offer_type")


class PropertyType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="property_type")


class LandType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="land_type")


class RenovationType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="renovation_type")


class BathroomType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="bathroom_type")


class WindowViewType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="window_view_type")


class ParkingType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="parking_type")


class HouseMaterialType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="house_material_type")


class HeatingType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="heating_type")


class GasType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="gas_type")


class WaterSupplyType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="water_supply_type")


class SewerageType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: List["Offer"] = Relationship(back_populates="sewerage_type")


class AddressInfrastructureLink(BaseModel, table=True):
    infrastructure_id: int = Field(foreign_key="infrastructure.id", primary_key=True, ondelete="CASCADE")
    address_id: int = Field(foreign_key="address.id", primary_key=True, ondelete="CASCADE")
    distance: int | None

    address: "Address" = Relationship(back_populates="infrastructures_links")
    infrastructure: "Infrastructure" = Relationship(back_populates="addresses_links", sa_relationship_kwargs={"lazy": "selectin"})


class Address(BaseModel, table=True):
    __table_args__ = (Index("idx_address_search_vector", "search_vector", postgresql_using="gin"),)

    id: int | None = Field(primary_key=True)
    house_number: str | None
    full_address: str | None
    search_vector: Any | None = Field(sa_column=Column(TSVECTOR), description="Полнотекстовый индекс (tsvector)")
    coordinates: Any = Field(sa_column=Column(Geography(geometry_type="POINT", srid=4326), unique=True))

    region_id: int | None = Field(foreign_key="region.id")
    municipality_id: int | None = Field(foreign_key="municipality.id")
    super_municipality_id: int | None = Field(foreign_key="super_municipality.id")
    settlement_id: int | None = Field(foreign_key="settlement.id")
    partnership_id: int | None = Field(foreign_key="partnership.id")
    district_id: int | None = Field(foreign_key="district.id")
    microdistrict_id: int | None = Field(foreign_key="microdistrict.id")
    street_id: int | None = Field(foreign_key="street.id")
    residential_complex_id: int | None = Field(foreign_key="residential_complex.id")

    region: Optional["Region"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    municipality: Optional["Municipality"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    super_municipality: Optional["SuperMunicipality"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    settlement: Optional["Settlement"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    partnership: Optional["Partnership"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    district: Optional["District"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    microdistrict: Optional["Microdistrict"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    street: Optional["Street"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})
    residential_complex: Optional["ResidentialComplex"] = Relationship(back_populates="addresses", sa_relationship_kwargs={"lazy": "selectin"})

    offers: List["Offer"] = Relationship(back_populates="address", sa_relationship_kwargs={"lazy": "selectin"})
    infrastructures_links: list["AddressInfrastructureLink"] = Relationship(back_populates="address", sa_relationship_kwargs={"lazy": "selectin"})

    @field_serializer("coordinates")
    def serialize_coordinates(self, geom):
        if geom is None:
            return None
        shape = to_shape(geom)
        return mapping(shape)["coordinates"]

    @property
    def coordinates_list(self) -> list[float] | None:
        """Возвращает координаты в виде списка [lon, lat]"""
        if self.coordinates is None:
            return None
        shape = to_shape(self.coordinates)
        return list(mapping(shape)["coordinates"])


class Region(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    addresses: List["Address"] = Relationship(back_populates="region")


class Municipality(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    municipality_type_id: int | None = Field(foreign_key="municipality_type.id")

    municipality_type: Optional["MunicipalityType"] = Relationship(back_populates="municipalities")
    addresses: List["Address"] = Relationship(back_populates="municipality")


class MunicipalityType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    municipalities: List["Municipality"] = Relationship(back_populates="municipality_type")


class SuperMunicipality(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    super_municipality_type_id: int | None = Field(foreign_key="super_municipality_type.id")

    super_municipality_type: Optional["SuperMunicipalityType"] = Relationship(back_populates="super_municipalities")
    addresses: List["Address"] = Relationship(back_populates="super_municipality")


class SuperMunicipalityType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    super_municipalities: List["SuperMunicipality"] = Relationship(back_populates="super_municipality_type")


class Partnership(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    partnership_type_id: int | None = Field(foreign_key="partnership_type.id")

    partnership_type: Optional["PartnershipType"] = Relationship(back_populates="partnerships")
    addresses: List["Address"] = Relationship(back_populates="partnership")


class PartnershipType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    partnerships: List["Partnership"] = Relationship(back_populates="partnership_type")


class Settlement(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None
    full_name: str | None = Field(unique=True)
    short_name: str | None

    settlement_type_id: int | None = Field(foreign_key="settlement_type.id")

    settlement_type: Optional["SettlementType"] = Relationship(back_populates="settlements")
    addresses: List["Address"] = Relationship(back_populates="settlement")


class SettlementType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    settlements: List["Settlement"] = Relationship(back_populates="settlement_type")


class District(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    addresses: List["Address"] = Relationship(back_populates="district")


class Microdistrict(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    addresses: List["Address"] = Relationship(back_populates="microdistrict")


class Street(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None

    street_type_id: int | None = Field(foreign_key="street_type.id")

    street_type: Optional["StreetType"] = Relationship(back_populates="streets")
    addresses: List["Address"] = Relationship(back_populates="street")


class StreetType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    streets: List["Street"] = Relationship(back_populates="street_type")


class ResidentialComplex(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)
    full_name: str | None
    short_name: str | None
    is_suburban: bool | None

    addresses: List["Address"] = Relationship(back_populates="residential_complex")


class Infrastructure(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    __table_args__ = (UniqueConstraint("name", "coordinates", name="uq_infrastructure_name_coordinates"),)
    name: str | None
    coordinates: Any = Field(sa_column=Column(Geography(geometry_type="POINT", srid=4326)))

    infrastructure_type_id: int | None = Field(foreign_key="infrastructure_type.id")

    infrastructure_type: Optional["InfrastructureType"] = Relationship(back_populates="infrastructure", sa_relationship_kwargs={"lazy": "selectin"})

    addresses_links: list["AddressInfrastructureLink"] = Relationship(back_populates="infrastructure")

    @field_serializer("coordinates")
    def serialize_coordinates(self, geom):
        if geom is None:
            return None
        shape = to_shape(geom)
        return mapping(shape)["coordinates"]

    @property
    def coordinates_list(self) -> list[float] | None:
        """Возвращает координаты в виде списка [lon, lat]"""
        if self.coordinates is None:
            return None
        shape = to_shape(self.coordinates)
        return list(mapping(shape)["coordinates"])


class InfrastructureType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    infrastructure: List["Infrastructure"] = Relationship(back_populates="infrastructure_type")


class User(BaseModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_name: str | None = Field(unique=True)
    email: str | None
    full_name: str | None
    registration_date: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()))

    role_id: int | None = Field(foreign_key="role.id")
    role: Optional["Role"] = Relationship(back_populates="users")

    password_id: int | None = Field(foreign_key="password.id")
    password: Optional["Password"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False, "lazy": "selectin"})

    offers: List["Offer"] = Relationship(back_populates="users", link_model=Favorite, sa_relationship_kwargs={"lazy": "selectin"})


class Password(BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hash: str  # здесь хранятся хэш + соль

    user: "User" = Relationship(back_populates="password")


class Role(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(unique=True)

    users: List["User"] = Relationship(back_populates="role")
