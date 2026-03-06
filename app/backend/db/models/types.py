from sqlmodel import Field, Relationship

from app.backend.db.config import BaseModel

from app.backend.db.models.offer import Offer
from app.backend.db.models.seller import Seller
from app.backend.db.models.types import Municipality


class SellerType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    sellers: list["Seller"] = Relationship(back_populates="seller_type")


class OfferType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="offer_type")


class PropertyType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="property_type")


class LandType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="land_type")


class RenovationType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="renovation_type")


class BathroomType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="bathroom_type")


class WindowViewType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="window_view_type")


class ParkingType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="parking_type")


class HouseMaterialType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="house_material_type")


class HeatingType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="heating_type")


class GasType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="gas_type")


class WaterSupplyType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="water_supply_type")


class SewerageType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None

    offers: list["Offer"] = Relationship(back_populates="sewerage_type")


class MunicipalityType(BaseModel, table=True):
    id: int | None = Field(primary_key=True)
    name: str | None = Field(index=True)

    municipalities: list["Municipality"] = Relationship(
        back_populates="municipality_type"
    )
