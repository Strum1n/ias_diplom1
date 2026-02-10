import csv
import io
from typing import Annotated, Literal
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import selectinload
from sqlmodel import and_, asc, desc, select, text
from app.backend.auth_utils.auth import oauth2_scheme
from sqlmodel.ext.asyncio.session import AsyncSession
from app.backend.api.response_models import (
    OfferResponseFull,
    OfferResponseWithPagination,
)
from app.backend.auth_utils.auth import get_current_user
from app.backend.db.config import get_async_session
from app.backend.db.models import *

offer_router = APIRouter(prefix="/offers", tags=["Offers"])


@offer_router.get("/export", response_class=Response)
async def export_offers_csv(
    session: AsyncSession = Depends(get_async_session),
    address_query: Optional[str] = None,
    # Булевы фильтры
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
    # Диапазоны чисел
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
    # Списки значений
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
    # --- 1. Формируем фильтры (аналогично основному эндпоинту) ---
    filters = []

    # Полнотекстовый поиск по адресу
    if address_query:
        ts_query = " & ".join(f"{w}:*" for w in address_query.lower().split() if w.strip())
        address_subquery = select(Address.id).where(Address.search_vector.op("@@")(func.to_tsquery("russian", ts_query))).scalar_subquery()
        filters.append(Offer.address_id.in_(address_subquery))

    # Булевы фильтры
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

    # Диапазоны чисел
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
        ("price_per_square_meter", min_price_per_square_meter, max_price_per_square_meter),
    ]
    for field, min_val, max_val in range_filters:
        if min_val is not None:
            filters.append(getattr(Offer, field) >= min_val)
        if max_val is not None:
            filters.append(getattr(Offer, field) <= max_val)

    # Списки значений
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

    # --- 2. Получаем все данные с фильтрами и связями ---
    # Загружаем все связи через join
    stmt = select(Offer).options(
        selectinload(Offer.address).selectinload(Address.region),
        selectinload(Offer.address).selectinload(Address.municipality),
        selectinload(Offer.address).selectinload(Address.settlement),
        selectinload(Offer.address).selectinload(Address.district),
        selectinload(Offer.address).selectinload(Address.street),
        selectinload(Offer.offer_type),
        selectinload(Offer.property_type),
        selectinload(Offer.land_type),
        selectinload(Offer.bathroom_type),
        selectinload(Offer.renovation_type),
        selectinload(Offer.window_view_type),
        selectinload(Offer.parking_type),
        selectinload(Offer.house_material_type),
        selectinload(Offer.heating_type),
        selectinload(Offer.gas_type),
        selectinload(Offer.sewerage_type),
        selectinload(Offer.water_supply_type),
        selectinload(Offer.seller).selectinload(Seller.seller_type),
    )

    if filters:
        stmt = stmt.where(and_(*filters))

    # Сортировка по умолчанию по дате создания
    stmt = stmt.order_by(desc(Offer.creation_date_source).nulls_last())

    result = await session.exec(stmt)
    offers = result.all()

    # --- 3. Формируем CSV файл ---
    output = io.StringIO()
    writer = csv.writer(output, delimiter=",", quotechar='"', quoting=csv.QUOTE_MINIMAL)

    # Заголовки столбцов с учетом всех полей из модели
    headers = [
        # Основная информация
        "ID",
        "Источник",
        "Цена (руб)",
        "Цена за кв.м (руб)",
        "Ценовая категория",
        # Площади
        "Общая площадь (кв.м)",
        "Жилая площадь (кв.м)",
        "Площадь кухни (кв.м)",
        "Площадь участка (кв.м)",
        # Планировка
        "Количество комнат",
        "Количество спален",
        "Количество санузлов",
        "Этаж",
        "Этажность дома",
        "Высота потолков (м)",
        # Дом и состояние
        "Новостройка",
        "Год постройки дома",
        "Строительство завершено",
        # Коммуникации
        "Водоснабжение",
        "Электричество",
        "Газ",
        "Канализация",
        "Отопление",
        # Удобства
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
        # Контент
        "Заголовок",
        "Описание",
        "URL",
        "Дублирующие URL",
        # Аналитика и скоринг
        "Транспортная доступность (балл)",
        "Транспортная доступность (категория)",
        "Для пожилых (балл)",
        "Для пожилых (категория)",
        "Для семей (балл)",
        "Для семей (категория)",
        # Просмотры
        "Количество просмотров",
        "Просмотров за день",
        "Просмотров за 10 дней",
        # Контакты
        "Контактный телефон",
        # Даты
        "Дата создания (источник)",
        "Дата обновления (источник)",
        "Дата обновления (система)",
        # Адресные данные
        "Регион",
        "Муниципалитет",
        "Населенный пункт",
        "Район",
        "Улица",
        "Номер дома",
        "Полный адрес",
        "Координаты (широта)",
        "Координаты (долгота)",
        # Продавец
        "Продавец",
        "Рейтинг продавца",
        "Год основания продавца",
        "Тип продавца",
        # Типы и классификаторы
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
    writer.writerow(headers)

    # Функция для безопасного получения значений
    def get_value(obj, attr, default=""):
        if obj and hasattr(obj, attr):
            value = getattr(obj, attr)
            return value if value is not None else default
        return default

    # Функция для преобразования булевых значений
    def bool_to_str(value):
        if value is True:
            return "Да"
        elif value is False:
            return "Нет"
        return ""

    # Данные
    for offer in offers:
        # Получаем координаты
        lat = ""
        lon = ""
        if offer.address and offer.address.coordinates_list:
            # coordinates_list возвращает [lon, lat]
            lon = offer.address.coordinates_list[0] if len(offer.address.coordinates_list) > 0 else ""
            lat = offer.address.coordinates_list[1] if len(offer.address.coordinates_list) > 1 else ""

        # Преобразуем списки в строки
        images_urls_str = ", ".join(offer.images_urls) if offer.images_urls else ""
        identical_urls_str = ", ".join(offer.identical_urls) if offer.identical_urls else ""

        row_data = [
            # Основная информация
            get_value(offer, "id"),
            get_value(offer, "source"),
            get_value(offer, "price"),
            get_value(offer, "price_per_square_meter"),
            get_value(offer, "price_category"),
            # Площади
            get_value(offer, "total_area"),
            get_value(offer, "living_area"),
            get_value(offer, "kitchen_area"),
            get_value(offer, "land_area"),
            # Планировка
            get_value(offer, "rooms_count"),
            get_value(offer, "bedrooms_count"),
            get_value(offer, "bathrooms_count"),
            get_value(offer, "floor"),
            get_value(offer, "house_floors_count"),
            get_value(offer, "ceiling_height"),
            # Дом и состояние
            bool_to_str(get_value(offer, "is_new_house")),
            get_value(offer, "house_built_year"),
            bool_to_str(get_value(offer, "is_build_complete")),
            # Коммуникации
            bool_to_str(get_value(offer, "has_water_supply")),
            bool_to_str(get_value(offer, "has_electricity")),
            bool_to_str(get_value(offer, "has_gas")),
            bool_to_str(get_value(offer, "has_sewerage")),
            bool_to_str(get_value(offer, "has_heating")),
            # Удобства
            get_value(offer, "elevators_count"),
            bool_to_str(get_value(offer, "has_elevator")),
            get_value(offer, "balconies_count"),
            bool_to_str(get_value(offer, "has_balcony")),
            bool_to_str(get_value(offer, "has_garbage_chute")),
            bool_to_str(get_value(offer, "has_furniture")),
            bool_to_str(get_value(offer, "has_guard")),
            bool_to_str(get_value(offer, "has_garage")),
            bool_to_str(get_value(offer, "has_bathhouse")),
            bool_to_str(get_value(offer, "has_pool")),
            bool_to_str(get_value(offer, "has_terrace")),
            # Контент
            get_value(offer, "title"),
            get_value(offer, "description"),
            get_value(offer, "url"),
            identical_urls_str,
            # Аналитика и скоринг
            get_value(offer, "transport_access_score"),
            get_value(offer, "transport_access_category"),
            get_value(offer, "elderly_score"),
            get_value(offer, "elderly_category"),
            get_value(offer, "family_score"),
            get_value(offer, "family_category"),
            # Просмотры
            get_value(offer, "views_count"),
            get_value(offer, "daily_views_count"),
            get_value(offer, "last_ten_days_views_count"),
            # Контакты
            get_value(offer, "contact_phone"),
            # Даты
            get_value(offer, "creation_date_source"),
            get_value(offer, "update_date_source"),
            get_value(offer, "update_date"),
            # Адресные данные
            get_value(offer.address.region, "name") if offer.address and offer.address.region else "",
            get_value(offer.address.municipality, "name") if offer.address and offer.address.municipality else "",
            get_value(offer.address.settlement, "name") if offer.address and offer.address.settlement else "",
            get_value(offer.address.district, "name") if offer.address and offer.address.district else "",
            get_value(offer.address.street, "name") if offer.address and offer.address.street else "",
            get_value(offer.address, "house_number"),
            get_value(offer.address, "full_address"),
            lat,
            lon,
            # Продавец
            get_value(offer.seller, "name") if offer.seller else "",
            get_value(offer.seller, "rating") if offer.seller else "",
            get_value(offer.seller, "foundation_date") if offer.seller else "",
            get_value(offer.seller.seller_type, "name") if offer.seller and offer.seller.seller_type else "",
            # Типы и классификаторы
            get_value(offer.offer_type, "name") if offer.offer_type else "",
            get_value(offer.property_type, "name") if offer.property_type else "",
            get_value(offer.land_type, "name") if offer.land_type else "",
            get_value(offer.bathroom_type, "name") if offer.bathroom_type else "",
            get_value(offer.renovation_type, "name") if offer.renovation_type else "",
            get_value(offer.window_view_type, "name") if offer.window_view_type else "",
            get_value(offer.parking_type, "name") if offer.parking_type else "",
            get_value(offer.house_material_type, "name") if offer.house_material_type else "",
            get_value(offer.heating_type, "name") if offer.heating_type else "",
            get_value(offer.gas_type, "name") if offer.gas_type else "",
            get_value(offer.sewerage_type, "name") if offer.sewerage_type else "",
            get_value(offer.water_supply_type, "name") if offer.water_supply_type else "",
        ]

        # Обработка значений
        row_data = [str(v).replace("\n", " ").replace("\r", " ") if v is not None and not isinstance(v, bool) else "" if v is None else str(v) for v in row_data]

        writer.writerow(row_data)

    # --- 4. Возвращаем CSV файл ---
    csv_content = output.getvalue()
    output.close()

    # Генерируем имя файла с текущей датой
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"offers_export_{timestamp}.csv"

    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}", "Content-Type": "text/csv; charset=utf-8"})


