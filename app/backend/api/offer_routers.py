from datetime import datetime
import io
from typing import Literal, Union
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from shapely.geometry import mapping
from geoalchemy2.shape import to_shape
from sqlmodel import and_, asc, case, desc, func, select
import xlsxwriter
from sqlmodel.ext.asyncio.session import AsyncSession

from app.backend.auth_utils.auth import get_current_user
from app.backend.db.config import get_async_session
from sqlalchemy import literal_column

from app.backend.db.models.address import (
    Address,
    AddressRead,
    AddressReadShort,
    District,
    Microdistrict,
    Municipality,
    Region,
    Settlement,
    Street,
)
from app.backend.db.models.address_infrastructure_link import AddressInfrastructureLink, AddressInfrastructureLinkRead
from app.backend.db.models.favorites import Favorites
from app.backend.db.models.infrastructure import Infrastructure
from app.backend.db.models.offer import (
    Offer,
    OfferFavoriteRead,
    OfferRead,
    OfferReadShort,
    OfferReadWithInfrastucture,
    OffersReadWithPagination,
)
from app.backend.db.models.seller import Seller
from app.backend.db.models.types import (
    BathroomType,
    GasType,
    HeatingType,
    HouseMaterialType,
    InfrastructureType,
    LandType,
    OfferType,
    ParkingType,
    PropertyType,
    RenovationType,
    SellerType,
    SewerageType,
    WaterSupplyType,
    WindowViewType,
)
from app.backend.db.models.user import User

offer_router = APIRouter(prefix="/offers", tags=["Offers"])


class OfferQueryParams(BaseModel):
    limit: int = Field(50, ge=1, le=200000)
    offset: int = Field(0, ge=0)

    address_query: str | None = None

    sort_by: Literal["price", "price_per_square_meter", "creation_date_source", "views_count", "total_area"] | None = None
    sort_order: Literal["asc", "desc"] | None = None

    is_new_house: bool | None = None
    has_furniture: bool | None = None
    is_build_complete: bool | None = None
    has_water_supply: bool | None = None
    has_electricity: bool | None = None
    has_gas: bool | None = None
    has_sewerage: bool | None = None
    has_heating: bool | None = None
    has_garbage_chute: bool | None = None
    has_guard: bool | None = None
    has_garage: bool | None = None
    has_bathhouse: bool | None = None
    has_pool: bool | None = None
    has_terrace: bool | None = None
    has_elevator: bool | None = None
    has_balcony: bool | None = None

    min_price: int | None = None
    max_price: int | None = None
    min_total_area: float | None = None
    max_total_area: float | None = None
    min_living_area: float | None = None
    max_living_area: float | None = None
    min_kitchen_area: float | None = None
    max_kitchen_area: float | None = None
    min_floor: int | None = None
    max_floor: int | None = None
    min_house_floors_count: int | None = None
    max_house_floors_count: int | None = None
    min_house_built_year: int | None = None
    max_house_built_year: int | None = None
    min_ceiling_height: float | None = None
    max_ceiling_height: float | None = None
    min_land_area: float | None = None
    max_land_area: float | None = None
    min_price_per_square_meter: int | None = None
    max_price_per_square_meter: int | None = None

    rooms_count: list[int] | None = None
    bathrooms_count: list[int] | None = None
    bedrooms_count: list[int] | None = None
    transport_access_category: list[int] | None = None
    elderly_category: list[int] | None = None
    family_category: list[int] | None = None
    price_category: list[int] | None = None
    offer_type_id: list[int] | None = None
    property_type_id: list[int] | None = None
    bathroom_type_id: list[int] | None = None
    renovation_type_id: list[int] | None = None
    window_view_type_id: list[int] | None = None
    parking_type_id: list[int] | None = None
    house_material_type_id: list[int] | None = None
    heating_type_id: list[int] | None = None
    gas_type_id: list[int] | None = None
    sewerage_type_id: list[int] | None = None
    water_supply_type_id: list[int] | None = None
    seller_id: list[int] | None = None
    land_type_id: list[int] | None = None
    source: list[int] | None = None

    short: bool | None = None


