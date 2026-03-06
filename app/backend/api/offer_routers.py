import csv
import io
from typing import Annotated, Literal, cast
from wsgiref import headers
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from shapely import Geometry
from sqlalchemy.orm import selectinload
from sqlmodel import and_, asc, desc, select, text
import xlsxwriter
from app.backend.auth_utils.auth import oauth2_scheme
from sqlmodel.ext.asyncio.session import AsyncSession
from app.backend.api.response_models import (
    OfferResponseFull,
    OfferResponseWithPagination,
)
from app.backend.auth_utils.auth import get_current_user
from app.backend.db.config import get_async_session
from app.backend.db.models1 import *
from sqlalchemy import literal_column

offer_router = APIRouter(prefix="/offers", tags=["Offers"])


@offer_router.get("/export")
async def export_offers_excel(
    session: AsyncSession = Depends(get_async_session),
    address_query: Optional[str] = None,
    sort_by: Optional[str] = Query(
        None,
        description="Field to sort by: price, price_per_square_meter, creation_date_source, views_count, total_area",
    ),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    is_new_house: Optional[bool] = None,
    has_furniture: Optional[bool] = None,
    is_build_complete: Optional[bool] = None,
    has_water_supply: Optional[bool] = None,
    has_electricity: Optional[bool] = None,
    has_gas: Optional[bool] = None,
    has_sewerage: Optional[bool] = None,
    has_heating: Optional[bool] = None,
    has_garbage_chute: Optional[bool] = None,
    has_guard: Optional[bool] = None,
    has_garage: Optional[bool] = None,
    has_bathhouse: Optional[bool] = None,
    has_pool: Optional[bool] = None,
    has_terrace: Optional[bool] = None,
    has_elevator: Optional[bool] = None,
    has_balcony: Optional[bool] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_price_per_square_meter: Optional[int] = None,
    max_price_per_square_meter: Optional[int] = None,
    min_total_area: Optional[float] = None,
    max_total_area: Optional[float] = None,
    min_living_area: Optional[float] = None,
    max_living_area: Optional[float] = None,
    min_kitchen_area: Optional[float] = None,
    max_kitchen_area: Optional[float] = None,
    min_floor: Optional[int] = None,
    max_floor: Optional[int] = None,
    min_house_floors_count: Optional[int] = None,
    max_house_floors_count: Optional[int] = None,
    min_house_built_year: Optional[int] = None,
    max_house_built_year: Optional[int] = None,
    min_ceiling_height: Optional[float] = None,
    max_ceiling_height: Optional[float] = None,
    min_land_area: Optional[float] = None,
    max_land_area: Optional[float] = None,
    rooms_count: Optional[List[int]] = Query(None),
    bathrooms_count: Optional[List[int]] = Query(None),
    bedrooms_count: Optional[List[int]] = Query(None),
    transport_access_category: Optional[List[str]] = Query(None),
    elderly_category: Optional[List[str]] = Query(None),
    family_category: Optional[List[str]] = Query(None),
    price_category: Optional[List[str]] = Query(None),
    offer_type: Optional[List[int]] = Query(None),
    property_type: Optional[List[int]] = Query(None),
    bathroom_type: Optional[List[int]] = Query(None),
    renovation_type: Optional[List[int]] = Query(None),
    window_view_type: Optional[List[int]] = Query(None),
    parking_type: Optional[List[int]] = Query(None),
    house_material_type: Optional[List[int]] = Query(None),
    heating_type: Optional[List[int]] = Query(None),
    gas_type: Optional[List[int]] = Query(None),
    sewerage_type: Optional[List[int]] = Query(None),
    water_supply_type: Optional[List[int]] = Query(None),
    seller_id: Optional[List[int]] = Query(None),
    land_type: Optional[List[int]] = Query(None),
    source: Optional[List[str]] = Query(None),
):
    filters = []

    # --- Boolean filters ---
    bool_filters = {
        "is_new_house": is_new_house,
        "has_furniture": has_furniture,
        "is_build_complete": is_build_complete,
        "has_water_supply": has_water_supply,
        "has_electricity": has_electricity,
        "has_gas": has_gas,
        "has_sewerage": has_sewerage,
        "has_heating": has_heating,
        "has_garbage_chute": has_garbage_chute,
        "has_guard": has_guard,
        "has_garage": has_garage,
        "has_bathhouse": has_bathhouse,
        "has_pool": has_pool,
        "has_terrace": has_terrace,
        "has_elevator": has_elevator,
        "has_balcony": has_balcony,
    }
    for field, value in bool_filters.items():
        if value is not None:
            filters.append(getattr(Offer, field) == value)

    # --- Range filters ---
    range_filters = [
        (Offer.price, min_price, max_price),
        (
            Offer.price_per_square_meter,
            min_price_per_square_meter,
            max_price_per_square_meter,
        ),
        (Offer.total_area, min_total_area, max_total_area),
        (Offer.living_area, min_living_area, max_living_area),
        (Offer.kitchen_area, min_kitchen_area, max_kitchen_area),
        (Offer.floor, min_floor, max_floor),
        (Offer.house_floors_count, min_house_floors_count, max_house_floors_count),
        (Offer.house_built_year, min_house_built_year, max_house_built_year),
        (Offer.ceiling_height, min_ceiling_height, max_ceiling_height),
        (Offer.land_area, min_land_area, max_land_area),
    ]
    for field, min_val, max_val in range_filters:
        if min_val is not None:
            filters.append(field >= min_val)
        if max_val is not None:
            filters.append(field <= max_val)

    # --- List filters ---
    list_filters = {
        "rooms_count": rooms_count,
        "bathrooms_count": bathrooms_count,
        "bedrooms_count": bedrooms_count,
        "transport_access_category": transport_access_category,
        "elderly_category": elderly_category,
        "family_category": family_category,
        "price_category": price_category,
        "offer_type_id": offer_type,
        "property_type_id": property_type,
        "bathroom_type_id": bathroom_type,
        "renovation_type_id": renovation_type,
        "window_view_type_id": window_view_type,
        "parking_type_id": parking_type,
        "house_material_type_id": house_material_type,
        "heating_type_id": heating_type,
        "gas_type_id": gas_type,
        "sewerage_type_id": sewerage_type,
        "water_supply_type_id": water_supply_type,
        "seller_id": seller_id,
        "land_type_id": land_type,
        "source": source,
    }
    for field, values in list_filters.items():
        if values:
            filters.append(getattr(Offer, field).in_(values))

    # --- Address search (partial) ---
    if address_query:
        ts_query = " & ".join(
            f"{w}:*" for w in address_query.lower().split() if w.strip()
        )
        address_subquery = (
            select(Address.id)
            .where(Address.search_vector.op("@@")(func.to_tsquery("russian", ts_query)))
            .scalar_subquery()
        )
        filters.append(Offer.address_id.in_(address_subquery))

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
            func.ST_X(literal_column("address.coordinates::geometry")).label(
                "longitude"
            ),
            func.ST_Y(literal_column("address.coordinates::geometry")).label(
                "latitude"
            ),
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
        .outerjoin(
            HouseMaterialType, Offer.house_material_type_id == HouseMaterialType.id
        )
        .outerjoin(HeatingType, Offer.heating_type_id == HeatingType.id)
        .outerjoin(GasType, Offer.gas_type_id == GasType.id)
        .outerjoin(SewerageType, Offer.sewerage_type_id == SewerageType.id)
        .outerjoin(WaterSupplyType, Offer.water_supply_type_id == WaterSupplyType.id)
        .order_by(desc(Offer.creation_date_source).nulls_last())
    )

    if filters:
        stmt = stmt.where(and_(*filters))

    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(
        output, {"in_memory": True, "remove_timezone": True, "strings_to_urls": False}
    )
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
        "Год основания продавца",
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