@offer_router.get("", response_model=OfferResponseWithPagination)
async def get_offers(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(50, ge=1, le=100000),
    offset: int = Query(0, ge=0),
    address_query: Optional[str] = None,
    sort_by: Optional[str] = Query(None, description="Field to sort by: price, price_per_square_meter, creation_date_source, views_count, total_area"),
    sort_order: Optional[str] = Query(
        "desc",
        description="Sort order: asc or desc",
    ),
    # Булевы фильтры
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
    # Диапазоны чисел
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
    # Списки значений
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
    # --- 1. Общий count без фильтров ---
    total_count_stmt = select(func.count(Offer.id))
    total_result = await session.exec(total_count_stmt)
    total_count = total_result.first()

    # --- 2. Формируем фильтры ---
    filters = []

    # Полнотекстовый поиск по адресу
    if address_query:
        ts_query = " & ".join(f"{w}:*" for w in address_query.lower().split() if w.strip())
        # Предполагаем, что у Offer есть связь с Address через relationship
        # Если связь называется 'address_rel' и в Address есть search_vector
        address_subquery = select(Address.id).where(Address.search_vector.op("@@")(func.to_tsquery("russian", ts_query))).scalar_subquery()
        filters.append(Offer.address_id.in_(address_subquery))

    # Булевы фильтры
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

    # Диапазоны чисел
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
        ("price_per_square_meter", min_price_per_square_meter, max_price_per_square_meter),
    ]
    for field, min_val, max_val in range_filters:
        if min_val is not None:
            filters.append(getattr(Offer, field) >= min_val)
        if max_val is not None:
            filters.append(getattr(Offer, field) <= max_val)

    # Списки значений
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

    # --- 3. filtered_count ---
    filtered_count_stmt = select(func.count(Offer.id))
    if filters:
        filtered_count_stmt = filtered_count_stmt.where(and_(*filters))
    filtered_result = await session.exec(filtered_count_stmt)
    filtered_count = filtered_result.first()

    # --- 4. Получаем данные с фильтрами и пагинацией ---
    stmt = select(Offer).order_by(order_clause)
    if filters:
        stmt = stmt.where(and_(*filters))
    stmt = stmt.limit(limit).offset(offset)
    result = await session.exec(stmt)
    offers = result.all()

    # --- 5. Формируем pagination ---
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
    # --- Булевы фильтры ---
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
    # --- Диапазоны ---
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
    # --- Списки значений ---
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
    # --- Bounds карты ---
    sw_lat: Optional[float] = Query(None),
    sw_lng: Optional[float] = Query(None),
    ne_lat: Optional[float] = Query(None),
    ne_lng: Optional[float] = Query(None),
    # --- Лимит ---
    limit: int = 100000,
):
    where_clauses = []
    params = {}

    # --- Полнотекстовый поиск по адресу ---
    if address_query:
        ts_query = " & ".join(f"{w}:*" for w in address_query.lower().split() if w.strip())
        where_clauses.append("""
            a.id IN (
                SELECT id FROM address 
                WHERE search_vector @@ to_tsquery('russian', :ts_query)
            )
        """)
        params["ts_query"] = ts_query

    # --- Булевы фильтры ---
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

    # --- Диапазоны ---
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
        "price_per_square_meter": (min_price_per_square_meter, max_price_per_square_meter),
    }
    for field, (min_val, max_val) in range_filters.items():
        if min_val is not None:
            where_clauses.append(f"o.{field} >= :min_{field}")
            params[f"min_{field}"] = min_val
        if max_val is not None:
            where_clauses.append(f"o.{field} <= :max_{field}")
            params[f"max_{field}"] = max_val

    # --- Списки значений ---
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

    # --- Фильтр по bounding box через оператор && ---
    if all(v is not None for v in [sw_lat, sw_lng, ne_lat, ne_lng]):
        where_clauses.append("""
            a.coordinates::geometry && ST_MakeEnvelope(:sw_lng, :sw_lat, :ne_lng, :ne_lat, 4326)
        """)
        params.update({"sw_lat": sw_lat, "sw_lng": sw_lng, "ne_lat": ne_lat, "ne_lng": ne_lng})

    # --- Итоговое условие ---
    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    query = text(f"""
        SELECT 
            o.id, o.url, o.price, o.total_area, o.land_area, o.living_area, o.title,
            a.house_number, a.full_address,
            ST_X(a.coordinates::geometry) AS longitude, 
            ST_Y(a.coordinates::geometry) AS latitude,
            o.price_category,
            o.images_urls[1] AS first_image_url
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
            "address": {"house_number": o[7], "full_address": o[8], "coordinates_list": [o[9], o[10]]},
            "price_category": o[11],
            "image_url": o[12],
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
    type: Literal["region", "municipality", "settlement", "street", "district", "microdistrict"] = Query(...),
    session: AsyncSession = Depends(get_async_session),
):
    query_like = f"%{query}%"
    limit = 10
    # Выбираем таблицу в зависимости от type
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
async def delete_from_favorites(offer_id: int, current_user: Annotated[User, Depends(get_current_user)], session: AsyncSession = Depends(get_async_session)):
    if offer_id not in [offer.id for offer in current_user.offers]:
        raise HTTPException(status_code=400, detail="Not in favorites")
    try:
        result = await session.exec(select(Favorite).where(Favorite.user_id == current_user.id, Favorite.offer_id == offer_id))
        offer_for_delete = result.first()
        await session.delete(offer_for_delete)
        await session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Объект успешно удален"}


@offer_router.post("/favorites/{offer_id}")
async def add_to_favorites(offer_id: int, current_user: Annotated[User, Depends(get_current_user)], session: AsyncSession = Depends(get_async_session)):
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