class FilterTypesRead(BaseModel):
    bathroom_types: list[BathroomType]
    renovation_types: list[RenovationType]
    window_view_types: list[WindowViewType]
    parking_types: list[ParkingType]
    house_material_types: list[HouseMaterialType]
    heating_types: list[HeatingType]
    gas_types: list[GasType]
    sewerage_types: list[SewerageType]
    water_supply_types: list[WaterSupplyType]
    land_types: list[LandType]
    offer_types: list[OfferType]
    property_types: list[PropertyType]


@offer_router.get("/export")
async def export_offers_excel(
    current_user: User = Depends(get_current_user),
    params: OfferQueryParams = Query(),
    session: AsyncSession = Depends(get_async_session),
):
    filters = []

    if params.address_query:
        ts_query = " & ".join(f"{w}:*" for w in params.address_query.lower().split() if w.strip())
        address_subquery = (
            select(AddressRead.id).where(AddressRead.search_vector.op("@@")(func.to_tsquery("russian", ts_query))).scalar_subquery()
        )
        filters.append(Offer.address_id.in_(address_subquery))

    for param, param_value in params.model_dump().items():
        if param is not None and type(param_value) is bool and param != "short":
            filters.append(getattr(Offer, param) == param_value)

    range_filters = [
        ("price", "min_price", "max_price"),
        ("total_area", "min_total_area", "max_total_area"),
        ("living_area", "min_living_area", "max_living_area"),
        ("kitchen_area", "min_kitchen_area", "max_kitchen_area"),
        ("floor", "min_floor", "max_floor"),
        ("house_floors_count", "min_house_floors_count", "max_house_floors_count"),
        ("house_built_year", "min_house_built_year", "max_house_built_year"),
        ("ceiling_height", "min_ceiling_height", "max_ceiling_height"),
        ("land_area", "min_land_area", "max_land_area"),
        ("price_per_square_meter", "min_price_per_square_meter", "max_price_per_square_meter"),
    ]

    for field, min_attr, max_attr in range_filters:
        min_val = getattr(params, min_attr)
        max_val = getattr(params, max_attr)
        if min_val is not None:
            filters.append(getattr(Offer, field) >= min_val)
        if max_val is not None:
            filters.append(getattr(Offer, field) <= max_val)

    list_filters = [
        "rooms_count",
        "bathrooms_count",
        "bedrooms_count",
        "transport_access_category",
        "elderly_category",
        "family_category",
        "price_category",
        "offer_type_id",
        "property_type_id",
        "bathroom_type_id",
        "renovation_type_id",
        "window_view_type_id",
        "parking_type_id",
        "house_material_type_id",
        "heating_type_id",
        "gas_type_id",
        "sewerage_type_id",
        "water_supply_type_id",
        "seller_id",
        "land_type_id",
        "source",
    ]

    for field in list_filters:
        values = getattr(params, field)

        if values:
            filters.append(getattr(Offer, field).in_(values))

    sortable_fields = {
        "price": Offer.price,
        "price_per_square_meter": Offer.price_per_square_meter,
        "creation_date_source": Offer.creation_date_source,
        "views_count": Offer.views_count,
        "total_area": Offer.total_area,
    }

    order_clause = None

    if params.sort_by in sortable_fields:
        field = sortable_fields[params.sort_by]

        if params.sort_order == "asc":
            order_clause = asc(field).nulls_last()
        else:
            order_clause = desc(field).nulls_last()
    else:
        order_clause = desc(Offer.creation_date_source).nulls_last()

    filtered_count_stmt = select(func.count(Offer.id))

    if filters:
        filtered_count_stmt = filtered_count_stmt.where(and_(*filters))

    # --- Расстояния до ближайших объектов инфраструктуры по типам ---
    infra_types = await session.exec(select(InfrastructureType).order_by(InfrastructureType.id))
    infra_types = infra_types.all()

    infra_distance_columns: list = []
    infra_distance_headers: list[str] = []
    for infra_type in infra_types:
        infra_distance_columns.append(
            func.min(
                case(
                    (InfrastructureType.id == infra_type.id, AddressInfrastructureLink.distance),
                    else_=None,
                )
            ).label(f"distance_to_{infra_type.id}")
        )
        infra_distance_headers.append(f"Расстояние до {infra_type.name} (м)")

    # --- Построение SELECT без list полей ---
    stmt = (
        select(
            Offer.id,
            Offer.source,
            Offer.price,
            Offer.price_per_square_meter,
            Offer.price_category,
            Offer.total_area,
            Offer.living_area,
            Offer.kitchen_area,
            Offer.floor,
            Offer.house_floors_count,
            Offer.ceiling_height,
            Offer.is_new_house,
            Offer.house_built_year,
            Offer.is_build_complete,
            Offer.has_water_supply,
            Offer.has_electricity,
            Offer.has_gas,
            Offer.has_sewerage,
            Offer.has_heating,
            Offer.elevators_count,
            Offer.has_elevator,
            Offer.balconies_count,
            Offer.has_balcony,
            Offer.has_garbage_chute,
            Offer.has_furniture,
            Offer.has_guard,
            Offer.has_garage,
            Offer.has_bathhouse,
            Offer.has_pool,
            Offer.has_terrace,
            Offer.title,
            Offer.description,
            Offer.url,
            Offer.transport_access_score,
            Offer.transport_access_category,
            Offer.elderly_score,
            Offer.elderly_category,
            Offer.family_score,
            Offer.family_category,
            Offer.views_count,
            Offer.daily_views_count,
            Offer.last_ten_days_views_count,
            Offer.contact_phone,
            Offer.creation_date_source,
            Offer.update_date_source,
            Offer.update_date,
            Region.name,
            Municipality.name,
            Settlement.name,
            District.name,
            Street.name,
            Address.house_number,
            Address.full_address,
            func.ST_X(literal_column("address.coordinates::geometry")).label("longitude"),
            func.ST_Y(literal_column("address.coordinates::geometry")).label("latitude"),
            Seller.name,
            Seller.rating,
            Seller.foundation_date,
            SellerType.name,
            OfferType.name,
            PropertyType.name,
            LandType.name,
            BathroomType.name,
            RenovationType.name,
            WindowViewType.name,
            ParkingType.name,
            HouseMaterialType.name,
            HeatingType.name,
            GasType.name,
            SewerageType.name,
            WaterSupplyType.name,
            *infra_distance_columns,
        )
        .join(Address, Offer.address_id == Address.id)
        .outerjoin(Region, Address.region_id == Region.id)
        .outerjoin(Municipality, Address.municipality_id == Municipality.id)
        .outerjoin(Settlement, Address.settlement_id == Settlement.id)
        .outerjoin(District, Address.district_id == District.id)
        .outerjoin(Street, Address.street_id == Street.id)
        .outerjoin(Seller, Offer.seller_id == Seller.id)
        .outerjoin(SellerType, Seller.seller_type_id == SellerType.id)
        .outerjoin(OfferType, Offer.offer_type_id == OfferType.id)
        .outerjoin(PropertyType, Offer.property_type_id == PropertyType.id)
        .outerjoin(LandType, Offer.land_type_id == LandType.id)
        .outerjoin(BathroomType, Offer.bathroom_type_id == BathroomType.id)
        .outerjoin(RenovationType, Offer.renovation_type_id == RenovationType.id)
        .outerjoin(WindowViewType, Offer.window_view_type_id == WindowViewType.id)
        .outerjoin(ParkingType, Offer.parking_type_id == ParkingType.id)
        .outerjoin(HouseMaterialType, Offer.house_material_type_id == HouseMaterialType.id)
        .outerjoin(HeatingType, Offer.heating_type_id == HeatingType.id)
        .outerjoin(GasType, Offer.gas_type_id == GasType.id)
        .outerjoin(SewerageType, Offer.sewerage_type_id == SewerageType.id)
        .outerjoin(WaterSupplyType, Offer.water_supply_type_id == WaterSupplyType.id)
        .outerjoin(AddressInfrastructureLink, Address.id == AddressInfrastructureLink.address_id)
        .outerjoin(Infrastructure, AddressInfrastructureLink.infrastructure_id == Infrastructure.id)
        .outerjoin(InfrastructureType, Infrastructure.infrastructure_type_id == InfrastructureType.id)
        .group_by(
            Offer.id,
            Address.id,
            Region.id,
            Municipality.id,
            Settlement.id,
            District.id,
            Street.id,
            Seller.id,
            SellerType.id,
            OfferType.id,
            PropertyType.id,
            LandType.id,
            BathroomType.id,
            RenovationType.id,
            WindowViewType.id,
            ParkingType.id,
            HouseMaterialType.id,
            HeatingType.id,
            GasType.id,
            SewerageType.id,
            WaterSupplyType.id,
        )
        .order_by(order_clause)
    )

    if filters:
        stmt = stmt.where(and_(*filters))

    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {"in_memory": True, "remove_timezone": True, "strings_to_urls": False})
    worksheet = workbook.add_worksheet(
        "Offers",
    )

    # --- Заголовки (в том же порядке, что SELECT) ---
    headers = [
        "ID",
        "Источник",
        "Цена",
        "Цена за кв.м",
        "Ценовая категория",
        "Общая площадь",
        "Жилая площадь",
        "Площадь кухни",
        "Этаж",
        "Этажность дома",
        "Высота потолков",
        "Новостройка",
        "Год постройки дома",
        "Строительство завершено",
        "Водоснабжение",
        "Электричество",
        "Газ",
        "Канализация",
        "Отопление",
        "Количество лифтов",
        "Лифт",
        "Количество балконов",
        "Балкон",
        "Мусоропровод",
        "Мебель",
        "Охрана",
        "Гараж",
        "Баня",
        "Бассейн",
        "Терраса",
        "Заголовок",
        "Описание",
        "URL",
        "Транспортная доступность (балл)",
        "Транспортная доступность (категория)",
        "Для пожилых (балл)",
        "Для пожилых (категория)",
        "Для семей (балл)",
        "Для семей (категория)",
        "Количество просмотров",
        "Просмотров за день",
        "Просмотров за 10 дней",
        "Контактный телефон",
        "Дата создания (источник)",
        "Дата обновления (источник)",
        "Дата обновления (система)",
        "Регион",
        "Муниципалитет",
        "Населенный пункт",
        "Район",
        "Улица",
        "Номер дома",
        "Полный адрес",
        "Координаты (долгота)",
        "Координаты (широта)",
        "Продавец",
        "Рейтинг продавца",
        "Год начала работы",
        "Тип продавца",
        "Тип предложения",
        "Тип недвижимости",
        "Тип участка",
        "Тип санузла",
        "Тип ремонта",
        "Вид из окон",
        "Тип парковки",
        "Материал дома",
        "Тип отопления",
        "Тип газа",
        "Тип канализации",
        "Тип водоснабжения",
    ]
    headers.extend(infra_distance_headers)
    worksheet.write_row(0, 0, headers)
    row_index = 1

    # --- bool конвертер ---
    def bool_to_str(v):
        if v is True:
            return "Да"
        if v is False:
            return "Нет"
        return ""

    # --- Стриминг данных ---
    result = await session.stream(stmt)

    async for row in result:
        row = list(row)

        # Индексы колонок, которые boolean
        bool_indexes = [11, 13, 14, 15, 16, 17, 18, 20, 22, 23, 24, 25, 26, 27, 28]
        for idx in bool_indexes:
            row[idx] = bool_to_str(row[idx])

        # --- Записываем в Excel ---
        clean_row = []
        for value in row:
            if isinstance(value, datetime) and value.tzinfo is not None:
                value = value.replace(tzinfo=None)
            if value is None:
                value = ""
            clean_row.append(value)

        worksheet.write_row(row_index, 0, clean_row)
        row_index += 1

    workbook.close()
    output.seek(0)

    filename = f"offers_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@offer_router.get("", response_model=Union[list[OfferReadShort], OffersReadWithPagination])
