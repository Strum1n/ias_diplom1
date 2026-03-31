from datetime import date
import json
import re

from fastapi import APIRouter, Body, HTTPException, Query
import numpy as np
from ollama import AsyncClient, Client, chat
from openai import OpenAI
from sqlmodel import TIMESTAMP, Date, Integer, and_, case, cast, lateral, literal, or_, select, func, text, true, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from typing import List, Literal
from app.backend.MCDA.electre import electre
from app.backend.MCDA.topsis import topsis
from app.backend.config import settings
from app.backend.db.config import BaseModel, get_async_session
from app.backend.db.models.address import Address, District, Microdistrict, Municipality, Region, Settlement, Street
from app.backend.db.models.offer import Offer, OfferRead
from app.backend.db.models.types import PropertyType, SettlementType


analysis_router = APIRouter(prefix="/analysis", tags=["analysis"])

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


class Averages(BaseModel):
    average_price: float | None
    average_price_per_square_meter: float | None
    average_area: float | None
    average_views_count: float | None


class CategoryStats(BaseModel):
    low: int | None
    medium: int | None
    high: int | None


class PriceCategoryStats(BaseModel):
    cheap: int | None
    normal: int | None
    expensive: int | None


class Boxplot(BaseModel):
    min: float | None
    q1: float | None
    median: float | None
    q3: float | None
    max: float | None


class GroupStatsItem(BaseModel):
    name: str
    offers_count: int
    averages: Averages
    price_categories: PriceCategoryStats
    family_categories: CategoryStats
    elderly_categories: CategoryStats
    transport_access_categories: CategoryStats
    area_boxplot: Boxplot
    price_boxplot: Boxplot


class ApartmentsByRooms(BaseModel):
    rooms: dict[str, int]
    flat_type: dict[str, int]


class Statistics(BaseModel):
    averages: Averages
    price_categories: dict[str, int]
    property_types: dict[str, int]
    apartments_by_rooms: ApartmentsByRooms


class StatsResponse(BaseModel):
    total_count: int | None
    offers_today: int | None
    statistics: Statistics
    top_offers_by_views: list[OfferRead]


class AddressQueryParams(BaseModel):
    region_name: str | None = None
    municipality_name: str | None = None
    settlement_name: str | None = None
    district_name: str | None = None
    microdistrict_name: str | None = None
    street_name: str | None = None
    settlement_type_names: list[str] | None = None
    is_new_house: bool | None = None
    group_by: Literal["region", "municipality", "settlement", "district", "microdistrict", "street"] | None = None


class ViewHistoryItem(BaseModel):
    date: date
    views: int


def build_address_filters(params: AddressQueryParams):
    filters = []

    if params.region_name:
        filters.append(Region.short_name == params.region_name)

    if params.settlement_name:
        filters.append(Settlement.short_name == params.settlement_name)

    if params.municipality_name:
        filters.append(Municipality.short_name == params.municipality_name)

    if params.district_name:
        filters.append(District.short_name == params.district_name)

    if params.microdistrict_name:
        filters.append(Microdistrict.short_name == params.microdistrict_name)

    if params.street_name:
        filters.append(Street.short_name == params.street_name)

    if params.settlement_type_names:
        filters.append(SettlementType.name.in_(params.settlement_type_names))

    if params.is_new_house is not None:
        filters.append(Offer.is_new_house == params.is_new_house)

    return filters