@offer_router.get("", response_model=OfferResponseWithPagination)
async def get_offers(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(50, ge=1, le=100000),
    offset: int = Query(0, ge=0),
    address_query: Optional[str] = None,
    sort_by: Optional[str] = Query(
        None,
        description="Field to sort by: price, price_per_square_meter, creation_date_source, views_count, total_area",
    ),
    sort_order: Optional[str] = Query(
        "desc",
        description="Sort order: asc or desc",
    ),
    is_new_house: Optional[bool] = None,
    has_furniture: Optional[bool] = None,
    is_build_complete: Optional[bool] = None,
    has_water_supply: Optional[bool] = None,
    has_electricity: Optional[bool] = None,
    has_gas: Optional[bool] = None,
    has_sewerage: Optional[bool] = None,
    has_heating: Optional[bool] = None,
    has_garbage_chute: Optional[bool] = None,
    has_guard: Optional[bool] = None,
    has_garage: Optional[bool] = None,
    has_bathhouse: Optional[bool] = None,
    has_pool: Optional[bool] = None,
    has_terrace: Optional[bool] = None,
    has_elevator: Optional[bool] = None,
    has_balcony: Optional[bool] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_total_area: Optional[float] = None,
    max_total_area: Optional[float] = None,
    min_living_area: Optional[float] = None,
    max_living_area: Optional[float] = None,
    min_kitchen_area: Optional[float] = None,
    max_kitchen_area: Optional[float] = None,
    min_floor: Optional[int] = None,
    max_floor: Optional[int] = None,
    min_house_floors_count: Optional[int] = None,
    max_house_floors_count: Optional[int] = None,
    min_house_built_year: Optional[int] = None,
    max_house_built_year: Optional[int] = None,
    min_ceiling_height: Optional[float] = None,
    max_ceiling_height: Optional[float] = None,
    min_land_area: Optional[float] = None,
    max_land_area: Optional[float] = None,
    min_price_per_square_meter: Optional[int] = None,
    max_price_per_square_meter: Optional[int] = None,
    rooms_count: Optional[List[int]] = Query(None),
    bathrooms_count: Optional[List[int]] = Query(None),
    bedrooms_count: Optional[List[int]] = Query(None),
    transport_access_category: Optional[List[str]] = Query(None),
    elderly_category: Optional[List[str]] = Query(None),
    family_category: Optional[List[str]] = Query(None),
    price_category: Optional[List[str]] = Query(None),
    offer_type: Optional[List[int]] = Query(None),
    property_type: Optional[List[int]] = Query(None),
    bathroom_type: Optional[List[int]] = Query(None),
    renovation_type: Optional[List[int]] = Query(None),
    window_view_type: Optional[List[int]] = Query(None),
    parking_type: Optional[List[int]] = Query(None),
    house_material_type: Optional[List[int]] = Query(None),
    heating_type: Optional[List[int]] = Query(None),
    gas_type: Optional[List[int]] = Query(None),
    sewerage_type: Optional[List[int]] = Query(None),
    water_supply_type: Optional[List[int]] = Query(None),
    seller_id: Optional[List[int]] = Query(None),
    land_type: Optional[List[int]] = Query(None),
    source: Optional[List[str]] = Query(None),
):
    total_count_stmt = select(func.count(Offer.id))
    total_result = await session.exec(total_count_stmt)
    total_count = total_result.first()

    filters = []

    if address_query:
        ts_query = " & ".join(
            f"{w}:*" for w in address_query.lower().split() if w.strip()
        )
        address_subquery = (
            select(Address.id)
            .where(Address.search_vector.op("@@")(func.to_tsquery("russian", ts_query)))
            .scalar_subquery()
        )
        filters.append(Offer.address_id.in_(address_subquery))

    bool_filters = {
        "is_new_house": is_new_house,
        "has_furniture": has_furniture,
        "is_build_complete": is_build_complete,
        "has_water_supply": has_water_supply,
        "has_electricity": has_electricity,
        "has_gas": has_gas,
        "has_sewerage": has_sewerage,
        "has_heating": has_heating,
        "has_garbage_chute": has_garbage_chute,
        "has_guard": has_guard,
        "has_garage": has_garage,
        "has_bathhouse": has_bathhouse,
        "has_pool": has_pool,
        "has_terrace": has_terrace,
        "has_elevator": has_elevator,
        "has_balcony": has_balcony,
    }

    for field, value in bool_filters.items():
        if value is not None:
            filters.append(getattr(Offer, field) == value)

    range_filters = [
        ("price", min_price, max_price),
        ("total_area", min_total_area, max_total_area),
        ("living_area", min_living_area, max_living_area),
        ("kitchen_area", min_kitchen_area, max_kitchen_area),
        ("floor", min_floor, max_floor),
        ("house_floors_count", min_house_floors_count, max_house_floors_count),
        ("house_built_year", min_house_built_year, max_house_built_year),
        ("ceiling_height", min_ceiling_height, max_ceiling_height),
        ("land_area", min_land_area, max_land_area),
        (
            "price_per_square_meter",
            min_price_per_square_meter,
            max_price_per_square_meter,
        ),
    ]
    for field, min_val, max_val in range_filters:
        if min_val is not None:
            filters.append(getattr(Offer, field) >= min_val)
        if max_val is not None:
            filters.append(getattr(Offer, field) <= max_val)

    list_filters = {
        "rooms_count": rooms_count,
        "bathrooms_count": bathrooms_count,
        "bedrooms_count": bedrooms_count,
        "transport_access_category": transport_access_category,
        "elderly_category": elderly_category,
        "family_category": family_category,
        "price_category": price_category,
        "offer_type_id": offer_type,
        "property_type_id": property_type,
        "bathroom_type_id": bathroom_type,
        "renovation_type_id": renovation_type,
        "window_view_type_id": window_view_type,
        "parking_type_id": parking_type,
        "house_material_type_id": house_material_type,
        "heating_type_id": heating_type,
        "gas_type_id": gas_type,
        "sewerage_type_id": sewerage_type,
        "water_supply_type_id": water_supply_type,
        "seller_id": seller_id,
        "land_type_id": land_type,
        "source": source,  # 👈 ВОТ ЭТО
    }
    for field, values in list_filters.items():
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

    if sort_by in sortable_fields:
        field = sortable_fields[sort_by]

        if sort_order == "asc":
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

    stmt = select(Offer).order_by(order_clause)
    if filters:
        stmt = stmt.where(and_(*filters))
    stmt = stmt.limit(limit).offset(offset)
    result = await session.exec(stmt)
    offers = result.all()

    has_more = offset + len(offers) < filtered_count

    return {
        "total_count": total_count,
        "filtered_count": filtered_count,
        "offers": offers,
        "pagination": {"limit": limit, "offset": offset, "has_more": has_more},
    }