async def get_offers(
    current_user: User = Depends(get_current_user),
    params: OfferQueryParams = Query(),
    session: AsyncSession = Depends(get_async_session),
):
    total_count_stmt = select(func.count(Offer.id))
    total_result = await session.exec(total_count_stmt)
    total_count = total_result.first()

    filters = []

    limit = params.limit
    offset = params.offset

    if params.address_query:
        ts_query = " & ".join(f"{w}:*" for w in params.address_query.lower().split() if w.strip())
        address_subquery = (
            select(AddressRead.id).where(AddressRead.search_vector.op("@@")(func.to_tsquery("russian", ts_query))).scalar_subquery()
        )
        filters.append(Offer.address_id.in_(address_subquery))

    for param, param_value in params.model_dump().items():
        if param is not None and type(param_value) is bool and param != "short":
            filters.append(getattr(Offer, param) == param_value)

    range_filters = [
        ("price", "min_price", "max_price"),
        ("total_area", "min_total_area", "max_total_area"),
        ("living_area", "min_living_area", "max_living_area"),
        ("kitchen_area", "min_kitchen_area", "max_kitchen_area"),
        ("floor", "min_floor", "max_floor"),
        ("house_floors_count", "min_house_floors_count", "max_house_floors_count"),
        ("house_built_year", "min_house_built_year", "max_house_built_year"),
        ("ceiling_height", "min_ceiling_height", "max_ceiling_height"),
        ("land_area", "min_land_area", "max_land_area"),
        ("price_per_square_meter", "min_price_per_square_meter", "max_price_per_square_meter"),
    ]

    for field, min_attr, max_attr in range_filters:
        min_val = getattr(params, min_attr)
        max_val = getattr(params, max_attr)
        if min_val is not None:
            filters.append(getattr(Offer, field) >= min_val)
        if max_val is not None:
            filters.append(getattr(Offer, field) <= max_val)

    list_filters = [
        "rooms_count",
        "bathrooms_count",
        "bedrooms_count",
        "transport_access_category",
        "elderly_category",
        "family_category",
        "price_category",
        "offer_type_id",
        "property_type_id",
        "bathroom_type_id",
        "renovation_type_id",
        "window_view_type_id",
        "parking_type_id",
        "house_material_type_id",
        "heating_type_id",
        "gas_type_id",
        "sewerage_type_id",
        "water_supply_type_id",
        "seller_id",
        "land_type_id",
        "source",
    ]

    for field in list_filters:
        values = getattr(params, field)

        if values:
            filters.append(getattr(Offer, field).in_(values))

    sortable_fields = {
        "price": Offer.price,
        "price_per_square_meter": Offer.price_per_square_meter,
        "creation_date_source": Offer.creation_date_source,
        "views_count": Offer.views_count,
        "total_area": Offer.total_area,
    }

    order_clause = None

    if params.sort_by in sortable_fields:
        field = sortable_fields[params.sort_by]

        if params.sort_order == "asc":
            order_clause = asc(field).nulls_last()
        else:
            order_clause = desc(field).nulls_last()
    else:
        order_clause = desc(Offer.creation_date_source).nulls_last()

    filtered_count_stmt = select(func.count(Offer.id))

    if filters:
        filtered_count_stmt = filtered_count_stmt.where(and_(*filters))
    filtered_result = await session.exec(filtered_count_stmt)
    filtered_count = filtered_result.first()

    if params.short:
        stmt = (
            select(
                Offer.id,
                Offer.title,
                Offer.total_area,
                Offer.is_new_house,
                Offer.price_category,
                Offer.price,
                Offer.images_urls,
                Address.full_address,
                Address.coordinates,
                Address.house_number,
            )
            .join(Offer.address)
            .order_by(order_clause)
        )
        if filters:
            stmt = stmt.where(and_(*filters))
        stmt = stmt.limit(limit).offset(offset)
        result = await session.exec(stmt)
        rows = result.all()

        return [
            OfferReadShort(
                id=row[0],
                title=row[1],
                total_area=row[2],
                is_new_house=row[3],
                price_category=row[4],
                price=row[5],
                image_url=row[6][0] if row[6] else None,
                address=AddressReadShort(full_address=row[7], coordinates=row[8], house_number=row[9]),
            )
            for row in rows
        ]
    else:
        stmt = select(Offer).order_by(order_clause)
        if filters:
            stmt = stmt.where(and_(*filters))
        stmt = stmt.limit(limit).offset(offset)
        result = await session.exec(stmt)
        offers = result.all()

        has_more = offset + len(offers) < filtered_count
        return OffersReadWithPagination(
            offers=offers,
            total_count=total_count,
            total_filtered=filtered_count,
            limit=limit,
            offset=offset,
            has_more=has_more,
        )