@analysis_router.get("/group-stats", response_model=list[GroupStatsItem])
async def get_grouped_stats(
    params: AddressQueryParams = Query(),
    session: AsyncSession = Depends(get_async_session),
):
    group_map = {
        "region": Region.short_name,
        "settlement": Settlement.short_name,
        "municipality": Municipality.short_name,
        "district": District.short_name,
        "microdistrict": Microdistrict.short_name,
        "street": Street.short_name,
    }

    if params.group_by not in group_map:
        raise HTTPException(400, "Invalid group_by")

    group_col = group_map[params.group_by]

    filters = build_address_filters(params)

    offers_count_col = func.count(Offer.id).label("offers_count")

    stmt = (
        select(
            group_col.label("name"),
            offers_count_col,
            func.round(func.avg(Offer.price)).label("average_price"),
            func.round(func.avg(Offer.price_per_square_meter)).label("average_price_per_square_meter"),
            func.round(func.avg(Offer.total_area)).label("average_area"),
            func.round(func.avg(Offer.daily_views_count)).label("average_views_count"),
            func.count().filter(Offer.price_category == "cheap").label("cheap"),
            func.count().filter(Offer.price_category == "normal").label("normal"),
            func.count().filter(Offer.price_category == "expensive").label("expensive"),
            func.count().filter(Offer.family_category == "low").label("family_low"),
            func.count().filter(Offer.family_category == "medium").label("family_medium"),
            func.count().filter(Offer.family_category == "high").label("family_high"),
            func.count().filter(Offer.elderly_category == "low").label("elderly_low"),
            func.count().filter(Offer.elderly_category == "medium").label("elderly_medium"),
            func.count().filter(Offer.elderly_category == "high").label("elderly_high"),
            func.count().filter(Offer.transport_access_category == "low").label("transport_low"),
            func.count().filter(Offer.transport_access_category == "medium").label("transport_medium"),
            func.count().filter(Offer.transport_access_category == "high").label("transport_high"),
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
        .join(Offer.address)
        .outerjoin(Address.region)
        .outerjoin(Address.settlement)
        .outerjoin(Address.municipality)
        .outerjoin(Settlement.settlement_type)
        .outerjoin(Address.district)
        .outerjoin(Address.microdistrict)
        .outerjoin(Address.street)
        .group_by(group_col)
        .order_by(group_col.asc())
    )

    null_guard = {
        "region": Region.id,
        "settlement": Settlement.id,
        "municipality": Municipality.id,
        "district": District.id,
        "microdistrict": Microdistrict.id,
        "street": Street.id,
    }

    stmt = stmt.where(null_guard[params.group_by].isnot(None))

    if filters:
        stmt = stmt.where(and_(*filters))

    rows = (await session.exec(stmt)).all()

    return [
        GroupStatsItem(
            name=row.name,
            offers_count=row.offers_count,
            averages={
                "average_price": row.average_price,
                "average_price_per_square_meter": row.average_price_per_square_meter,
                "average_area": row.average_area,
                "average_views_count": row.average_views_count,
            },
            price_categories={
                "cheap": row.cheap,
                "normal": row.normal,
                "expensive": row.expensive,
            },
            family_categories={
                "low": row.family_low,
                "medium": row.family_medium,
                "high": row.family_high,
            },
            elderly_categories={
                "low": row.elderly_low,
                "medium": row.elderly_medium,
                "high": row.elderly_high,
            },
            transport_access_categories={
                "low": row.transport_low,
                "medium": row.transport_medium,
                "high": row.transport_high,
            },
            area_boxplot={
                "min": row.area_min,
                "q1": row.area_q1,
                "median": row.area_median,
                "q3": row.area_q3,
                "max": row.area_max,
            },
            price_boxplot={
                "min": row.price_min,
                "q1": row.price_q1,
                "median": row.price_median,
                "q3": row.price_q3,
                "max": row.price_max,
            },
        )
        for row in rows
    ]


@analysis_router.get("/stats", response_model=StatsResponse)
async def get_offers_by_location(
    params: AddressQueryParams = Query(),
    session: AsyncSession = Depends(get_async_session),
):
    filters = build_address_filters(params)

    base_stmt = (
        select(Offer)
        .join(Offer.address)
        .outerjoin(Address.region)
        .outerjoin(Address.settlement)
        .outerjoin(Address.municipality)
        .outerjoin(Settlement.settlement_type)
        .outerjoin(Address.district)
        .outerjoin(Address.microdistrict)
        .outerjoin(Address.street)
        .outerjoin(PropertyType, Offer.property_type_id == PropertyType.id)
    )

    if filters:
        base_stmt = base_stmt.where(and_(*filters))

    subq = base_stmt.subquery()

    stats_stmt = select(
        func.count().label("total_count"),
        func.count().filter(func.date(func.timezone("Europe/Moscow", subq.c.creation_date_source)) == date.today()).label("offers_today"),
        func.round(func.avg(subq.c.price)).label("avg_price"),
        func.round(func.avg(subq.c.price_per_square_meter)).label("avg_price_per_sqm"),
        func.round(func.avg(subq.c.total_area)).label("avg_area"),
        func.round(func.avg(subq.c.daily_views_count)).label("avg_views_count"),
    )

    stats = (await session.exec(stats_stmt)).first()

    price_categories_raw = {
        k: v for k, v in await session.exec(select(subq.c.price_category, func.count()).group_by(subq.c.price_category))
    }

    price_categories = {
        "cheap": 0,
        "normal": 0,
        "expensive": 0,
    }

    price_categories.update({k: v for k, v in price_categories_raw.items() if k is not None})

    property_types = {
        name: count
        for name, count in await session.exec(
            select(PropertyType.name, func.count(subq.c.id))
            .join(subq, PropertyType.id == subq.c.property_type_id)
            .group_by(PropertyType.name)
        )
    }

    apartments_subq = base_stmt.where(PropertyType.name.in_(["Квартира", "Аппартаменты"])).subquery()

    rooms_by_count = {}
    apartments_by_house_type = {"new_houses": 0, "secondary": 0}

    rooms_data = await session.exec(
        select(apartments_subq.c.rooms_count, apartments_subq.c.is_new_house, func.count()).group_by(
            apartments_subq.c.rooms_count, apartments_subq.c.is_new_house
        )
    )

    for rooms, is_new, count in rooms_data:
        if rooms is not None:
            key = "studio" if rooms == 0 else f"{rooms}_rooms" if rooms < 10 else "open_plan"
            rooms_by_count[key] = rooms_by_count.get(key, 0) + count

        if is_new is True:
            apartments_by_house_type["new_houses"] += count
        elif is_new is False:
            apartments_by_house_type["secondary"] += count

    top_offers = (await session.exec(base_stmt.order_by(Offer.views_count.desc(), Offer.creation_date_source.desc()).limit(5))).all()

    return StatsResponse(
        total_count=stats.total_count,
        offers_today=stats.offers_today,
        statistics=Statistics(
            averages=Averages(
                average_price=stats.avg_price,
                average_price_per_square_meter=stats.avg_price_per_sqm,
                average_area=stats.avg_area,
                average_views_count=stats.avg_views_count,
            ),
            price_categories=price_categories,
            property_types=property_types,
            apartments_by_rooms=ApartmentsByRooms(
                rooms=rooms_by_count,
                flat_type=apartments_by_house_type,
            ),
        ),
        top_offers_by_views=top_offers,
    )


@analysis_router.get("/last-10-days-views-history", response_model=list[ViewHistoryItem])
async def get_views_last_10_days(
    session: AsyncSession = Depends(get_async_session),
    params: AddressQueryParams = Depends(),
    settlement_type_names: list[str] | None = Query(None),
):

    elem = func.jsonb_array_elements(Offer.views_history).table_valued("value").alias("elem")

    elem_date = cast(func.jsonb_extract_path_text(elem.c.value, "date"), TIMESTAMP)
    elem_views = cast(func.jsonb_extract_path_text(elem.c.value, "views"), Integer)

    conditions = [
        Offer.views_history.isnot(None),
        func.jsonb_typeof(Offer.views_history) == "array",
        elem_date >= func.now() - text("interval '10 days'"),
    ]

    if params.region_name:
        conditions.append(Region.short_name == params.region_name)
    if params.settlement_name:
        conditions.append(Settlement.short_name == params.settlement_name)
    if params.municipality_name:
        conditions.append(Municipality.short_name == params.municipality_name)
    if params.district_name:
        conditions.append(District.short_name == params.district_name)
    if params.microdistrict_name:
        conditions.append(Microdistrict.short_name == params.microdistrict_name)
    if params.street_name:
        conditions.append(Street.short_name == params.street_name)
    if settlement_type_names:
        conditions.append(SettlementType.name.in_(settlement_type_names))
    if params.is_new_house is not None:
        conditions.append(Offer.is_new_house == params.is_new_house)

    stmt = (
        select(cast(elem_date, Date).label("date"), func.sum(elem_views).label("views"))
        .select_from(Offer)
        .join(Address, Offer.address_id == Address.id)
        .outerjoin(Region, Address.region_id == Region.id)
        .outerjoin(Settlement, Address.settlement_id == Settlement.id)
        .outerjoin(Municipality, Address.municipality_id == Municipality.id)
        .outerjoin(District, Address.district_id == District.id)
        .outerjoin(Microdistrict, Address.microdistrict_id == Microdistrict.id)
        .outerjoin(Street, Address.street_id == Street.id)
        .outerjoin(SettlementType, Settlement.settlement_type_id == SettlementType.id)
        .join(lateral(elem), true())
        .where(and_(*conditions))
        .group_by(cast(elem_date, Date))
        .order_by(cast(elem_date, Date))
    )

    result = await session.execute(stmt)
    rows = result.all()

    return [ViewHistoryItem(date=row.date, views=row.views) for row in rows]


@analysis_router.get("/chat_assistant")
async def assistant(query: str = Query(), session: AsyncSession = Depends(get_async_session)):
    with open("app/backend/assistant_prompt.txt", "r", encoding="utf-8") as file:
        system_prompt = file.read()
    client = AsyncClient(
        host="https://ollama.com", headers={"Authorization": "Bearer " + "ec79c30ff77e4dce8053fb8df0e08a0c.cNPQz341SlrH4U7dmT0YME4u"}
    )
    response = await client.chat(
        model="gpt-oss:120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ],
    )
    print(response.message.content)
    try:
        data = json.loads(response.message.content)
    except Exception as e:
        print(e)
        return {"explanation": "Простите, это вне моей компетенции. Попросите меня найти недвижимость."}

    sql = data["sql"].strip()

    if data.get("sql") is None:
        return {"explanation": "Простите, это вне моей компетенции. Попросите меня найти недвижимость."}

    if (
        "user" in sql.lower()
        or "password" in sql.lower()
        or re.search(r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE)\b", sql)
        or not sql.startswith("SELECT")
    ):
        return {"explanation": "Простите, это вне моей компетенции. Попросите меня найти недвижимость."}

    print(sql)

    result = await session.execute(text(sql))
    rows = result.mappings().all()

    return {"sql": sql, "explanation": data["explanation"], "result": rows}


@analysis_router.post("/statistics/update-price-categories")
async def update_price_categories_in_db(
    session: AsyncSession = Depends(get_async_session),
):

    street_avg = (
        select(
            Address.street_id,
            PropertyType.id.label("property_type_id"),
            Offer.rooms_count,
            Offer.renovation_type_id,
            func.avg(Offer.price).label("avg_price"),
            func.count(Offer.id).label("count"),
            literal(1).label("level"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .where(Offer.price.isnot(None))
        .where(Address.street_id.isnot(None))
        .group_by(Address.street_id, PropertyType.id, Offer.rooms_count, Offer.renovation_type_id)
        .having(func.count(Offer.id) >= 3)
        .cte("street_avg")
    )

    microdistrict_avg = (
        select(
            Address.microdistrict_id,
            PropertyType.id.label("property_type_id"),
            Offer.rooms_count,
            Offer.renovation_type_id,
            func.avg(Offer.price).label("avg_price"),
            func.count(Offer.id).label("count"),
            literal(2).label("level"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .where(Offer.price.isnot(None))
        .where(Address.microdistrict_id.isnot(None))
        .group_by(Address.microdistrict_id, PropertyType.id, Offer.rooms_count, Offer.renovation_type_id)
        .having(func.count(Offer.id) >= 3)
        .cte("microdistrict_avg")
    )

    district_avg = (
        select(
            Address.district_id,
            PropertyType.id.label("property_type_id"),
            Offer.rooms_count,
            Offer.renovation_type_id,
            func.avg(Offer.price).label("avg_price"),
            func.count(Offer.id).label("count"),
            literal(3).label("level"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .where(Offer.price.isnot(None))
        .where(Address.district_id.isnot(None))
        .group_by(Address.district_id, PropertyType.id, Offer.rooms_count, Offer.renovation_type_id)
        .having(func.count(Offer.id) >= 3)
        .cte("district_avg")
    )

    settlement_avg = (
        select(
            Address.settlement_id,
            PropertyType.id.label("property_type_id"),
            Offer.rooms_count,
            Offer.renovation_type_id,
            func.avg(Offer.price).label("avg_price"),
            func.count(Offer.id).label("count"),
            literal(4).label("level"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .where(Offer.price.isnot(None))
        .where(Address.settlement_id.isnot(None))
        .group_by(Address.settlement_id, PropertyType.id, Offer.rooms_count, Offer.renovation_type_id)
        .having(func.count(Offer.id) >= 3)
        .cte("settlement_avg")
    )

    all_avgs = (
        select(
            Offer.id.label("offer_id"),
            Offer.price.label("offer_price"),
            PropertyType.name.label("property_type_name"),
            Address.street_id,
            Address.microdistrict_id,
            Address.district_id,
            Address.settlement_id,
            Offer.rooms_count,
            Offer.renovation_type_id,
            func.coalesce(
                street_avg.c.avg_price, microdistrict_avg.c.avg_price, district_avg.c.avg_price, settlement_avg.c.avg_price
            ).label("avg_price"),
        )
        .select_from(Offer)
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .where(Offer.price.isnot(None))
        .outerjoin(
            street_avg,
            and_(
                street_avg.c.street_id == Address.street_id,
                street_avg.c.property_type_id == PropertyType.id,
                or_(
                    and_(
                        PropertyType.name.in_(["Квартира", "Апартаменты"]),
                        street_avg.c.rooms_count == Offer.rooms_count,
                        street_avg.c.renovation_type_id == Offer.renovation_type_id,
                    ),
                    and_(PropertyType.name.in_(["Дом", "Коттедж", "Таунхаус"]), street_avg.c.rooms_count.is_(None)),
                    and_(
                        ~PropertyType.name.in_(["Квартира", "Апартаменты", "Дом", "Коттедж", "Таунхаус"]),
                        street_avg.c.rooms_count.is_(None),
                        street_avg.c.renovation_type_id.is_(None),
                    ),
                ),
            ),
        )
        .outerjoin(
            microdistrict_avg,
            and_(
                microdistrict_avg.c.microdistrict_id == Address.microdistrict_id,
                microdistrict_avg.c.property_type_id == PropertyType.id,
                or_(
                    and_(
                        PropertyType.name.in_(["Квартира", "Апартаменты"]),
                        microdistrict_avg.c.rooms_count == Offer.rooms_count,
                        microdistrict_avg.c.renovation_type_id == Offer.renovation_type_id,
                    ),
                    and_(PropertyType.name.in_(["Дом", "Коттедж", "Таунхаус"]), microdistrict_avg.c.rooms_count.is_(None)),
                    and_(
                        ~PropertyType.name.in_(["Квартира", "Апартаменты", "Дом", "Коттедж", "Таунхаус"]),
                        microdistrict_avg.c.rooms_count.is_(None),
                        microdistrict_avg.c.renovation_type_id.is_(None),
                    ),
                ),
            ),
        )
        .outerjoin(
            district_avg,
            and_(
                district_avg.c.district_id == Address.district_id,
                district_avg.c.property_type_id == PropertyType.id,
                or_(
                    and_(
                        PropertyType.name.in_(["Квартира", "Апартаменты"]),
                        district_avg.c.rooms_count == Offer.rooms_count,
                        district_avg.c.renovation_type_id == Offer.renovation_type_id,
                    ),
                    and_(PropertyType.name.in_(["Дом", "Коттедж", "Таунхаус"]), district_avg.c.rooms_count.is_(None)),
                    and_(
                        ~PropertyType.name.in_(["Квартира", "Апартаменты", "Дом", "Коттедж", "Таунхаус"]),
                        district_avg.c.rooms_count.is_(None),
                        district_avg.c.renovation_type_id.is_(None),
                    ),
                ),
            ),
        )
        .outerjoin(
            settlement_avg,
            and_(
                settlement_avg.c.settlement_id == Address.settlement_id,
                settlement_avg.c.property_type_id == PropertyType.id,
                or_(
                    and_(
                        PropertyType.name.in_(["Квартира", "Апартаменты"]),
                        settlement_avg.c.rooms_count == Offer.rooms_count,
                        settlement_avg.c.renovation_type_id == Offer.renovation_type_id,
                    ),
                    and_(PropertyType.name.in_(["Дом", "Коттедж", "Таунхаус"]), settlement_avg.c.rooms_count.is_(None)),
                    and_(
                        ~PropertyType.name.in_(["Квартира", "Апартаменты", "Дом", "Коттедж", "Таунхаус"]),
                        settlement_avg.c.rooms_count.is_(None),
                        settlement_avg.c.renovation_type_id.is_(None),
                    ),
                ),
            ),
        )
        .cte("all_avgs")
    )

    update_stmt = (
        update(Offer)
        .where(Offer.id == all_avgs.c.offer_id)
        .values(
            price_category=case(
                (and_(all_avgs.c.avg_price.isnot(None), all_avgs.c.offer_price > all_avgs.c.avg_price * 1.05), "expensive"),
                (and_(all_avgs.c.avg_price.isnot(None), all_avgs.c.offer_price < all_avgs.c.avg_price * 0.95), "cheap"),
                else_="normal",
            )
        )
    )

    result = await session.execute(update_stmt)
    await session.commit()

    stats_result = await session.execute(
        select(Offer.price_category, func.count().label("count")).where(Offer.price_category.isnot(None)).group_by(Offer.price_category)
    )

    stats = {row.price_category: row.count for row in stats_result}

    return {"message": "Ценовые категории успешно обновлены", "updated_count": result.rowcount, "statistics": stats}


class ElectreResponse(BaseModel):
    kernel: list[int]
    dominance_info: dict[int, dict[int, dict[str, list[int]]]]
    outranking: list[list[bool]]
    allIds: list[int]

    class Config:
        arbitrary_types_allowed = False
        json_encoders = {
            np.ndarray: lambda v: v.tolist(),
            np.bool_: lambda v: bool(v),
            np.int64: lambda v: int(v),
            np.float64: lambda v: float(v),
        }


class MCDABodyParams(BaseModel):
    evaluations: List[List[float]]
    weights: List[float]
    is_min: List[bool]


@analysis_router.post("/electre", response_model=ElectreResponse)
def electre_endpoint(params: MCDABodyParams = Depends(), alpha_init: float = Body(), beta_init: float = Body()):
    kernel, dominance_info, outranking = electre(
        evaluations=params.evaluations,
        weights=params.weights,
        is_min=params.is_min,
        alpha_init=alpha_init,
        beta_init=beta_init,
        verbose=False,
    )

    if isinstance(kernel, np.ndarray):
        kernel = kernel.tolist()
    elif kernel is None:
        kernel = []
    else:
        kernel = [int(k) for k in kernel]

    response = ElectreResponse(
        kernel=kernel, dominance_info=dominance_info, outranking=outranking, allIds=list(range(len(params.evaluations)))
    )

    return response


class TopsisResponse(BaseModel):
    scores: List[float]
    ranked_indices: List[int]
    allIds: List[int]


@analysis_router.post("/topsis", response_model=TopsisResponse)
def topsis_endpoint(params: MCDABodyParams = Body()):
    scores, ranked_indices = topsis(X=np.array(params.evaluations), weights=np.array(params.weights), criteria=np.array(params.is_min))

    if isinstance(scores, np.ndarray):
        scores = scores.tolist()
    if isinstance(ranked_indices, np.ndarray):
        ranked_indices = ranked_indices.tolist()

    response = TopsisResponse(scores=scores, ranked_indices=ranked_indices, allIds=list(range(len(params.evaluations))))

    return response


@analysis_router.get("/avg-price-history")
async def avg_price_by_day(
    session: AsyncSession = Depends(get_async_session),
    params: AddressQueryParams = Depends(),
):
    filters = []
    query_params = {}

    if params.region_name:
        filters.append("r.short_name = :region_name")
        query_params["region_name"] = params.region_name

    if params.municipality_name:
        filters.append("m.short_name = :municipality_name")
        query_params["municipality_name"] = params.municipality_name

    if params.settlement_name:
        filters.append("s.short_name = :settlement_name")
        query_params["settlement_name"] = params.settlement_name

    if params.district_name:
        filters.append("d.short_name = :district_name")
        query_params["district_name"] = params.district_name

    if params.microdistrict_name:
        filters.append("md.short_name = :microdistrict_name")
        query_params["microdistrict_name"] = params.microdistrict_name

    if params.street_name:
        filters.append("st.short_name = :street_name")
        query_params["street_name"] = params.street_name

    if params.settlement_type_names:
        filters.append("stt.name = :settlement_type_names")
        query_params["settlement_type_names"] = params.settlement_type_names

    if params.is_new_house is not None:
        filters.append("o.is_new_house = :is_new_house")
        query_params["is_new_house"] = params.is_new_house

    where_clause = ""
    if filters:
        where_clause = "AND " + " AND ".join(filters)

    query = text(f"""
        WITH offer_prices AS (
            SELECT
                o.id AS offer_id,
                o.price AS initial_price,
                o.creation_date_source::date AS creation_date,
                (ph->'priceData'->>'price')::numeric AS price,
                (ph->>'changeTime')::date AS change_date
            FROM offer o
            JOIN address a ON a.id = o.address_id
            LEFT JOIN region r ON a.region_id = r.id
            LEFT JOIN municipality m ON a.municipality_id = m.id
            LEFT JOIN settlement s ON a.settlement_id = s.id
            LEFT JOIN district d ON a.district_id = d.id
            LEFT JOIN microdistrict md ON a.microdistrict_id = md.id
            LEFT JOIN street st ON a.street_id = st.id
            LEFT JOIN settlement_type stt ON s.settlement_type_id = stt.id
            CROSS JOIN LATERAL jsonb_array_elements(o.price_history) ph
            WHERE 1=1
            {where_clause}
        ),
        dates AS (
            SELECT generate_series(
                (SELECT MIN(creation_date) FROM offer_prices),
                (SELECT MAX(change_date) FROM offer_prices),
                interval '1 day'
            )::date AS date
        ),
        timeline AS (
            SELECT
                o.offer_id,
                d.date,
                o.initial_price,
                o.creation_date,
                op.price
            FROM (
                SELECT DISTINCT offer_id, initial_price, creation_date
                FROM offer_prices
            ) o
            JOIN dates d ON d.date >= o.creation_date
            LEFT JOIN offer_prices op
                ON op.offer_id = o.offer_id
               AND op.change_date = d.date
        ),
        filled AS (
            SELECT
                offer_id,
                date,
                COALESCE(
                    LAST_VALUE(price) OVER (
                        PARTITION BY offer_id
                        ORDER BY date
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                    ),
                    initial_price
                ) AS price
            FROM timeline
        )
        SELECT
            date,
            ROUND(AVG(price))::bigint AS avg_price
        FROM filled
        GROUP BY date
        ORDER BY date
    """)

    result = await session.execute(query, query_params)
    rows = result.fetchall()

    return [{"date": row.date, "avg_price": row.avg_price} for row in rows]