@offer_router.get("/offers_for_map")
async def get_offers_for_map(
    session: AsyncSession = Depends(get_async_session),
    address_query: Optional[str] = None,
    is_new_house: Optional[bool] = None,
    has_furniture: Optional[bool] = None,
    is_build_complete: Optional[bool] = None,
    has_water_supply: Optional[bool] = None,
    has_electricity: Optional[bool] = None,
    has_gas: Optional[bool] = None,
    has_sewerage: Optional[bool] = None,
    has_heating: Optional[bool] = None,
    has_garbage_chute: Optional[bool] = None,
    has_guard: Optional[bool] = None,
    has_garage: Optional[bool] = None,
    has_bathhouse: Optional[bool] = None,
    has_pool: Optional[bool] = None,
    has_terrace: Optional[bool] = None,
    has_elevator: Optional[bool] = None,
    has_balcony: Optional[bool] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_total_area: Optional[float] = None,
    max_total_area: Optional[float] = None,
    min_living_area: Optional[float] = None,
    max_living_area: Optional[float] = None,
    min_kitchen_area: Optional[float] = None,
    max_kitchen_area: Optional[float] = None,
    min_floor: Optional[int] = None,
    max_floor: Optional[int] = None,
    min_house_floors_count: Optional[int] = None,
    max_house_floors_count: Optional[int] = None,
    min_house_built_year: Optional[int] = None,
    max_house_built_year: Optional[int] = None,
    min_ceiling_height: Optional[float] = None,
    max_ceiling_height: Optional[float] = None,
    min_land_area: Optional[float] = None,
    max_land_area: Optional[float] = None,
    min_price_per_square_meter: Optional[int] = None,
    max_price_per_square_meter: Optional[int] = None,
    rooms_count: Optional[List[int]] = Query(None),
    bathrooms_count: Optional[List[int]] = Query(None),
    bedrooms_count: Optional[List[int]] = Query(None),
    transport_access_category: Optional[List[str]] = Query(None),
    elderly_category: Optional[List[str]] = Query(None),
    family_category: Optional[List[str]] = Query(None),
    price_category: Optional[List[str]] = Query(None),
    offer_type: Optional[List[int]] = Query(None),
    property_type: Optional[List[int]] = Query(None),
    bathroom_type: Optional[List[int]] = Query(None),
    renovation_type: Optional[List[int]] = Query(None),
    window_view_type: Optional[List[int]] = Query(None),
    parking_type: Optional[List[int]] = Query(None),
    house_material_type: Optional[List[int]] = Query(None),
    heating_type: Optional[List[int]] = Query(None),
    gas_type: Optional[List[int]] = Query(None),
    sewerage_type: Optional[List[int]] = Query(None),
    water_supply_type: Optional[List[int]] = Query(None),
    seller_id: Optional[List[int]] = Query(None),
    land_type: Optional[List[int]] = Query(None),
    source: Optional[List[str]] = Query(None),
    sw_lat: Optional[float] = Query(None),
    sw_lng: Optional[float] = Query(None),
    ne_lat: Optional[float] = Query(None),
    ne_lng: Optional[float] = Query(None),
    limit: int = 100000,
):
    where_clauses = []
    params = {}

    if address_query:
        ts_query = " & ".join(
            f"{w}:*" for w in address_query.lower().split() if w.strip()
        )
        where_clauses.append("""
            a.id IN (
                SELECT id FROM address 
                WHERE search_vector @@ to_tsquery('russian', :ts_query)
            )
        """)
        params["ts_query"] = ts_query

    bool_filters = {
        "is_new_house": is_new_house,
        "has_furniture": has_furniture,
        "is_build_complete": is_build_complete,
        "has_water_supply": has_water_supply,
        "has_electricity": has_electricity,
        "has_gas": has_gas,
        "has_sewerage": has_sewerage,
        "has_heating": has_heating,
        "has_garbage_chute": has_garbage_chute,
        "has_guard": has_guard,
        "has_garage": has_garage,
        "has_bathhouse": has_bathhouse,
        "has_pool": has_pool,
        "has_terrace": has_terrace,
        "has_elevator": has_elevator,
        "has_balcony": has_balcony,
    }
    for field, value in bool_filters.items():
        if value is not None:
            where_clauses.append(f"o.{field} = :{field}")
            params[field] = value

    range_filters = {
        "price": (min_price, max_price),
        "total_area": (min_total_area, max_total_area),
        "living_area": (min_living_area, max_living_area),
        "kitchen_area": (min_kitchen_area, max_kitchen_area),
        "floor": (min_floor, max_floor),
        "house_floors_count": (min_house_floors_count, max_house_floors_count),
        "house_built_year": (min_house_built_year, max_house_built_year),
        "ceiling_height": (min_ceiling_height, max_ceiling_height),
        "land_area": (min_land_area, max_land_area),
        "price_per_square_meter": (
            min_price_per_square_meter,
            max_price_per_square_meter,
        ),
    }
    for field, (min_val, max_val) in range_filters.items():
        if min_val is not None:
            where_clauses.append(f"o.{field} >= :min_{field}")
            params[f"min_{field}"] = min_val
        if max_val is not None:
            where_clauses.append(f"o.{field} <= :max_{field}")
            params[f"max_{field}"] = max_val

    list_filters = {
        "rooms_count": rooms_count,
        "bathrooms_count": bathrooms_count,
        "bedrooms_count": bedrooms_count,
        "transport_access_category": transport_access_category,
        "elderly_category": elderly_category,
        "family_category": family_category,
        "price_category": price_category,
        "offer_type_id": offer_type,
        "property_type_id": property_type,
        "bathroom_type_id": bathroom_type,
        "renovation_type_id": renovation_type,
        "window_view_type_id": window_view_type,
        "parking_type_id": parking_type,
        "house_material_type_id": house_material_type,
        "heating_type_id": heating_type,
        "gas_type_id": gas_type,
        "sewerage_type_id": sewerage_type,
        "water_supply_type_id": water_supply_type,
        "seller_id": seller_id,
        "land_type_id": land_type,
        "source": source,  # 👈 ВОТ ЭТО
    }
    for field, values in list_filters.items():
        if values:
            placeholders = ", ".join([f":{field}_{i}" for i in range(len(values))])
            where_clauses.append(f"o.{field} IN ({placeholders})")
            for i, val in enumerate(values):
                params[f"{field}_{i}"] = val

    if all(v is not None for v in [sw_lat, sw_lng, ne_lat, ne_lng]):
        where_clauses.append("""
            a.coordinates::geometry && ST_MakeEnvelope(:sw_lng, :sw_lat, :ne_lng, :ne_lat, 4326)
        """)
        params.update(
            {"sw_lat": sw_lat, "sw_lng": sw_lng, "ne_lat": ne_lat, "ne_lng": ne_lng}
        )

    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    query = text(f"""
        SELECT 
            o.id, o.url, o.price, o.total_area, o.land_area, o.living_area, o.title,
            a.house_number, a.full_address,
            ST_X(a.coordinates::geometry) AS longitude, 
            ST_Y(a.coordinates::geometry) AS latitude,
            o.price_category,
            o.images_urls[1] AS first_image_url,
            o.is_new_house
        FROM offer o
        JOIN address a ON o.address_id = a.id
        {where_sql}
        ORDER BY o.creation_date_source DESC
        LIMIT :limit
    """)
    params["limit"] = limit

    result = await session.execute(query, params)
    offers = result.fetchall()

    return [
        {
            "id": o[0],
            "url": o[1],
            "price": o[2],
            "total_area": o[3],
            "land_area": o[4],
            "living_area": o[5],
            "title": o[6],
            "address": {
                "house_number": o[7],
                "full_address": o[8],
                "coordinates_list": [o[9], o[10]],
            },
            "price_category": o[11],
            "image_url": o[12],
            "is_new_house": o[13],
        }
        for o in offers
    ]


