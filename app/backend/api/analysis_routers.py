import json
import logging
from datetime import date, timedelta
from typing import Dict, Literal

import numpy as np
from fastapi import APIRouter, Depends, Form, HTTPException, Query
from fastapi.params import Body
from pydantic import confloat
from sqlalchemy import Integer, case, column, table
from sqlalchemy.orm import joinedload
from sqlmodel import Numeric, and_, case, cast, func, or_, select, text, true
from sqlmodel.ext.asyncio.session import AsyncSession

from app.backend.db.config import get_async_session
from app.backend.db.models import *
from app.backend.fuzzy_logic.fuzzy_evaluator import FuzzyEvaluator
from app.backend.MCDA.electre2 import electre
from app.backend.MCDA.topsis import topsis

analysis_router = APIRouter(prefix="/analysis", tags=["analysis"])
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
BATCH_SIZE = 1000


INFRA_MAP = {
    "Школа": "school_distance",
    "Детский сад": "kindergarten_distance",
    "Спортивное учреждение": "sports_distance",
    "Парк": "park_distance",
    "Остановка": "bus_distance",
    "Станция метро": "metro_distance",
    "Ресторан": "restaurant_distance",
    "Центр города": "city_center_distance",
    "Супермаркет": "supermarket_distance",
    "Университет": "university_distance",
    "Аптека": "pharmacy_distance",
    "Медучреждение": "hospital_distance",
}


@analysis_router.post("/statistics/update-price-categories")
async def update_price_categories_in_db(session: AsyncSession = Depends(get_async_session)):
    """
    Обновляет поле price_category в таблице offer на основе средних цен (AVG)
    с приоритетом: улица > микрорайон > район > населённый пункт.
    Для квартир/апартаментов учитываются rooms_count и renovation_type_id,
    для домов/коттеджей — house_floors_count.
    Если категорию нельзя определить, устанавливается 'normal'.
    """

    update_query = text("""
    WITH price_avgs AS (
        SELECT 
            a.district_id,
            a.street_id,
            a.settlement_id,
            a.microdistrict_id,  -- добавили микрорайон
            pt.id AS property_type_id,
            CASE WHEN pt.name IN ('Квартира', 'Аппартаменты') THEN o.rooms_count ELSE NULL END AS rooms_count,
            CASE WHEN pt.name IN ('Квартира', 'Аппартаменты') THEN o.renovation_type_id ELSE NULL END AS renovation_type_id,
            CASE WHEN pt.name IN ('Дом', 'Коттедж', 'Таунхаус') THEN o.house_floors_count ELSE NULL END AS house_floors_count,
            AVG(o.price) AS avg_price,
            CASE 
                WHEN a.street_id IS NOT NULL THEN 1
                WHEN a.microdistrict_id IS NOT NULL THEN 2  -- микрорайон получает более высокий приоритет
                WHEN a.district_id IS NOT NULL THEN 3
                ELSE 4
            END AS level_order
        FROM offer o
        JOIN address a ON o.address_id = a.id
        JOIN property_type pt ON o.property_type_id = pt.id
        WHERE o.price IS NOT NULL
        GROUP BY a.district_id, a.street_id, a.settlement_id, a.microdistrict_id, pt.id, pt.name,
                 rooms_count, renovation_type_id, house_floors_count
    ),
    offer_avg AS (
        SELECT 
            o.id AS offer_id,
            COALESCE(pa_street.avg_price, pa_microdistrict.avg_price, pa_district.avg_price, pa_settlement.avg_price) AS avg_price
        FROM offer o
        JOIN address a ON o.address_id = a.id
        JOIN property_type pt ON o.property_type_id = pt.id

        LEFT JOIN price_avgs pa_street
            ON pa_street.level_order = 1
            AND pa_street.settlement_id = a.settlement_id
            AND pa_street.street_id = a.street_id
            AND pa_street.property_type_id = pt.id
            AND (
                (pt.name IN ('Квартира', 'Аппартаменты') 
                    AND pa_street.rooms_count = o.rooms_count 
                    AND pa_street.renovation_type_id IS NOT DISTINCT FROM o.renovation_type_id)
                OR (pt.name IN ('Дом', 'Коттедж', 'Таунхаус') 
                    AND pa_street.house_floors_count IS NOT DISTINCT FROM o.house_floors_count)
                OR (pt.name NOT IN ('Квартира', 'Апартаменты', 'Дом', 'Коттедж', 'Таунхаус')
                    AND pa_street.rooms_count IS NULL
                    AND pa_street.house_floors_count IS NULL)
            )

        LEFT JOIN price_avgs pa_microdistrict
            ON pa_microdistrict.level_order = 2  -- микрорайон имеет второй уровень
            AND pa_microdistrict.settlement_id = a.settlement_id
            AND pa_microdistrict.microdistrict_id = a.microdistrict_id
            AND pa_microdistrict.property_type_id = pt.id
            AND (
                (pt.name IN ('Квартира', 'Апартаменты') 
                    AND pa_microdistrict.rooms_count = o.rooms_count 
                    AND pa_microdistrict.renovation_type_id IS NOT DISTINCT FROM o.renovation_type_id)
                OR (pt.name IN ('Дом', 'Коттедж', 'Таунхаус') 
                    AND pa_microdistrict.house_floors_count IS NOT DISTINCT FROM o.house_floors_count)
                OR (pt.name NOT IN ('Квартира', 'Аппартаменты', 'Дом', 'Коттедж', 'Таунхаус')
                    AND pa_microdistrict.rooms_count IS NULL
                    AND pa_microdistrict.house_floors_count IS NULL)
            )

        LEFT JOIN price_avgs pa_district
            ON pa_district.level_order = 3
            AND pa_district.settlement_id = a.settlement_id
            AND pa_district.district_id = a.district_id
            AND pa_district.property_type_id = pt.id
            AND (
                (pt.name IN ('Квартира', 'Аппартаменты') 
                    AND pa_district.rooms_count = o.rooms_count 
                    AND pa_district.renovation_type_id IS NOT DISTINCT FROM o.renovation_type_id)
                OR (pt.name IN ('Дом', 'Коттедж', 'Таунхаус') 
                    AND pa_district.house_floors_count IS NOT DISTINCT FROM o.house_floors_count)
                OR (pt.name NOT IN ('Квартира', 'Апартаменты', 'Дом', 'Коттедж', 'Таунхаус')
                    AND pa_district.rooms_count IS NULL
                    AND pa_district.house_floors_count IS NULL)
            )

        LEFT JOIN price_avgs pa_settlement
            ON pa_settlement.level_order = 4
            AND pa_settlement.settlement_id = a.settlement_id
            AND pa_settlement.property_type_id = pt.id
            AND (
                (pt.name IN ('Квартира', 'Аппартаменты') 
                    AND pa_settlement.rooms_count = o.rooms_count 
                    AND pa_settlement.renovation_type_id IS NOT DISTINCT FROM o.renovation_type_id)
                OR (pt.name IN ('Дом', 'Коттедж', 'Таунхаус') 
                    AND pa_settlement.house_floors_count IS NOT DISTINCT FROM o.house_floors_count)
                OR (pt.name NOT IN ('Квартира', 'Апартаменты', 'Дом', 'Коттедж', 'Таунхаус')
                    AND pa_settlement.rooms_count IS NULL
                    AND pa_settlement.house_floors_count IS NULL)
            )
    )
    UPDATE offer
    SET price_category = CASE
        WHEN oa.avg_price IS NOT NULL AND offer.price > oa.avg_price * 1.05 THEN 'expensive'
        WHEN oa.avg_price IS NOT NULL AND offer.price < oa.avg_price * 0.95 THEN 'cheap'
        ELSE 'normal'
    END
    FROM offer_avg oa
    WHERE offer.id = oa.offer_id;
    """)

    await session.exec(update_query)
    await session.commit()

    # 📊 Подсчёт статистики (SQLModel)
    stats_stmt = select(Offer.price_category, func.count().label("count")).where(Offer.price_category.is_not(None)).group_by(Offer.price_category)
    stats_result = await session.exec(stats_stmt)
    stats = stats_result.all()

    return {
        "message": "Price categories updated successfully (using AVG, optimized)",
        "status": "success",
        "statistics": {row.price_category: row.count for row in stats},
    }


