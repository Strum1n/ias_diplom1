from sqlmodel import Field, Relationship

from app.backend.db.config import BaseModel


class TypeBase(BaseModel):
    id: int | None = Field(primary_key=True)
    name: str


class SellerType(TypeBase, table=True):
    sellers: list["Seller"] = Relationship(back_populates="seller_type")


class OfferType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="offer_type")


class PropertyType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="property_type")


class LandType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="land_type")


class RenovationType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="renovation_type")


class BathroomType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="bathroom_type")


class WindowViewType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="window_view_type")


class ParkingType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="parking_type")


class HouseMaterialType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="house_material_type")


class HeatingType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="heating_type")


class GasType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="gas_type")


class WaterSupplyType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="water_supply_type")


class SewerageType(TypeBase, table=True):
    offers: list["Offer"] = Relationship(back_populates="sewerage_type")


class MunicipalityType(TypeBase, table=True):
    municipalities: list["Municipality"] = Relationship(back_populates="municipality_type")


class PartnershipType(TypeBase, table=True):
    partnerships: list["Partnership"] = Relationship(back_populates="partnership_type")


class SettlementType(TypeBase, table=True):
    settlements: list["Settlement"] = Relationship(back_populates="settlement_type")


class StreetType(TypeBase, table=True):
    streets: list["Street"] = Relationship(back_populates="street_type")


class InfrastructureType(TypeBase, table=True):
    infrastructures: list["Infrastructure"] = Relationship(back_populates="infrastructure_type")


class Role(TypeBase, table=True):
    users: list["User"] = Relationship(back_populates="role")