@offer_router.get("/autocomplete")
async def autocomplete_addresses(
    current_user: User = Depends(get_current_user),
    q: str = Query(min_length=1),
    session: AsyncSession = Depends(get_async_session),
) -> list[str]:
    ts_query = " & ".join(f"{w}:*" for w in q.lower().split() if w.strip())
    search_q = func.to_tsquery("russian", ts_query)

    stmt = (
        select(Address.full_address)
        .where(Address.search_vector.op("@@")(search_q))
        .order_by(func.ts_rank_cd(Address.search_vector, search_q).desc())
        .limit(10)
    )

    results = await session.exec(stmt)
    return [r for r in results.all()]


@offer_router.get("/filter_types", response_model=FilterTypesRead)
async def get_all_types(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    bathroom_types = await session.exec(select(BathroomType).order_by((BathroomType.name)))
    renovation_types = await session.exec(select(RenovationType).order_by((RenovationType.name)))
    window_view_types = await session.exec(select(WindowViewType).order_by((WindowViewType.name)))
    parking_types = await session.exec(select(ParkingType).order_by((ParkingType.name)))
    house_material_types = await session.exec(select(HouseMaterialType).order_by((HouseMaterialType.name)))
    heating_types = await session.exec(select(HeatingType).order_by((HeatingType.name)))
    gas_types = await session.exec(select(GasType).order_by((GasType.name)))
    sewerage_types = await session.exec(select(SewerageType).order_by((SewerageType.name)))
    water_supply_types = await session.exec(select(WaterSupplyType).order_by((WaterSupplyType.name)))
    land_types = await session.exec(select(LandType).order_by((LandType.name)))
    offer_types = await session.exec(select(OfferType).order_by((OfferType.name)))
    property_types = await session.exec(select(PropertyType).order_by(desc(PropertyType.id)))
    return FilterTypesRead(
        bathroom_types=bathroom_types.all(),
        renovation_types=renovation_types.all(),
        window_view_types=window_view_types.all(),
        parking_types=parking_types.all(),
        house_material_types=house_material_types.all(),
        heating_types=heating_types.all(),
        gas_types=gas_types.all(),
        sewerage_types=sewerage_types.all(),
        water_supply_types=water_supply_types.all(),
        land_types=land_types.all(),
        offer_types=offer_types.all(),
        property_types=property_types.all(),
    )


@offer_router.get("/autocomplete-filters")
async def autocomplete(
    current_user: User = Depends(get_current_user),
    q: str = Query(min_length=1),
    type: Literal["region", "municipality", "settlement", "street", "district", "microdistrict"] = Query(),
    session: AsyncSession = Depends(get_async_session),
) -> list[str]:
    query_like = f"%{q}%"
    limit = 10
    if type == "region":
        stmt = select(Region.short_name).where(Region.short_name.ilike(query_like))
    elif type == "municipality":
        stmt = select(Municipality.short_name).where(Municipality.short_name.ilike(query_like))
    elif type == "settlement":
        stmt = select(Settlement.short_name).where(Settlement.short_name.ilike(query_like))
    elif type == "district":
        stmt = select(District.short_name).where(District.short_name.ilike(query_like))
    elif type == "microdistrict":
        stmt = select(Microdistrict.short_name).where(Microdistrict.short_name.ilike(query_like))
    elif type == "street":
        stmt = select(Street.short_name).where(Street.short_name.ilike(query_like))
    else:
        raise HTTPException(status_code=400, detail="Invalid type")

    res = await session.exec(stmt.limit(limit))
    results = res.all()

    return results


@offer_router.get("/{offer_id}", response_model=OfferReadWithInfrastucture)
async def get_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    res = await session.exec(select(Offer).where(Offer.id == offer_id))

    def get_all_infrastructure(links: list[AddressInfrastructureLink]):
        result = []

        for link in links:
            infra = link.infrastructure
            if not infra:
                continue

            result.append(
                AddressInfrastructureLinkRead(
                    name=infra.name,
                    type=infra.infrastructure_type,
                    distance=link.distance,
                    coordinates=list(mapping(to_shape(infra.coordinates))["coordinates"]) if infra.coordinates else None,
                )
            )

        return result

    offer = res.first()

    if not offer:
        raise HTTPException(status_code=404, detail="Объект не найден")

    return OfferReadWithInfrastucture.model_validate(
        offer,
        update={
            "infrastructures": get_all_infrastructure(offer.address.infrastructure_links),
        },
    )


@offer_router.delete("/favorites/{offer_id}")
async def delete_from_favorites(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):

    if offer_id not in [favorite.offer_id for favorite in current_user.offer_links]:
        raise HTTPException(status_code=400, detail="Не в избранном")
    try:
        result = await session.exec(select(Favorites).where(Favorites.user_id == current_user.id, Favorites.offer_id == offer_id))
        offer_for_delete = result.first()
        await session.delete(offer_for_delete)
        await session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Объект успешно удален из избранного"}


@offer_router.post("/favorites/{offer_id}")
async def add_to_favorites(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    res = await session.exec(select(Offer.id).where(Offer.id == offer_id))
    offer = res.first()
    if not offer:
        raise HTTPException(status_code=404, detail="Объект не найден")
    if offer_id in [favorite.offer_id for favorite in current_user.offer_links]:
        raise HTTPException(status_code=400, detail="Уже в избранном")
    else:
        try:
            favorite = Favorites(user_id=current_user.id, offer_id=offer_id)
            session.add(favorite)
            await session.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Объект успешно добавлен в избранное"}


@offer_router.get("/favorites/", response_model=list[OfferFavoriteRead])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    def get_nearest_infrastructure(links: list[AddressInfrastructureLink]):
        result: dict[int, AddressInfrastructureLink] = {}

        for link in links:
            infra = link.infrastructure
            if not infra:
                continue

            type_id = infra.infrastructure_type_id

            if type_id not in result or (
                link.distance is not None and (result[type_id].distance is None or link.distance < result[type_id].distance)
            ):
                result[type_id] = link

        return list(result.values())

    return [
        OfferFavoriteRead.model_validate(
            favorite.offer,
            update={
                "added_date": favorite.added_date,
                "infrastructures": [
                    AddressInfrastructureLinkRead(
                        name=infra.infrastructure.name,
                        type=infra.infrastructure.infrastructure_type,
                        distance=infra.distance,
                        coordinates=list(mapping(to_shape(infra.infrastructure.coordinates))["coordinates"])
                        if infra.infrastructure.coordinates
                        else None,
                    )
                    for infra in get_nearest_infrastructure(favorite.offer.address.infrastructure_links)
                ],
            },
        )
        for favorite in current_user.offer_links
    ]