@analysis_router.post("/recalculate_fuzzy_scores")
async def recalculate_fuzzy_scores(
    session=Depends(get_async_session),
    only_missing: bool = Query(False, description="Обрабатывать только офферы без вычисленных score"),
):
    """
    Массово пересчитывает fuzzy-оценки для всех офферов
    с учётом инфраструктуры, связанной с адресами.
    Если only_missing=True — обрабатывает только офферы, у которых score ещё не рассчитан.
    """
    fuzzy = FuzzyEvaluator()

    # 1️⃣ Собираем минимальные расстояния до инфраструктур по адресам
    logger.info("🔍 Сбор инфраструктуры по адресам...")
    infra_stmt = (
        select(
            AddressInfrastructureLink.address_id,
            InfrastructureType.name.label("infra_type"),
            func.min(AddressInfrastructureLink.distance).label("min_distance"),
        )
        .join(Infrastructure, Infrastructure.id == AddressInfrastructureLink.infrastructure_id)
        .join(InfrastructureType, InfrastructureType.id == Infrastructure.infrastructure_type_id)
        .where(InfrastructureType.name.in_(list(INFRA_MAP.keys())))
        .group_by(AddressInfrastructureLink.address_id, InfrastructureType.name)
    )

    infra_rows = (await session.exec(infra_stmt)).all()
    logger.info(f"✅ Загружено {len(infra_rows)} записей инфраструктуры")

    # 2️⃣ Кэш инфраструктуры по адресам
    address_infra: Dict[int, Dict[str, float]] = {}
    for row in infra_rows:
        addr_id = row.address_id
        key = INFRA_MAP.get(row.infra_type)
        if not key:
            continue
        if addr_id not in address_infra:
            address_infra[addr_id] = {}
        address_infra[addr_id][key] = row.min_distance

    logger.info(f"📍 Инфраструктура собрана для {len(address_infra)} адресов")

    # 3️⃣ Базовый запрос
    base_stmt = select(Offer)
    if only_missing:
        base_stmt = base_stmt.where(
            Offer.transport_access_score.is_(None),
            Offer.elderly_score.is_(None),
            Offer.family_score.is_(None),
        )

    total_offers = await session.scalar(select(func.count()).select_from(base_stmt.subquery()))
    logger.info(f"📦 Всего офферов для обработки: {total_offers} (only_missing={only_missing})")

    processed = 0
    null_results = 0

    # 4️⃣ Батчевая обработка
    for offset in range(0, total_offers, BATCH_SIZE):
        stmt = base_stmt.offset(offset).limit(BATCH_SIZE).options(joinedload(Offer.address))
        offers = (await session.exec(stmt)).all()
        if not offers:
            break

        for offer in offers:
            if not offer.address_id:
                logger.warning(f"⚠️ Пропущен Offer ID={offer.id}: нет address_id")
                continue

            infra = address_infra.get(offer.address_id)
            if not infra:
                logger.warning(f"⚠️ Offer ID={offer.id}: по адресу {offer.address_id} нет инфраструктуры")
                infra = {}

            # 🧠 Формируем данные для fuzzy
            data = {
                "metro_distance": infra.get("metro_distance", 9999),
                "bus_distance": infra.get("bus_distance", 9999),
                "parking_availability": True if offer.parking_type_id else False,
                "hospital_distance": infra.get("hospital_distance", 9999),
                "pharmacy_distance": infra.get("pharmacy_distance", 9999),
                "floor": offer.floor or 1,
                "elevator_availability": offer.has_elevator or False,
                "school_distance": infra.get("school_distance", 9999),
                "kindergarten_distance": infra.get("kindergarten_distance", 9999),
                "total_area": offer.total_area,
                "total_rooms": offer.rooms_count or 1,
            }
            print(data)
            try:
                result = fuzzy.evaluate_all(data)

                if not result:
                    logger.error(f"❌ Fuzzy вернул None для Offer ID={offer.id} (data={data})")
                    null_results += 1
                    continue

                offer.transport_access_score = result["transport_access"]["score"]
                offer.transport_access_category = result["transport_access"]["category"]
                offer.elderly_score = result["elderly_friendly"]["score"]
                offer.elderly_category = result["elderly_friendly"]["category"]
                offer.family_score = result["family_friendly"]["score"]
                offer.family_category = result["family_friendly"]["category"]

                # Проверим, не вернулись ли None-значения
                if offer.transport_access_score is None or offer.elderly_score is None or offer.family_score is None:
                    logger.warning(f"⚠️ Null fuzzy score для Offer ID={offer.id} → result={data}")
                    null_results += 1

            except Exception as e:
                logger.exception(f"💥 Ошибка при обработке Offer ID={offer.id}: {e} data={data}")
                null_results += 1

        await session.commit()
        processed += len(offers)
        logger.info(f"✅ Обработано {processed}/{total_offers} офферов")

    logger.info(f"🎯 Завершено: обработано={processed}, с null={null_results}")

    return {
        "status": "success",
        "processed": processed,
        "total_offers": total_offers,
        "null_results": null_results,
        "only_missing": only_missing,
    }


class ElectreResponse(BaseModel):
    kernel: List[int]
    dominance_info: Dict[str, Any]
    final_outranking: List[List[bool]]


@analysis_router.get("/electre")
def electre_endpoint(
    evaluations: str = Query(..., description="JSON матрица, пример: [[3,5],[4,2]]"),
    weights: str = Query(..., description="JSON список, пример: [0.4,0.6]"),
    is_min: str = Query(..., description="JSON список, пример: [false,true]"),
    alpha_init: float = 0.8,
    beta_init: float = 0.4,
    step: float = 0.05,
):
    """
    Единый эндпоинт ELECTRE, возвращающий данные в формате для фронтенда
    """
    # Парсинг JSON-строк из query
    evaluations = np.array(json.loads(evaluations), dtype=float)
    weights = np.array(json.loads(weights), dtype=float)
    is_min = np.array(json.loads(is_min), dtype=bool)

    # Получаем результаты от алгоритма ELECTRE
    kernel, dominance_info, outranking = electre(evaluations=evaluations, weights=weights, is_min=is_min, alpha_init=alpha_init, beta_init=beta_init, step=step)

    # Формируем полный ответ в нужном формате
    response = {
        "kernel": convert_to_list(kernel),
        "dominance_info": convert_to_list(dominance_info),
        "outranking": convert_to_list(outranking),
        "allIds": list(range(len(evaluations))),
    }

    return response