@offer_router.get("/autocomplete", response_model=List[str])
async def autocomplete_addresses(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, le=50),
    session: AsyncSession = Depends(get_async_session),
):
    ts_query = " & ".join(f"{w}:*" for w in q.lower().split() if w.strip())
    stmt = text(f"""
        SELECT full_address
        FROM address
        WHERE search_vector @@ to_tsquery('russian', :ts_query)
        ORDER BY ts_rank_cd(search_vector, to_tsquery('russian', :ts_query)) DESC
        LIMIT :limit
    """).bindparams(ts_query=ts_query, limit=limit)

    results = await session.exec(stmt)
    return [r[0] for r in results.fetchall() if r[0]]


@offer_router.get(
    "/filter_types",
)
async def get_types_for_filter(session: AsyncSession = Depends(get_async_session)):
    bathroom_types = await session.exec(
        select(BathroomType).order_by((BathroomType.name))
    )
    renovation_types = await session.exec(
        select(RenovationType).order_by((RenovationType.name))
    )
    window_view_types = await session.exec(
        select(WindowViewType).order_by((WindowViewType.name))
    )
    parking_types = await session.exec(select(ParkingType).order_by((ParkingType.name)))
    house_material_types = await session.exec(
        select(HouseMaterialType).order_by((HouseMaterialType.name))
    )
    heating_types = await session.exec(select(HeatingType).order_by((HeatingType.name)))
    gas_types = await session.exec(select(GasType).order_by((GasType.name)))
    sewerage_types = await session.exec(
        select(SewerageType).order_by((SewerageType.name))
    )
    water_supply_types = await session.exec(
        select(WaterSupplyType).order_by((WaterSupplyType.name))
    )
    land_types = await session.exec(select(LandType).order_by((LandType.name)))
    offer_types = await session.exec(select(OfferType).order_by((OfferType.name)))
    property_types = await session.exec(
        select(PropertyType).order_by(desc(PropertyType.id))
    )
    return {
        "bathroom_types": bathroom_types.all(),
        "renovation_types": renovation_types.all(),
        "window_view_types": window_view_types.all(),
        "parking_types": parking_types.all(),
        "house_material_types": house_material_types.all(),
        "heating_types": heating_types.all(),
        "gas_types": gas_types.all(),
        "sewerage_types": sewerage_types.all(),
        "water_supply_types": water_supply_types.all(),
        "land_types": land_types.all(),
        "offer_types": offer_types.all(),
        "property_types": property_types.all(),
    }


