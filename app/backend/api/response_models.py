from datetime import date, datetime
from typing import Optional

from geoalchemy2 import WKBElement

from app.backend.db.config import BaseModel
from app.backend.db.models1 import *


class UserRequest(BaseModel):
    user_name: str
    password: str
    email: str | None
    full_name: str | None
    role_id: int | None


class OfferResponseFull(BaseModel):
    id: int | None
    url: str | None
    images_urls: List[str] | None
    is_new_house: bool | None
    price: int | None
    price_history: List[dict] | None
    views_history: List[dict] | None
    price_per_square_meter: int | None
    total_area: float | None
    living_area: float | None
    kitchen_area: float | None
    ceiling_height: float | None
    floor: int | None
    bathrooms_count: int | None
    description: str | None
    house_built_year: int | None
    land_area: float | None
    is_build_complete: bool | None
    rooms_count: int | None
    bathrooms_count: int | None
    bedrooms_count: int | None
    elevators_count: int | None
    balconies_count: int | None
    house_floors_count: int | None
    title: str | None
    views_count: int | None
    last_ten_days_views_count: int | None
    daily_views_count: int | None
    has_furniture: bool | None
    has_balcony: bool | None
    has_elevator: bool | None
    has_water_supply: bool | None
    has_electricity: bool | None
    has_gas: bool | None
    has_sewerage: bool | None
    has_heating: bool | None
    has_garbage_chute: bool | None
    has_guard: bool | None
    has_garage: bool | None
    has_bathhouse: bool | None
    has_pool: bool | None
    has_terrace: bool | None
    update_date: datetime | None
    update_date_source: datetime | None
    creation_date_source: datetime | None
    contact_phone: str | None
    transport_access_score: float | None
    transport_access_category: str | None
    elderly_score: float | None
    elderly_category: str | None
    family_score: float | None
    family_category: str | None
    price_category: str | None
    identical_urls: list | None
    source: str | None

    address: Optional["AddressResponseFull"]
    offer_type: Optional["OfferType"]
    property_type: Optional["PropertyType"]
    bathroom_type: Optional["BathroomType"]
    renovation_type: Optional["RenovationType"]
    window_view_type: Optional["WindowViewType"]
    parking_type: Optional["ParkingType"]
    house_material_type: Optional["HouseMaterialType"]
    heating_type: Optional["HeatingType"]
    gas_type: Optional["GasType"]
    sewerage_type: Optional["SewerageType"]
    water_supply_type: Optional["WaterSupplyType"]
    seller: Optional["SellerResponseFull"]
    land_type: Optional["LandType"]


class SellerResponseFull(BaseModel):
    id: int
    name: str
    seller_type: Optional["SellerType"]


class AddressResponseFull(BaseModel):
    id: int | None
    house_number: str | None
    full_address: str | None
    coordinates_list: list[float]
    region: Optional["Region"]
    municipality: Optional["Municipality"]
    settlement: Optional["Settlement"]
    partnership: Optional["Partnership"]
    district: Optional["District"]
    microdistrict: Optional["Microdistrict"]
    street: Optional["Street"]
    residential_complex: Optional["ResidentialComplex"]
    infrastructures_links: List["AddressInfrastructureLinkResponseFull"]


class InfrastructureResponseFull(BaseModel):
    id: int | None
    name: str | None
    infrastructure_type: Optional["InfrastructureType"]
    coordinates_list: list[float]


class AddressInfrastructureLinkResponseFull(BaseModel):
    infrastructure: Optional["InfrastructureResponseFull"]
    distance: int | None


class AddressResponseShort(BaseModel):
    house_number: str | None
    full_address: str

    coordinates_list: list[float]


class PaginationInfo(BaseModel):
    limit: int
    offset: int

    has_more: bool


class OfferResponseShort(BaseModel):
    id: int | None
    url: str | None
    price: int | None
    total_area: float | None
    land_area: float | None
    living_area: float | None
    title: str | None
    price_category: str | None

    address: Optional["AddressResponseShort"]


class OfferResponseWithPagination(BaseModel):
    total_count: int
    filtered_count: int
    offers: List[OfferResponseFull]
    pagination: PaginationInfo