def convert_to_list(data):
    """
    Конвертирует numpy массивы в списки Python
    """
    if hasattr(data, "tolist"):
        return data.tolist()
    elif isinstance(data, (list, tuple)):
        return [convert_to_list(item) for item in data]
    else:
        return data


@analysis_router.get("/topsis")
def topsis_endpoint(
    X: str = Query(..., description="JSON матрица решений, пример: [[3,5],[4,2]]"),
    weights: str = Query(..., description="JSON список весов, пример: [0.4,0.6]"),
    criteria: str = Query(..., description="JSON список: true=максимум, false=минимум, пример: [true,false]"),
):
    # Парсинг JSON из query
    X = np.array(json.loads(X), dtype=float)
    weights = np.array(json.loads(weights), dtype=float)
    criteria = np.array(json.loads(criteria), dtype=bool)

    # Вызов алгоритма TOPSIS
    scores, ranked_indices = topsis(X, weights, criteria)

    return {"scores": scores.tolist(), "ranked_indices": ranked_indices.tolist()}


@analysis_router.get("/stats")
async def get_offers_by_location(
    region_name: Optional[str] = Query(None, description="Название области"),
    settlement_name: Optional[str] = Query(None, description="Название поселения"),
    district_name: Optional[str] = Query(None, description="Название района"),
    microdistrict_name: Optional[str] = Query(None, description="Название микрорайона"),
    street_name: Optional[str] = Query(None, description="Название улицы"),
    session: AsyncSession = Depends(get_async_session),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    """
    Возвращает офферы по заданным параметрам месторасположения.
    Можно указать любую комбинацию: область, поселение, район, микрорайон.
    """
    filters = []

    # Формируем фильтры по названиям
    if region_name:
        filters.append(Region.short_name == region_name)
    if settlement_name:
        filters.append(Settlement.short_name == settlement_name)
    if district_name:
        filters.append(District.short_name == district_name)
    if microdistrict_name:
        filters.append(Microdistrict.short_name == microdistrict_name)
    if street_name:
        filters.append(Street.short_name == street_name)
    if is_new_house is not None:
        filters.append(Offer.is_new_house == is_new_house)

    # Базовый запрос для подсчета
    stmt = (
        select(Offer.id)
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if filters:
        stmt = stmt.where(and_(*filters))

    # Получаем общее количество результатов
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_count = await session.scalar(count_stmt)
    today = date.today()

    today_stmt = (
        select(func.count(Offer.id))
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
        .where(func.date(func.timezone("Europe/Moscow", Offer.creation_date_source)) == today)
    )

    if filters:
        today_stmt = today_stmt.where(and_(*filters))

    offers_today = await session.scalar(today_stmt)

    # 📊 Подсчёт статистики по категориям
    base_filters = []
    if region_name:
        base_filters.append(Region.short_name == region_name)
    if settlement_name:
        base_filters.append(Settlement.short_name == settlement_name)
    if district_name:
        base_filters.append(District.short_name == district_name)
    if microdistrict_name:
        base_filters.append(Microdistrict.short_name == microdistrict_name)
    if street_name:
        base_filters.append(Street.short_name == street_name)
    if is_new_house is not None:
        base_filters.append(Offer.is_new_house == is_new_house)

    stats_stmt = (
        select(
            Offer.price_category,
            func.count(Offer.id).label("count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if base_filters:
        stats_stmt = stats_stmt.where(and_(*base_filters))

    stats_stmt = stats_stmt.group_by(Offer.price_category)
    stats_result = await session.exec(stats_stmt)
    stats_rows = stats_result.all()

    price_categories = {
        "cheap": 0,
        "normal": 0,
        "expensive": 0,
    }
    for row in stats_rows:
        if row.price_category in price_categories:
            price_categories[row.price_category] = row.count

        top_offers_stmt = (
            select(
                Offer.id,
                Offer.title,
                Offer.price,
                Offer.price_per_square_meter,
                Offer.images_urls,
                Offer.is_new_house,
                Offer.creation_date_source,
                Offer.total_area,
                Offer.land_area,
                Offer.rooms_count,
                Offer.floor,
                Offer.house_floors_count,
                Offer.house_built_year,
                Offer.has_water_supply,
                Offer.has_electricity,
                Offer.has_furniture,
                Offer.has_elevator,
                Offer.has_garbage_chute,
                Offer.is_build_complete,
                Offer.views_count,
                Offer.family_category,
                Offer.family_score,
                Offer.elderly_category,
                Offer.elderly_score,
                Offer.transport_access_category,
                Offer.transport_access_score,
                Offer.price_category,
                Address.full_address.label("full_address"),
                RenovationType.name.label("renovation_type_name"),
            )
            .join(Address, Offer.address_id == Address.id)
            .join(PropertyType, Offer.property_type_id == PropertyType.id)
            .join(Region, Address.region_id == Region.id, isouter=True)
            .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
            .join(District, Address.district_id == District.id, isouter=True)
            .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
            .join(Street, Address.street_id == Street.id, isouter=True)
            .join(RenovationType, Offer.renovation_type_id == RenovationType.id, isouter=True)
        )

    if base_filters:
        top_offers_stmt = top_offers_stmt.where(and_(*base_filters))

    top_offers_stmt = top_offers_stmt.order_by(
        Offer.creation_date_source.desc(),  # Сначала сортируем по дате создания (от новых к старым)
        Offer.views_count.desc(),  # Затем по количеству просмотров (по убыванию)
    ).limit(5)

    top_offers_result = await session.exec(top_offers_stmt)
    top_offers = top_offers_result.all()

    # 📊 Подсчёт статистики по типам недвижимости
    property_type_stmt = (
        select(
            PropertyType.name.label("property_type_name"),
            func.count(Offer.id).label("count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if base_filters:
        property_type_stmt = property_type_stmt.where(and_(*base_filters))

    property_type_stmt = property_type_stmt.group_by(PropertyType.name)
    property_type_result = await session.exec(property_type_stmt)
    property_type_rows = property_type_result.all()

    property_types = {}
    for row in property_type_rows:
        property_types[row.property_type_name] = row.count

    # 📊 Подсчёт квартир по количеству комнат
    rooms_stmt = (
        select(
            Offer.rooms_count,
            func.count(Offer.id).label("count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
        .where(PropertyType.name.in_(["Квартира", "Аппартаменты"]))
    )

    if base_filters:
        rooms_stmt = rooms_stmt.where(and_(*base_filters))

    rooms_stmt = rooms_stmt.group_by(Offer.rooms_count).order_by(Offer.rooms_count)
    rooms_result = await session.exec(rooms_stmt)
    rooms_rows = rooms_result.all()

    rooms_by_count = {}
    for row in rooms_rows:
        if row.rooms_count is not None:
            room_label = f"{row.rooms_count}_rooms" if 0 < row.rooms_count < 10 else "studio" if row.rooms_count == 0 else "open_plan"
            rooms_by_count[room_label] = row.count

    # 📊 Подсчёт новостроек и вторички для квартир
    new_secondary_stmt = (
        select(
            Offer.is_new_house,
            func.count(Offer.id).label("count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
        .where(PropertyType.name.in_(["Квартира", "Аппартаменты"]))
    )

    if base_filters:
        new_secondary_stmt = new_secondary_stmt.where(and_(*base_filters))

    new_secondary_stmt = new_secondary_stmt.group_by(Offer.is_new_house)
    new_secondary_result = await session.exec(new_secondary_stmt)
    new_secondary_rows = new_secondary_result.all()

    apartments_by_house_type = {
        "new_houses": 0,
        "secondary": 0,
    }
    for row in new_secondary_rows:
        if row.is_new_house is True:
            apartments_by_house_type["new_houses"] = row.count
        elif row.is_new_house is False:
            apartments_by_house_type["secondary"] = row.count

    # 📊 Подсчёт средних значений
    averages_stmt = (
        select(
            func.round(func.avg(Offer.price)).label("avg_price"),
            func.round(func.avg(Offer.price_per_square_meter)).label("avg_price_per_sqm"),
            func.round(func.avg(Offer.total_area)).label("avg_area"),
            func.round(func.avg(Offer.daily_views_count)).label("avg_views_count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if base_filters:
        averages_stmt = averages_stmt.where(and_(*base_filters))

    averages_result = await session.exec(averages_stmt)
    averages_row = averages_result.one_or_none()

    averages = {
        "average_price": int(averages_row.avg_price) if averages_row and averages_row.avg_price else None,
        "average_price_per_square_meter": float(averages_row.avg_price_per_sqm) if averages_row and averages_row.avg_price_per_sqm else None,
        "average_area": float(averages_row.avg_area) if averages_row and averages_row.avg_area else None,
        "average_views_count": float(averages_row.avg_views_count) if averages_row and averages_row.avg_views_count else None,
    }

    # 📊 Подсчёт boxplot для площади
    area_boxplot_stmt = (
        select(
            func.round(cast(func.min(Offer.total_area), Numeric(10, 1)), 1).label("min_area"),
            func.round(cast(func.percentile_cont(0.25).within_group(Offer.total_area), Numeric(10, 1)), 1).label("q1_area"),
            func.round(cast(func.percentile_cont(0.50).within_group(Offer.total_area), Numeric(10, 1)), 1).label("median_area"),
            func.round(cast(func.percentile_cont(0.75).within_group(Offer.total_area), Numeric(10, 1)), 1).label("q3_area"),
            func.round(cast(func.max(Offer.total_area), Numeric(10, 1)), 1).label("max_area"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if base_filters:
        area_boxplot_stmt = area_boxplot_stmt.where(and_(*base_filters))

    area_boxplot_result = await session.exec(area_boxplot_stmt)
    area_boxplot_row = area_boxplot_result.one_or_none()

    area_boxplot = {
        "min": float(area_boxplot_row.min_area) if area_boxplot_row and area_boxplot_row.min_area is not None else None,
        "q1": float(area_boxplot_row.q1_area) if area_boxplot_row and area_boxplot_row.q1_area is not None else None,
        "median": float(area_boxplot_row.median_area) if area_boxplot_row and area_boxplot_row.median_area is not None else None,
        "q3": float(area_boxplot_row.q3_area) if area_boxplot_row and area_boxplot_row.q3_area is not None else None,
        "max": float(area_boxplot_row.max_area) if area_boxplot_row and area_boxplot_row.max_area is not None else None,
    }

    # 📊 Подсчёт boxplot для цены
    price_boxplot_stmt = (
        select(
            func.round(cast(func.min(Offer.price), Numeric(12, 1)), 1).label("min_price"),
            func.round(cast(func.percentile_cont(0.25).within_group(Offer.price), Numeric(12, 1)), 1).label("q1_price"),
            func.round(cast(func.percentile_cont(0.50).within_group(Offer.price), Numeric(12, 1)), 1).label("median_price"),
            func.round(cast(func.percentile_cont(0.75).within_group(Offer.price), Numeric(12, 1)), 1).label("q3_price"),
            func.round(cast(func.max(Offer.price), Numeric(12, 1)), 1).label("max_price"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if base_filters:
        price_boxplot_stmt = price_boxplot_stmt.where(and_(*base_filters))

    price_boxplot_result = await session.exec(price_boxplot_stmt)
    price_boxplot_row = price_boxplot_result.one_or_none()

    price_boxplot = {
        "min": float(price_boxplot_row.min_price) if price_boxplot_row and price_boxplot_row.min_price is not None else None,
        "q1": float(price_boxplot_row.q1_price) if price_boxplot_row and price_boxplot_row.q1_price is not None else None,
        "median": float(price_boxplot_row.median_price) if price_boxplot_row and price_boxplot_row.median_price is not None else None,
        "q3": float(price_boxplot_row.q3_price) if price_boxplot_row and price_boxplot_row.q3_price is not None else None,
        "max": float(price_boxplot_row.max_price) if price_boxplot_row and price_boxplot_row.max_price is not None else None,
    }

    return {
        "total_count": total_count,
        "offers_today": offers_today,
        "statistics": {
            "averages": averages,
            "area_boxplot": area_boxplot,
            "price_boxplot": price_boxplot,
            "price_categories": price_categories,
            "property_types": property_types,
            "apartments_by_rooms": {
                "rooms": rooms_by_count,
                "flat_type": apartments_by_house_type,
            },
        },
        "top_offers_by_views": [
            {
                "id": offer.id,
                "title": offer.title,
                "price": offer.price,
                "price_per_square_meter": offer.price_per_square_meter,
                "images_urls": offer.images_urls,
                "is_new_house": offer.is_new_house,
                "creation_date_source": offer.creation_date_source,
                "total_area": offer.total_area,
                "land_area": offer.land_area,
                "rooms_count": offer.rooms_count,
                "floor": offer.floor,
                "house_floors_count": offer.house_floors_count,
                "house_built_year": offer.house_built_year,
                "has_water_supply": offer.has_water_supply,
                "has_electricity": offer.has_electricity,
                "has_furniture": offer.has_furniture,
                "has_elevator": offer.has_elevator,
                "has_garbage_chute": offer.has_garbage_chute,
                "is_build_complete": offer.is_build_complete,
                "views_count": offer.views_count,
                "family_category": offer.family_category,
                "family_score": offer.family_score,
                "elderly_category": offer.elderly_category,
                "elderly_score": offer.elderly_score,
                "transport_access_category": offer.transport_access_category,
                "transport_access_score": offer.transport_access_score,
                "price_category": offer.price_category,
                "address": {
                    "full_address": offer.full_address,
                },
                "renovation_type": {
                    "name": offer.renovation_type_name,
                }
                if offer.renovation_type_name
                else None,
            }
            for offer in top_offers
        ],
    }


@analysis_router.get("/group-stats")
async def get_grouped_stats(
    group_by: Literal["region", "settlement", "district", "microdistrict", "street"] = Query(...),
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None),  # ✅ список типов
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
    session: AsyncSession = Depends(get_async_session),
):
    group_map = {
        "region": Region.short_name,
        "settlement": Settlement.short_name,
        "district": District.short_name,
        "microdistrict": Microdistrict.short_name,
        "street": Street.short_name,
    }

    if group_by not in group_map:
        raise HTTPException(400, "Invalid group_by")

    group_col = group_map[group_by]

    filters = []
    if region_name:
        filters.append(Region.short_name == region_name)
    if settlement_name:
        filters.append(Settlement.short_name == settlement_name)
    if district_name:
        filters.append(District.short_name == district_name)
    if microdistrict_name:
        filters.append(Microdistrict.short_name == microdistrict_name)
    if street_name:
        filters.append(Street.short_name == street_name)
    if settlement_type_names:
        filters.append(SettlementType.name.in_(settlement_type_names))  # ✅ фильтр по списку
    if is_new_house is not None:
        filters.append(Offer.is_new_house == is_new_house)

    offers_count_col = func.count(Offer.id).label("offers_count")

    stmt = (
        select(
            group_col.label(group_by),
            offers_count_col,
            func.round(func.avg(Offer.price)).label("average_price"),
            func.round(func.avg(Offer.price_per_square_meter)).label("average_price_per_square_meter"),
            func.round(func.avg(Offer.total_area)).label("average_area"),
            func.round(func.avg(Offer.daily_views_count)).label("average_views_count"),
            func.count().filter(Offer.price_category == "cheap").label("cheap"),
            func.count().filter(Offer.price_category == "normal").label("normal"),
            func.count().filter(Offer.price_category == "expensive").label("expensive"),
            func.min(Offer.total_area).label("area_min"),
            func.percentile_cont(0.25).within_group(Offer.total_area).label("area_q1"),
            func.percentile_cont(0.5).within_group(Offer.total_area).label("area_median"),
            func.percentile_cont(0.75).within_group(Offer.total_area).label("area_q3"),
            func.max(Offer.total_area).label("area_max"),
            func.min(Offer.price).label("price_min"),
            func.percentile_cont(0.25).within_group(Offer.price).label("price_q1"),
            func.percentile_cont(0.5).within_group(Offer.price).label("price_median"),
            func.percentile_cont(0.75).within_group(Offer.price).label("price_q3"),
            func.max(Offer.price).label("price_max"),
        )
        .select_from(Offer)
        .join(Address, Offer.address_id == Address.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(SettlementType, Settlement.settlement_type_id == SettlementType.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
        .group_by(group_col)
        .order_by(offers_count_col.desc())  # ✅ сортировка
    )
    null_guard = {
        "region": Region.id,
        "settlement": Settlement.id,
        "district": District.id,
        "microdistrict": Microdistrict.id,
        "street": Street.id,
    }

    stmt = stmt.where(null_guard[group_by].isnot(None))
    if filters:
        stmt = stmt.where(and_(*filters))

    result = await session.exec(stmt)
    rows = result.all()

    return {
        "results": [
            {
                group_by: getattr(row, group_by),
                "offers_count": row.offers_count,
                "averages": {
                    "average_price": row.average_price,
                    "average_price_per_square_meter": row.average_price_per_square_meter,
                    "average_area": row.average_area,
                    "average_views_count": row.average_views_count,
                },
                "price_categories": {
                    "cheap": row.cheap,
                    "normal": row.normal,
                    "expensive": row.expensive,
                },
                "area_boxplot": {
                    "min": row.area_min,
                    "q1": row.area_q1,
                    "median": row.area_median,
                    "q3": row.area_q3,
                    "max": row.area_max,
                },
                "price_boxplot": {
                    "min": row.price_min,
                    "q1": row.price_q1,
                    "median": row.price_median,
                    "q3": row.price_q3,
                    "max": row.price_max,
                },
            }
            for row in rows
        ],
    }


@analysis_router.get("/offers_count_by_property_type")
async def offers_count_by_property_type(
    group_by: str = Query(..., description="Уровень группировки: region | settlement | district | street | microdistrict"),
    session: AsyncSession = Depends(get_async_session),
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы населённых пунктов"),
    min_offers_count: Optional[int] = Query(None, ge=0),
    max_offers_count: Optional[int] = Query(None, ge=0),
):
    group_by = group_by.lower()

    # --- Маппинг уровней ---
    mapping = {
        "region": (Region, Region.id, Region.short_name, Address.region_id, "region"),
        "settlement": (Settlement, Settlement.id, Settlement.short_name, Address.settlement_id, "settlement"),
        "district": (District, District.id, District.short_name, Address.district_id, "district"),
        "street": (Street, Street.id, Street.short_name, Address.street_id, "street"),
        "microdistrict": (Microdistrict, Microdistrict.id, Microdistrict.short_name, Address.microdistrict_id, "microdistrict"),
    }

    if group_by not in mapping:
        raise HTTPException(status_code=400, detail="Недопустимое значение group_by")

    GroupModel, id_col, name_col, join_col, entity_key = mapping[group_by]

    # --- 1️⃣ Получаем ID по переданным именам ---
    region_id = settlement_id = district_id = street_id = microdistrict_id = None

    if region_name:
        region_id = await session.scalar(select(Region.id).where(Region.short_name == region_name))
        if not region_id:
            return []
    if settlement_name:
        settlement_id = await session.scalar(select(Settlement.id).where(Settlement.short_name == settlement_name))
        if not settlement_id:
            return []
    if district_name:
        district_id = await session.scalar(select(District.id).where(District.short_name == district_name))
        if not district_id:
            return []
    if street_name:
        street_id = await session.scalar(select(Street.id).where(Street.short_name == street_name))
        if not street_id:
            return []
    if microdistrict_name:
        microdistrict_id = await session.scalar(select(Microdistrict.id).where(Microdistrict.short_name == microdistrict_name))
        if not microdistrict_id:
            return []

    # --- 2️⃣ Фильтры ---
    filters = []
    if region_id:
        filters.append(Address.region_id == region_id)
    elif group_by == "region":  # Добавляем фильтр для исключения NULL для региона
        filters.append(Address.region_id.isnot(None))

    if settlement_id:
        filters.append(Address.settlement_id == settlement_id)
    elif group_by == "settlement":  # Добавляем фильтр для исключения NULL для населённого пункта
        filters.append(Address.settlement_id.isnot(None))

    if district_id:
        filters.append(Address.district_id == district_id)
    elif group_by == "district":  # Добавляем фильтр для исключения NULL для района
        filters.append(Address.district_id.isnot(None))

    if street_id:
        filters.append(Address.street_id == street_id)
    elif group_by == "street":  # Добавляем фильтр для исключения NULL для улицы
        filters.append(Address.street_id.isnot(None))

    if microdistrict_id:
        filters.append(Address.microdistrict_id == microdistrict_id)
    elif group_by == "microdistrict":  # Добавляем фильтр для исключения NULL для микрорайона
        filters.append(Address.microdistrict_id.isnot(None))

    if settlement_type_names:
        filters.append(SettlementType.name.in_(settlement_type_names))

    # --- 3️⃣ Основной запрос ---
    stmt = (
        select(
            id_col.label(f"{group_by}_id"),
            name_col.label(f"{group_by}_name"),
            PropertyType.id.label("property_type_id"),
            PropertyType.name.label("property_type_name"),
            func.count(Offer.id).label("count"),
            func.sum(Offer.last_ten_days_views_count).label("last_ten_days_views_sum"),
            func.sum(case((and_(Offer.is_new_house == True, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("new_houses_count"),
            func.sum(case((and_(Offer.is_new_house == False, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("secondary_houses_count"),
            func.sum(case((and_(Offer.rooms_count == 0, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("studio"),
            func.sum(case((and_(Offer.rooms_count == 1, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("rooms_1"),
            func.sum(case((and_(Offer.rooms_count == 2, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("rooms_2"),
            func.sum(case((and_(Offer.rooms_count == 3, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("rooms_3"),
            func.sum(case((and_(Offer.rooms_count == 4, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("rooms_4"),
            func.sum(case((and_(Offer.rooms_count >= 5, PropertyType.name.in_(["Квартира", "Аппартаменты"])), 1), else_=0)).label("rooms_5_plus"),
            func.sum(case((Offer.price_category == "cheap", 1), else_=0)).label("cheap_count"),
            func.sum(case((Offer.price_category == "normal", 1), else_=0)).label("normal_count"),
            func.sum(case((Offer.price_category == "expensive", 1), else_=0)).label("expensive_count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(GroupModel, join_col == id_col, isouter=True)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
    )

    # Присоединяем Settlement и SettlementType в зависимости от типа группировки
    if group_by != "settlement":
        stmt = stmt.join(Settlement, Settlement.id == Address.settlement_id, isouter=True)
        stmt = stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)
    else:
        # Если группировка по settlement, используем GroupModel (который уже является Settlement)
        stmt = stmt.join(SettlementType, SettlementType.id == GroupModel.settlement_type_id, isouter=True)

    if filters:
        stmt = stmt.where(and_(*filters))

    stmt = stmt.group_by(id_col, name_col, PropertyType.id, PropertyType.name).order_by(name_col, PropertyType.id)
    rows = (await session.exec(stmt)).mappings().all()

    # --- 4️⃣ Total offers count ---
    total_stmt = (
        select(
            id_col.label(f"{group_by}_id"),
            name_col.label(f"{group_by}_name"),
            func.count(Offer.id).label("total_offers_count"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(GroupModel, join_col == id_col, isouter=True)
    )

    if group_by != "settlement":
        total_stmt = total_stmt.join(Settlement, Settlement.id == Address.settlement_id, isouter=True)
        total_stmt = total_stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)
    else:
        total_stmt = total_stmt.join(SettlementType, SettlementType.id == GroupModel.settlement_type_id, isouter=True)

    if filters:
        total_stmt = total_stmt.where(and_(*filters))

    total_stmt = total_stmt.group_by(id_col, name_col)
    total_rows = {r[f"{group_by}_id"]: r["total_offers_count"] for r in (await session.exec(total_stmt)).mappings().all()}

    # --- 5️⃣d Boxplot total_area ---
    boxplot_stmt = (
        select(
            id_col.label(f"{group_by}_id"),
            name_col.label(f"{group_by}_name"),
            func.round(cast(func.min(Offer.total_area), Numeric(10, 1)), 1).label("min_area"),
            func.round(cast(func.percentile_cont(0.25).within_group(Offer.total_area), Numeric(10, 1)), 1).label("q1_area"),
            func.round(cast(func.percentile_cont(0.50).within_group(Offer.total_area), Numeric(10, 1)), 1).label("median_area"),
            func.round(cast(func.percentile_cont(0.75).within_group(Offer.total_area), Numeric(10, 1)), 1).label("q3_area"),
            func.round(cast(func.max(Offer.total_area), Numeric(10, 1)), 1).label("max_area"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(GroupModel, join_col == id_col, isouter=True)
    )

    if group_by != "settlement":
        boxplot_stmt = boxplot_stmt.join(Settlement, Settlement.id == Address.settlement_id, isouter=True)
        boxplot_stmt = boxplot_stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)
    else:
        boxplot_stmt = boxplot_stmt.join(SettlementType, SettlementType.id == GroupModel.settlement_type_id, isouter=True)

    if filters:
        boxplot_stmt = boxplot_stmt.where(and_(*filters))

    boxplot_stmt = boxplot_stmt.group_by(id_col, name_col)
    area_boxplot_rows = {
        r[f"{group_by}_id"]: {
            "min": float(r["min_area"]) if r["min_area"] is not None else None,
            "q1": float(r["q1_area"]) if r["q1_area"] is not None else None,
            "median": float(r["median_area"]) if r["median_area"] is not None else None,
            "q3": float(r["q3_area"]) if r["q3_area"] is not None else None,
            "max": float(r["max_area"]) if r["max_area"] is not None else None,
        }
        for r in (await session.exec(boxplot_stmt)).mappings().all()
    }

    # --- 5️⃣e Boxplot price ---
    price_boxplot_stmt = (
        select(
            id_col.label(f"{group_by}_id"),
            name_col.label(f"{group_by}_name"),
            func.round(cast(func.min(Offer.price), Numeric(12, 1)), 1).label("min_price"),
            func.round(cast(func.percentile_cont(0.25).within_group(Offer.price), Numeric(12, 1)), 1).label("q1_price"),
            func.round(cast(func.percentile_cont(0.50).within_group(Offer.price), Numeric(12, 1)), 1).label("median_price"),
            func.round(cast(func.percentile_cont(0.75).within_group(Offer.price), Numeric(12, 1)), 1).label("q3_price"),
            func.round(cast(func.max(Offer.price), Numeric(12, 1)), 1).label("max_price"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(GroupModel, join_col == id_col, isouter=True)
    )

    if group_by != "settlement":
        price_boxplot_stmt = price_boxplot_stmt.join(Settlement, Settlement.id == Address.settlement_id, isouter=True)
        price_boxplot_stmt = price_boxplot_stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)
    else:
        price_boxplot_stmt = price_boxplot_stmt.join(SettlementType, SettlementType.id == GroupModel.settlement_type_id, isouter=True)

    if filters:
        price_boxplot_stmt = price_boxplot_stmt.where(and_(*filters))

    price_boxplot_stmt = price_boxplot_stmt.group_by(id_col, name_col)
    price_boxplot_rows = {
        r[f"{group_by}_id"]: {
            "min": float(r["min_price"]) if r["min_price"] is not None else None,
            "q1": float(r["q1_price"]) if r["q1_price"] is not None else None,
            "median": float(r["median_price"]) if r["median_price"] is not None else None,
            "q3": float(r["q3_price"]) if r["q3_price"] is not None else None,
            "max": float(r["max_price"]) if r["max_price"] is not None else None,
        }
        for r in (await session.exec(price_boxplot_stmt)).mappings().all()
    }

    # --- 5️⃣f Average price per sqm ---
    avg_price_stmt = (
        select(
            id_col.label(f"{group_by}_id"),
            func.round(cast(func.avg(Offer.price_per_square_meter), Numeric(10, 1)), 1).label("avg_price_per_sqm"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(GroupModel, join_col == id_col, isouter=True)
    )

    if group_by != "settlement":
        avg_price_stmt = avg_price_stmt.join(Settlement, Settlement.id == Address.settlement_id, isouter=True)
        avg_price_stmt = avg_price_stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)
    else:
        avg_price_stmt = avg_price_stmt.join(SettlementType, SettlementType.id == GroupModel.settlement_type_id, isouter=True)

    if filters:
        avg_price_stmt = avg_price_stmt.where(and_(*filters))

    avg_price_stmt = avg_price_stmt.group_by(id_col)
    avg_price_rows = {r[f"{group_by}_id"]: float(r["avg_price_per_sqm"]) if r["avg_price_per_sqm"] else None for r in (await session.exec(avg_price_stmt)).mappings().all()}

    # --- 7️⃣ Сборка результата ---
    grouped = {}
    for r in rows:
        entity_id = r[f"{group_by}_id"]
        entity_name = r[f"{group_by}_name"]

        if entity_id not in grouped:
            grouped[entity_id] = {
                entity_key: {"id": entity_id, "name": entity_name},
                "total_offers_count": int(total_rows.get(entity_id, 0)),
                "avg_price_per_square_meter": avg_price_rows.get(entity_id),
                "area_boxplot": area_boxplot_rows.get(entity_id),
                "price_boxplot": price_boxplot_rows.get(entity_id),
                "property_counts": [],
                "apartments_summary": {
                    "new_houses_count": 0,
                    "secondary_houses_count": 0,
                    "rooms": {"studio": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5_plus": 0},
                },
                "price_categories": {"cheap": 0, "normal": 0, "expensive": 0},
                "last_ten_days_views_count": 0,
            }

        grouped[entity_id]["property_counts"].append(
            {
                "property_type_id": r["property_type_id"],
                "property_type_name": r["property_type_name"],
                "count": int(r["count"]),
            }
        )

        if r["property_type_name"] in ["Квартира", "Аппартаменты"]:
            a = grouped[entity_id]["apartments_summary"]
            a["new_houses_count"] += int(r["new_houses_count"])
            a["secondary_houses_count"] += int(r["secondary_houses_count"])
            a["rooms"]["studio"] += int(r["studio"])
            a["rooms"]["1"] += int(r["rooms_1"])
            a["rooms"]["2"] += int(r["rooms_2"])
            a["rooms"]["3"] += int(r["rooms_3"])
            a["rooms"]["4"] += int(r["rooms_4"])
            a["rooms"]["5_plus"] += int(r["rooms_5_plus"])

        pc = grouped[entity_id]["price_categories"]
        pc["cheap"] += int(r["cheap_count"])
        pc["normal"] += int(r["normal_count"])
        pc["expensive"] += int(r["expensive_count"])

        grouped[entity_id]["last_ten_days_views_count"] += int(r["last_ten_days_views_sum"] or 0)

    # --- 8️⃣ Фильтрация по min/max ---
    result_list = list(grouped.values())
    if min_offers_count is not None:
        result_list = [g for g in result_list if g["total_offers_count"] >= min_offers_count]
    if max_offers_count is not None:
        result_list = [g for g in result_list if g["total_offers_count"] <= max_offers_count]

    result_list.sort(key=lambda x: x["total_offers_count"], reverse=True)

    return result_list


@analysis_router.get("/popular_stats")
async def get_popular_stats(
    session: AsyncSession = Depends(get_async_session),
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы населённых пунктов"),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    today = datetime.utcnow().date()

    # 🧩 Динамические фильтры по name
    filters = []
    name_filters_map = {
        "region_name": (Region, Region.short_name, Address.region_id, Region.id),
        "settlement_name": (Settlement, Settlement.short_name, Address.settlement_id, Settlement.id),
        "district_name": (District, District.short_name, Address.district_id, District.id),
        "street_name": (Street, Street.short_name, Address.street_id, Street.id),
        "microdistrict_name": (Microdistrict, Microdistrict.short_name, Address.microdistrict_id, Microdistrict.id),
    }

    join_models = set([Address])

    # Добавляем модели для фильтров по имени
    for query_param, (model, column, addr_field, model_id) in name_filters_map.items():
        value = locals()[query_param]
        if value:
            filters.append(column == value)
            join_models.add(model)

    # Добавляем фильтр по типу населенного пункта
    if settlement_type_names:
        join_models.add(Settlement)
        join_models.add(SettlementType)
        # Используем IN с кортежем
        filters.append(SettlementType.name.in_(settlement_type_names))

    if is_new_house is not None:
        filters.append(Offer.is_new_house == is_new_house)

    # 1️⃣ Общая статистика по выбранной области
    total_stmt = select(
        func.count(Offer.id).label("total_offers"),
        func.round(func.avg(Offer.price)).label("avg_price"),
        func.round(func.avg(Offer.total_area)).label("avg_area_total"),
        func.sum(case((func.date(Offer.update_date_source) == today, 1), else_=0)).label("new_today_total"),
    ).join(Address, Address.id == Offer.address_id)

    for model in join_models:
        if model is not Address and model is not SettlementType:
            total_stmt = total_stmt.join(model, Address.__table__.c[f"{model.__tablename__}_id"] == model.id, isouter=True)

    # Присоединяем SettlementType отдельно, если он есть
    if SettlementType in join_models:
        total_stmt = total_stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)

    if filters:
        total_stmt = total_stmt.where(and_(*filters))

    total_result = await session.exec(total_stmt)
    total_stats = total_result.one_or_none()

    # 2️⃣ Топ 5 объявлений по daily_views_count
    top_offers_stmt = (
        select(
            Offer.id,
            Offer.title,
            Offer.price,
            Offer.daily_views_count,
            Offer.creation_date_source,
            func.round(Offer.price_per_square_meter).label("price_per_sqm"),
            Offer.url,
        )
        .join(Address, Address.id == Offer.address_id)
        .where(Offer.daily_views_count.is_not(None))  # исключаем объявления без просмотров
        .order_by(Offer.daily_views_count.desc())
        .limit(5)
    )

    for model in join_models:
        if model is not Address and model is not SettlementType:
            top_offers_stmt = top_offers_stmt.join(model, Address.__table__.c[f"{model.__tablename__}_id"] == model.id, isouter=True)

    if SettlementType in join_models:
        top_offers_stmt = top_offers_stmt.join(SettlementType, SettlementType.id == Settlement.settlement_type_id, isouter=True)

    if filters:
        top_offers_stmt = top_offers_stmt.where(and_(*filters))

    top_offers_result = await session.exec(top_offers_stmt)
    top_offers = top_offers_result.all()

    return {
        "total_offers": total_stats.total_offers if total_stats else 0,
        "avg_price": total_stats.avg_price if total_stats else None,
        "avg_area_total": total_stats.avg_area_total if total_stats else None,
        "new_offers_today": total_stats.new_today_total if total_stats else 0,
        "top_offers_week": [
            {
                "id": o.id,
                "title": o.title,
                "price": o.price,
                "daily_views": o.daily_views_count,
                "creation_date": o.creation_date_source,
                "price_per_sqm": o.price_per_sqm,
                "url": o.url,
            }
            for o in top_offers
        ],
    }


@analysis_router.get("/last-10-days-views-history")
async def get_views_last_10_days(
    session: AsyncSession = Depends(get_async_session),
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы населённых пунктов"),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    conditions = ["o.views_history IS NOT NULL", "jsonb_typeof(o.views_history) = 'array'"]
    params = {}

    if region_name:
        conditions.append("r.short_name = :region_name")
        params["region_name"] = region_name
    if settlement_name:
        conditions.append("s.short_name = :settlement_name")
        params["settlement_name"] = settlement_name
    if district_name:
        conditions.append("d.short_name = :district_name")
        params["district_name"] = district_name
    if microdistrict_name:
        conditions.append("md.short_name = :microdistrict_name")
        params["microdistrict_name"] = microdistrict_name
    if street_name:
        conditions.append("st.short_name = :street_name")
        params["street_name"] = street_name
    if settlement_type_names:
        conditions.append("stt.name = ANY(:settlement_type_names)")
        params["settlement_type_names"] = settlement_type_names
    if is_new_house is not None:
        conditions.append("o.is_new_house = :is_new_house")
        params["is_new_house"] = is_new_house

    where_clause = " AND ".join(conditions)

    query = text(f"""
        SELECT 
            elem->>'date' AS date,
            SUM((elem->>'views')::int) AS views
        FROM offer o
        JOIN address a ON o.address_id = a.id
        LEFT JOIN region r ON a.region_id = r.id
        LEFT JOIN settlement s ON a.settlement_id = s.id
        LEFT JOIN settlement_type stt ON s.settlement_type_id = stt.id
        LEFT JOIN district d ON a.district_id = d.id
        LEFT JOIN street st ON a.street_id = st.id
        LEFT JOIN microdistrict md ON a.microdistrict_id = md.id
        CROSS JOIN LATERAL jsonb_array_elements(o.views_history) AS elem
        WHERE {where_clause}
        GROUP BY elem->>'date'
        ORDER BY elem->>'date'
    """)

    result = await session.execute(query, params)
    rows = result.all()

    return [{"date": row.date, "views": row.views} for row in rows]


@analysis_router.get("/average-prices-history")
async def get_average_prices_history(
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы населённых пунктов"),
    session: AsyncSession = Depends(get_async_session),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    # Проверяем, были ли переданы параметры
    if not any([region_name, settlement_name, district_name, street_name, microdistrict_name, settlement_type_names, is_new_house]):
        # Если параметры не переданы, используем материализованное представление
        query = text("""
        SELECT 
            date,
            avg_price
        FROM avg_prices_history
        ORDER BY date;
        """)
        result = await session.execute(query)
        rows = result.fetchall()
    else:
        # Динамические условия для обычного запроса
        filters = []
        params = {}

        if region_name is not None:
            filters.append("r.short_name = :region_name")
            params["region_name"] = region_name
        if settlement_name is not None:
            filters.append("s.short_name = :settlement_name")
            params["settlement_name"] = settlement_name
        if district_name is not None:
            filters.append("d.short_name = :district_name")
            params["district_name"] = district_name
        if microdistrict_name is not None:
            filters.append("md.short_name = :microdistrict_name")
            params["microdistrict_name"] = microdistrict_name
        if street_name is not None:
            filters.append("st.short_name = :street_name")
            params["street_name"] = street_name
        if is_new_house is not None:
            filters.append("o.is_new_house = :is_new_house")
            params["is_new_house"] = is_new_house

        # Исправляем условие для settlement_type_names
        if settlement_type_names is not None and len(settlement_type_names) > 0:
            # Создаем строку с плейсхолдерами
            placeholders = ", ".join([f":settlement_type_{i}" for i in range(len(settlement_type_names))])
            filters.append(f"stt.name IN ({placeholders})")
            # Добавляем параметры по одному
            for i, st_name in enumerate(settlement_type_names):
                params[f"settlement_type_{i}"] = st_name

        # Собираем WHERE
        where_clause = " AND ".join(filters) if filters else "TRUE"

        query = text(f"""
        WITH filtered_offers AS (
            SELECT 
                o.id AS offer_id, 
                o.price AS initial_price, 
                o.creation_date_source::date AS creation_date,
                a.id AS address_id, 
                r.short_name AS region, 
                s.short_name AS settlement,
                d.short_name AS district,
                md.short_name AS microdistrict,  
                st.short_name AS street,
                stt.name AS settlement_type,
                jsonb_array_elements(o.price_history) AS ph
            FROM offer o
            JOIN address a ON a.id = o.address_id
            LEFT JOIN region r ON a.region_id = r.id
            LEFT JOIN settlement s ON a.settlement_id = s.id
            LEFT JOIN settlement_type stt ON s.settlement_type_id = stt.id
            LEFT JOIN district d ON a.district_id = d.id
            LEFT JOIN microdistrict md ON a.microdistrict_id = md.id
            LEFT JOIN street st ON a.street_id = st.id
            WHERE {where_clause}
        ),
        offer_prices AS (
            SELECT
                fo.offer_id,
                (fo.ph->'priceData'->>'price')::numeric AS price,
                (fo.ph->>'changeTime')::timestamp AS change_time
            FROM filtered_offers fo
        ),
        latest_price_per_offer AS (
            SELECT 
                op.offer_id,
                op.price,
                op.change_time::date AS date,
                ROW_NUMBER() OVER (
                    PARTITION BY op.offer_id, op.change_time::date
                    ORDER BY op.change_time DESC
                ) AS rn
            FROM offer_prices op
        ),
        unique_dates AS (
            SELECT DISTINCT date(change_time) AS date FROM offer_prices
        )
        SELECT 
            d.date,
            ROUND(AVG(
                COALESCE(lp.price, CASE WHEN fo.creation_date < d.date THEN fo.initial_price ELSE NULL END)
            ))::bigint AS avg_price
        FROM unique_dates d
        JOIN filtered_offers fo ON TRUE
        LEFT JOIN latest_price_per_offer lp
            ON lp.offer_id = fo.offer_id
           AND lp.date = d.date
           AND lp.rn = 1
        GROUP BY d.date
        ORDER BY d.date;
        """)

        result = await session.execute(query, params)
        rows = result.fetchall()

    return [{"date": row.date.isoformat(), "avg_price": int(row.avg_price) if row.avg_price is not None else None} for row in rows]