@offer_router.get("/autocomplete-filters")
async def autocomplete(
    query: str = Query(..., min_length=2),
    type: Literal[
        "region", "municipality", "settlement", "street", "district", "microdistrict"
    ] = Query(...),
    session: AsyncSession = Depends(get_async_session),
):
    query_like = f"%{query}%"
    limit = 10
    if type == "region":
        stmt = select(Region.short_name).where(Region.short_name.ilike(query_like))
    elif type == "municipality":
        stmt = select(Municipality.short_name).where(
            Municipality.short_name.ilike(query_like)
        )
    elif type == "settlement":
        stmt = select(Settlement.short_name).where(
            Settlement.short_name.ilike(query_like)
        )
    elif type == "district":
        stmt = select(District.short_name).where(District.short_name.ilike(query_like))
    elif type == "microdistrict":
        stmt = select(Microdistrict.short_name).where(
            Microdistrict.short_name.ilike(query_like)
        )
    elif type == "street":
        stmt = select(Street.short_name).where(Street.short_name.ilike(query_like))
    else:
        raise HTTPException(status_code=400, detail="Invalid type")

    res = await session.exec(stmt.limit(limit))
    results = res.all()

    return {"results": results}


@offer_router.get("/{offer_id}", response_model=OfferResponseFull)
async def get_offer(
    offer_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSession = Depends(get_async_session),
):
    offer = await session.get(Offer, offer_id)

    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    return offer


@offer_router.delete("/favorites/{offer_id}")
async def delete_from_favorites(
    offer_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSession = Depends(get_async_session),
):
    if offer_id not in [offer.id for offer in current_user.offers]:
        raise HTTPException(status_code=400, detail="Not in favorites")
    try:
        result = await session.exec(
            select(Favorite).where(
                Favorite.user_id == current_user.id, Favorite.offer_id == offer_id
            )
        )
        offer_for_delete = result.first()
        await session.delete(offer_for_delete)
        await session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Объект успешно удален"}


@offer_router.post("/favorites/{offer_id}")
async def add_to_favorites(
    offer_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSession = Depends(get_async_session),
):
    if offer_id in [offer.id for offer in current_user.offers]:
        raise HTTPException(status_code=400, detail="Already in favorites")
    else:
        try:
            favorite = Favorite(user_id=current_user.id, offer_id=offer_id)
            session.add(favorite)
            await session.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Added to favorites"}


@offer_router.get("/favorites/", response_model=List[OfferResponseFull])
async def get_favorites(current_user: Annotated[User, Depends(get_current_user)]):
    favorites = current_user.offers
    return favorites
