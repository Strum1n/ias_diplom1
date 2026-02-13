import json
import logging
from datetime import date
import re
from typing import Dict, Literal
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case
from sqlalchemy.orm import joinedload
from sqlmodel import Numeric, and_, case, cast, func, select, text
from sqlmodel.ext.asyncio.session import AsyncSession
from app.backend.db.config import get_async_session
from app.backend.db.models import *
from app.backend.fuzzy_logic.fuzzy_evaluator import FuzzyEvaluator
from app.backend.MCDA.electre import electre
from app.backend.MCDA.topsis import topsis
from openai import OpenAI
from app.backend.config import settings

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

    update_query = text("""
    WITH price_avgs AS (
        SELECT 
            a.district_id,
            a.street_id,
            a.settlement_id,
            a.microdistrict_id,
            pt.id AS property_type_id,
            CASE WHEN pt.name IN ('Квартира', 'Аппартаменты') THEN o.rooms_count ELSE NULL END AS rooms_count,
            CASE WHEN pt.name IN ('Квартира', 'Аппартаменты') THEN o.renovation_type_id ELSE NULL END AS renovation_type_id,
            CASE WHEN pt.name IN ('Дом', 'Коттедж', 'Таунхаус') THEN o.house_floors_count ELSE NULL END AS house_floors_count,
            AVG(o.price) AS avg_price,
            CASE 
                WHEN a.street_id IS NOT NULL THEN 1
                WHEN a.microdistrict_id IS NOT NULL THEN 2
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
            ON pa_microdistrict.level_order = 2
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

    stats_stmt = select(Offer.price_category, func.count().label("count")).where(Offer.price_category.is_not(None)).group_by(Offer.price_category)
    stats_result = await session.exec(stats_stmt)
    stats = stats_result.all()

    return {
        "message": "Ценовые категории успешно обновлены",
        "status": "success",
        "statistics": {row.price_category: row.count for row in stats},
    }


@analysis_router.post("/recalculate_fuzzy_scores")
async def recalculate_fuzzy_scores(
    session=Depends(get_async_session),
    only_missing: bool = Query(False, description="Обрабатывать только офферы без вычисленных score"),
):
    fuzzy = FuzzyEvaluator()

    logger.info("Collecting infrastructure by addresses...")
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
    logger.info(f"Loaded {len(infra_rows)} infrastructure records")

    address_infra: Dict[int, Dict[str, float]] = {}
    for row in infra_rows:
        addr_id = row.address_id
        key = INFRA_MAP.get(row.infra_type)
        if not key:
            continue
        if addr_id not in address_infra:
            address_infra[addr_id] = {}
        address_infra[addr_id][key] = row.min_distance

    logger.info(f"Infrastructure collected for {len(address_infra)} addresses")

    base_stmt = select(Offer)
    if only_missing:
        base_stmt = base_stmt.where(
            Offer.transport_access_score.is_(None),
            Offer.elderly_score.is_(None),
            Offer.family_score.is_(None),
        )

    total_offers = await session.scalar(select(func.count()).select_from(base_stmt.subquery()))
    logger.info(f"Total offers to process: {total_offers} (only_missing={only_missing})")

    processed = 0
    null_results = 0

    for offset in range(0, total_offers, BATCH_SIZE):
        stmt = base_stmt.offset(offset).limit(BATCH_SIZE).options(joinedload(Offer.address))
        offers = (await session.exec(stmt)).all()
        if not offers:
            break

        for offer in offers:
            if not offer.address_id:
                logger.warning(f"Skipped Offer ID={offer.id}: no address_id")
                continue

            infra = address_infra.get(offer.address_id)
            if not infra:
                logger.warning(f"Offer ID={offer.id}: no infrastructure for address {offer.address_id}")
                infra = {}

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
                "total_rooms": offer.rooms_count or offer.bedrooms_count or 1,
            }
            logger.info(f"data for Offer ID={offer.id}: {data}")

            try:
                result = fuzzy.evaluate_all(data)

                logger.info(
                    "Result: %s",
                    {
                        "transport_access": result.get("transport_access"),
                        "elderly_friendly": result.get("elderly_friendly"),
                        "family_friendly": result.get("family_friendly"),
                    },
                )
                if not result:
                    logger.error(f"Fuzzy returned None for Offer ID={offer.id} (data={data})")
                    null_results += 1
                    continue

                offer.transport_access_score = result["transport_access"]["score"]
                offer.transport_access_category = result["transport_access"]["category"]
                offer.elderly_score = result["elderly_friendly"]["score"]
                offer.elderly_category = result["elderly_friendly"]["category"]
                offer.family_score = result["family_friendly"]["score"]
                offer.family_category = result["family_friendly"]["category"]

                if offer.transport_access_score is None or offer.elderly_score is None or offer.family_score is None:
                    logger.warning(f"Null fuzzy score for Offer ID={offer.id} → result={data}")
                    null_results += 1

            except Exception as e:
                logger.exception(f"Error processing Offer ID={offer.id}: {e} data={data}")
                null_results += 1

        await session.commit()
        processed += len(offers)
        logger.info(f"Processed {processed}/{total_offers} offers")

    logger.info(f"Completed: processed={processed}, with null={null_results}")

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
    alpha_init: float = 0.9,
    beta_init: float = 0.1,
    step: float = 0.05,
):
    evaluations = np.array(json.loads(evaluations), dtype=float)
    weights = np.array(json.loads(weights), dtype=float)
    is_min = np.array(json.loads(is_min), dtype=bool)

    kernel, dominance_info, outranking = electre(evaluations=evaluations, weights=weights, is_min=is_min, alpha_init=alpha_init, beta_init=beta_init, step=step)
    response = {
        "kernel": convert_to_list(kernel),
        "dominance_info": convert_to_list(dominance_info),
        "outranking": convert_to_list(outranking),
        "allIds": list(range(len(evaluations))),
    }

    return response


@analysis_router.post("/chat_assistant")
async def assistant(query: str, session: AsyncSession = Depends(get_async_session)):
    client = OpenAI(api_key=settings.OPEN_ROUTER_API_KEY, base_url="https://openrouter.ai/api/v1")
    response = client.chat.completions.create(
        model="arcee-ai/trinity-large-preview:free",
        messages=[
            {
                "role": "system",
                "content": """Ты — помощник по выбору недвижимости. 
                Твоя задача — вежливо общаться с пользователем и, когда он просит найти недвижимость, 
                формировать корректный SQL-запрос к предоставленной базе данных, 
                а затем возвращать результаты в указанном формате.
                {
                "sql": "ЗДЕСЬ_ТВОЙ_ПОЛНЫЙ_SQL_ЗАПРОС",
                "explanation": "Краткое пояснение на русском языке, почему запрос составлен именно так, основываясь на пожеланиях пользователя."
                }

ИМЕЙ В ВИДУ СЛЕДУЮЩИЕ КЛЮЧЕВЫЕ ПРАВИЛА ПРИ ФОРМИРОВАНИИ ЗАПРОСОВ:
1.  ВСЕГДА возвращай только первые 5 вариантов (используй `LIMIT 5`).
2.  Для каждого найденного объявления (`offer`) возвращай следующие поля: `o.id`, `a.full_address`, `o.price`, `o.is_new_house`, `o.images_urls[1]` (первое изображение), `o.url`, `o.price_category`, `o.family_category`, `o.elderly_category`, `o.transport_access_category`.
3.  Когда пользователь ищет объект "недалеко от центра", "близко к метро" или около другого объекта инфраструктуры, тебе необходимо связать таблицы `offer`, `address` и `address_infrastructure_link`. Фильтруй результаты по полю `distance` в таблице `address_infrastructure_link`.
4.  Если речь идет о метро, в запросе фильтруй по типу инфраструктуры (`infrastructure_type.name`) 'Станция метро'.
5.  В условиях `WHERE` при сравнении с текстовыми значениями из справочников (например, тип недвижимости, категория) ВСЕГДА указывай названия с заглавной буквы, как они должны быть записаны в БД: 'Квартира', 'Дом', 'Коттедж', 'Евроремонт' и т.д.
6.  Названия административных объектов (область, город) используй без указания их типа. Например: 'Брянская' (не 'Брянская область'), 'Брянск' (не 'город Брянск'). Для улиц используй естественный порядок слов: 'Авиационная улица'.
7.  Для фильтрации по категориям (`family_category`, `elderly_category`, `transport_access_category`) используй значения: 'low', 'medium', 'high'. Для `price_category` используй: 'cheap', 'normal', 'expensive'.
8. Твой ответ на запрос пользователя о поиске недвижимости ДОЛЖЕН быть строго в следующем формате, без каких-либо markdown-разметки, комментариев или дополнительного текста:
9. Когда тебя просят найти недвижимость подальше от чего то, не используй координаты, обращайся к таблице  address_infrastructure_link и сортируй по расстоянию до инфраструктуры. В infrastructure содержится так же тип инфраструктуры Цетр города.
10. ИСПОЛЬЗУЙ JOIN ВМЕСТО ПОДЗАПРОСОВ, вместо (SELECT id FROM property_type WHERE name = 'Квартира') делай JOIN ON o.property_type_id = pt.id WHERE pt.name = 'Квартира'.
{
"sql": "ЗДЕСЬ_ТВОЙ_ПОЛНЫЙ_SQL_ЗАПРОС",
"explanation": "Краткое пояснение на русском языке, почему запрос составлен именно так, основываясь на пожеланиях пользователя."
}""",
            },
            {
                "role": "user",
                "content": """СХЕМА БАЗЫ ДАННЫХ ДЛЯ СПРАВКИ:

alter table public.district
    owner to postgres;

create table if not exists public.microdistrict
(
    id         serial
        constraint pk_microdistrict
            primary key,
    name       varchar
        constraint uq_microdistrict_name
            unique,

);

alter table public.microdistrict
    owner to postgres;

create table if not exists public.region
(
    id         serial
        constraint pk_region
            primary key,
    name       varchar
        constraint uq_region_name
            unique,

);

alter table public.region
    owner to postgres;

create table if not exists public.settlement_type
(
    id   serial
        constraint pk_settlement_type
            primary key,
    name varchar
);

alter table public.settlement_type
    owner to postgres;

create table if not exists public.settlement
(
    id                 serial
        constraint pk_settlement
            primary key,
    name               varchar,

    settlement_type_id integer
        constraint fk_settlement_settlement_type_id_settlement_type
            references public.settlement_type
);

alter table public.settlement
    owner to postgres;

create table if not exists public.bathroom_type
(
    id   serial
        constraint pk_bathroom_type
            primary key,
    name varchar
);

alter table public.bathroom_type
    owner to postgres;

create table if not exists public.gas_type
(
    id   serial
        constraint pk_gas_type
            primary key,
    name varchar
);

alter table public.gas_type
    owner to postgres;

create table if not exists public.heating_type
(
    id   serial
        constraint pk_heating_type
            primary key,
    name varchar
);

alter table public.heating_type
    owner to postgres;

create table if not exists public.house_material_type
(
    id   serial
        constraint pk_house_material_type
            primary key,
    name varchar
);

alter table public.house_material_type
    owner to postgres;

create table if not exists public.infrastructure_type
(
    id   serial
        constraint pk_infrastructure_type
            primary key,
    name varchar
);

alter table public.infrastructure_type
    owner to postgres;

create table if not exists public.infrastructure
(
    id                     serial
        constraint pk_infrastructure
            primary key,
    name                   varchar,
    coordinates            geography(Point, 4326),
    infrastructure_type_id integer
        constraint fk_infrastructure_infrastructure_type_id_infrastructure_type
            references public.infrastructure_type,
    constraint uq_infrastructure_name_coordinates
        unique (name, coordinates)
);

alter table public.infrastructure
    owner to postgres;

create index if not exists idx_infrastructure_coordinates
    on public.infrastructure using gist (coordinates);

create table if not exists public.land_type
(
    id   serial
        constraint pk_land_type
            primary key,
    name varchar
);

alter table public.land_type
    owner to postgres;

create table if not exists public.municipality_type
(
    id   serial
        constraint pk_municipality_type
            primary key,
    name varchar
);

alter table public.municipality_type
    owner to postgres;

create index if not exists ix_municipality_type_name
    on public.municipality_type (name);

create table if not exists public.offer_type
(
    id   serial
        constraint pk_offer_type
            primary key,
    name varchar
);

alter table public.offer_type
    owner to postgres;

create table if not exists public.parking_type
(
    id   serial
        constraint pk_parking_type
            primary key,
    name varchar
);

alter table public.parking_type
    owner to postgres;

create table if not exists public.partnership_type
(
    id   serial
        constraint pk_partnership_type
            primary key,
    name varchar
);

alter table public.partnership_type
    owner to postgres;

create table if not exists public.partnership
(
    id                  serial
        constraint pk_partnership
            primary key,
    name                varchar
        constraint uq_partnership_name
            unique,
    partnership_type_id integer
        constraint fk_partnership_partnership_type_id_partnership_type
            references public.partnership_type
);

alter table public.partnership
    owner to postgres;

create table if not exists public.property_type
(
    id   serial
        constraint pk_property_type
            primary key,
    name varchar
);

alter table public.property_type
    owner to postgres;

create table if not exists public.renovation_type
(
    id   serial
        constraint pk_renovation_type
            primary key,
    name varchar
);

alter table public.renovation_type
    owner to postgres;

create table if not exists public.residential_complex
(
    id          serial
        constraint pk_residential_complex
            primary key,
    name        varchar
        constraint uq_residential_complex_name
            unique,
    is_suburban boolean
);

alter table public.residential_complex
    owner to postgres;

create table if not exists public.role
(
    id   serial
        constraint pk_role
            primary key,
    name varchar
        constraint uq_role_name
            unique
);

alter table public.role
    owner to postgres;

create table if not exists public.seller_type
(
    id   serial
        constraint pk_seller_type
            primary key,
    name varchar
);

alter table public.seller_type
    owner to postgres;

create table if not exists public.seller
(
    id              serial
        constraint pk_seller
            primary key,
    name            varchar
        constraint uq_seller_name
            unique,
    rating          double precision,
    foundation_date integer,
    seller_type_id  integer
        constraint fk_seller_seller_type_id_seller_type
            references public.seller_type
);

alter table public.seller
    owner to postgres;

create table if not exists public.sewerage_type
(
    id   serial
        constraint pk_sewerage_type
            primary key,
    name varchar
);

alter table public.sewerage_type
    owner to postgres;

create table if not exists public.street_type
(
    id   serial
        constraint pk_street_type
            primary key,
    name varchar
);

alter table public.street_type
    owner to postgres;

create table if not exists public.street
(
    id             serial
        constraint pk_street
            primary key,
    name           varchar
        constraint uq_street_name
            unique,
    street_type_id integer
        constraint fk_street_street_type_id_street_type
            references public.street_type
);

alter table public.street
    owner to postgres;

create table if not exists public.super_municipality_type
(
    id   serial
        constraint pk_super_municipality_type
            primary key,
    name varchar
);

create table if not exists public.address
(
    id                     serial
        constraint pk_address
            primary key,
    house_number           varchar,
    full_address           varchar,
    coordinates            geography(Point, 4326)
        constraint uq_address_coordinates
            unique,
    region_id              integer
        constraint fk_address_region_id_region
            references public.region,

    settlement_id          integer
        constraint fk_address_settlement_id_settlement
            references public.settlement,
    partnership_id         integer
        constraint fk_address_partnership_id_partnership
            references public.partnership,
    district_id            integer
        constraint fk_address_district_id_district
            references public.district,
    microdistrict_id       integer
        constraint fk_address_microdistrict_id_microdistrict
            references public.microdistrict,
    street_id              integer
        constraint fk_address_street_id_street
            references public.street,
    residential_complex_id integer
        constraint fk_address_residential_complex_id_residential_complex
            references public.residential_complex,
    search_vector          tsvector
);

alter table public.address
    owner to postgres;

create index if not exists idx_address_coordinates
    on public.address using gist (coordinates);

create index if not exists idx_address_search_vector
    on public.address using gin (search_vector);

create index if not exists ix_address_district_id
    on public.address (district_id);

create trigger address_tsvector_update_trigger
    before insert or update
    on public.address
    for each row
execute procedure public.address_tsvector_update();

create table if not exists public.address_infrastructure_link
(
    infrastructure_id integer not null
        constraint fk_address_infrastructure_link_infrastructure_id_infrastructure
            references public.infrastructure
            on delete cascade,
    address_id        integer not null
        constraint fk_address_infrastructure_link_address_id_address
            references public.address
            on delete cascade,
    distance          integer,
    constraint pk_address_infrastructure_link
        primary key (infrastructure_id, address_id)
);

alter table public.address_infrastructure_link
    owner to postgres;

create trigger trg_calc_distance_link
    before insert or update
    on public.address_infrastructure_link
    for each row
execute procedure public.calc_distance_link();

create table if not exists public.water_supply_type
(
    id   serial
        constraint pk_water_supply_type
            primary key,
    name varchar
);

alter table public.water_supply_type
    owner to postgres;

create table if not exists public.window_view_type
(
    id   serial
        constraint pk_window_view_type
            primary key,
    name varchar
);

alter table public.window_view_type
    owner to postgres;

create table if not exists public.offer
(
    id                        serial
        constraint pk_offer
            primary key,
    url                       varchar(500),
    images_urls               varchar(500)[],
    is_new_house              boolean,
    price                     integer,
    price_history             jsonb,
    price_per_square_meter    integer,
    total_area                double precision,
    living_area               double precision,
    kitchen_area              double precision,
    ceiling_height            double precision,
    floor                     integer,
    bathrooms_count           integer,
    has_furniture             boolean,
    description               varchar,
    house_built_year          integer,
    land_area                 double precision,
    is_build_complete         boolean,
    rooms_count               integer,
    bedrooms_count            integer,
    elevators_count           integer,
    balconies_count           integer,
    house_floors_count        integer,
    title                     varchar,
    has_water_supply          boolean,
    has_electricity           boolean,
    has_gas                   boolean,
    has_sewerage              boolean,
    has_heating               boolean,
    has_garbage_chute         boolean,
    has_guard                 boolean,
    has_garage                boolean,
    has_bathhouse             boolean,
    has_pool                  boolean,
    has_terrace               boolean,
    update_date               timestamp with time zone default now(),
    update_date_source        timestamp with time zone,
    contact_phone             varchar(20),
    transport_access_score    double precision,
    transport_access_category varchar,
    elderly_score             double precision,
    elderly_category          varchar,
    family_score              double precision,
    family_category           varchar,
    price_category            varchar,
    address_id                integer
        constraint fk_offer_address_id_address
            references public.address
            on delete cascade,
    offer_type_id             integer
        constraint fk_offer_offer_type_id_offer_type
            references public.offer_type,
    property_type_id          integer
        constraint fk_offer_property_type_id_property_type
            references public.property_type,
    bathroom_type_id          integer
        constraint fk_offer_bathroom_type_id_bathroom_type
            references public.bathroom_type,
    renovation_type_id        integer
        constraint fk_offer_renovation_type_id_renovation_type
            references public.renovation_type,
    window_view_type_id       integer
        constraint fk_offer_window_view_type_id_window_view_type
            references public.window_view_type,
    parking_type_id           integer
        constraint fk_offer_parking_type_id_parking_type
            references public.parking_type,
    house_material_type_id    integer
        constraint fk_offer_house_material_type_id_house_material_type
            references public.house_material_type,
    heating_type_id           integer
        constraint fk_offer_heating_type_id_heating_type
            references public.heating_type,
    gas_type_id               integer
        constraint fk_offer_gas_type_id_gas_type
            references public.gas_type,
    sewerage_type_id          integer
        constraint fk_offer_sewerage_type_id_sewerage_type
            references public.sewerage_type,
    water_supply_type_id      integer
        constraint fk_offer_water_supply_type_id_water_supply_type
            references public.water_supply_type,
    seller_id                 integer
        constraint fk_offer_seller_id_seller
            references public.seller,
    land_type_id              integer
        constraint fk_offer_land_type_id_land_type
            references public.land_type,
    has_elevator              boolean,
    has_balcony               boolean,
    views_count               integer,
    creation_date_source      timestamp with time zone,
    views_history             jsonb,
    last_ten_days_views_count integer,
    daily_views_count         integer,
    source                    varchar,
    identical_urls            varchar(500)[],
    is_active                 boolean                  default true not null
);

alter table public.offer
    owner to postgres;

create index if not exists ix_offer_address_id
    on public.offer (address_id);""",
            },
            {"role": "user", "content": f"{query}"},
        ],
    )
    print(response.choices[0].message.content)
    try:
        data = json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"explanation": "Простите, это вне моей компетенции. Попросите меня найти недвижимость."}
    print(data)
    sql = data["sql"].strip()

    if data.get("sql") is None:
        return {"explanation": "Простите, это вне моей компетенции. Попросите меня найти недвижимость."}

    sql_upper = re.sub(r"--.*?$|/\*.*?\*/", "", sql.upper(), flags=re.S)

    if not sql_upper.lstrip().startswith("SELECT"):
        return {"explanation": "Простите, это вне моей компетенции."}

    if re.search(r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE)\b", sql_upper):
        return {"explanation": "Простите, это вне моей компетенции."}

    if "user" in sql.lower():
        return {"explanation": "Простите, это вне моей компетенции."}
    if "password" in sql.lower():
        return {"explanation": "Простите, это вне моей компетенции."}
    print(sql)
    try:
        result = await session.execute(text(sql))
    except Exception as e:
        return {"sql": sql, "explanation": data["explanation"], "rows": []}
    rows = result.mappings().all()
    print(rows)
    return {"sql": sql, "explanation": data["explanation"], "rows": rows}


def convert_to_list(data):

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
    X = np.array(json.loads(X), dtype=float)
    weights = np.array(json.loads(weights), dtype=float)
    criteria = np.array(json.loads(criteria), dtype=bool)

    scores, ranked_indices = topsis(X, weights, criteria)

    return {"scores": scores.tolist(), "ranked_indices": ranked_indices.tolist()}


@analysis_router.get("/stats")
async def get_offers_by_location(
    region_name: Optional[str] = Query(None, description="Название области"),
    settlement_name: Optional[str] = Query(None, description="Название поселения"),
    municipality_name: Optional[str] = Query(None, description="Название муниципального образования"),
    district_name: Optional[str] = Query(None, description="Название района"),
    microdistrict_name: Optional[str] = Query(None, description="Название микрорайона"),
    street_name: Optional[str] = Query(None, description="Название улицы"),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы поселений"),
    session: AsyncSession = Depends(get_async_session),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    filters = []
    base_filters = []

    location_filters = [
        (Region.short_name, region_name),
        (Settlement.short_name, settlement_name),
        (Municipality.short_name, municipality_name),
        (District.short_name, district_name),
        (Microdistrict.short_name, microdistrict_name),
        (Street.short_name, street_name),
    ]

    for model_field, value in location_filters:
        if value:
            filters.append(model_field == value)
            base_filters.append(model_field == value)

    if is_new_house is not None:
        filters.append(Offer.is_new_house == is_new_house)
        base_filters.append(Offer.is_new_house == is_new_house)

    if settlement_type_names:
        filters.append(SettlementType.name.in_(settlement_type_names))
        base_filters.append(SettlementType.name.in_(settlement_type_names))

    base_query = (
        select(Offer)
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(Municipality, Address.municipality_id == Municipality.id, isouter=True)
        .join(SettlementType, Settlement.settlement_type_id == SettlementType.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
    )

    if filters:
        base_query = base_query.where(and_(*filters))

    subq = base_query.subquery()

    stmt = select(
        func.count().label("total_count"),
        func.sum(case((func.date(func.timezone("Europe/Moscow", subq.c.creation_date_source)) == date.today(), 1), else_=0)).label("offers_today"),
        func.round(func.avg(subq.c.price)).label("avg_price"),
        func.round(func.avg(subq.c.price_per_square_meter)).label("avg_price_per_sqm"),
        func.round(func.avg(subq.c.total_area)).label("avg_area"),
        func.round(func.avg(subq.c.daily_views_count)).label("avg_views_count"),
        func.round(cast(func.min(subq.c.total_area), Numeric(10, 1)), 1).label("min_area"),
        func.round(cast(func.percentile_cont(0.25).within_group(subq.c.total_area), Numeric(10, 1)), 1).label("q1_area"),
        func.round(cast(func.percentile_cont(0.50).within_group(subq.c.total_area), Numeric(10, 1)), 1).label("median_area"),
        func.round(cast(func.percentile_cont(0.75).within_group(subq.c.total_area), Numeric(10, 1)), 1).label("q3_area"),
        func.round(cast(func.max(subq.c.total_area), Numeric(10, 1)), 1).label("max_area"),
        func.round(cast(func.min(subq.c.price), Numeric(12, 1)), 1).label("min_price"),
        func.round(cast(func.percentile_cont(0.25).within_group(subq.c.price), Numeric(12, 1)), 1).label("q1_price"),
        func.round(cast(func.percentile_cont(0.50).within_group(subq.c.price), Numeric(12, 1)), 1).label("median_price"),
        func.round(cast(func.percentile_cont(0.75).within_group(subq.c.price), Numeric(12, 1)), 1).label("q3_price"),
        func.round(cast(func.max(subq.c.price), Numeric(12, 1)), 1).label("max_price"),
    )

    main_stats = await session.execute(stmt)
    main_stats_row = main_stats.first()

    price_cat_stmt = select(subq.c.price_category, func.count()).group_by(subq.c.price_category)
    price_cats = await session.execute(price_cat_stmt)
    price_categories = {"cheap": 0, "normal": 0, "expensive": 0}
    for price_cat, count in price_cats:
        if price_cat in price_categories:
            price_categories[price_cat] = count

    prop_type_stmt = select(PropertyType.name, func.count(subq.c.id)).join(subq, PropertyType.id == subq.c.property_type_id).group_by(PropertyType.name)
    prop_types = await session.execute(prop_type_stmt)
    property_types = {}
    for prop_name, count in prop_types:
        property_types[prop_name] = count

    apartments_subq = base_query.where(PropertyType.name.in_(["Квартира", "Аппартаменты"])).subquery()

    rooms_stmt = select(apartments_subq.c.rooms_count, apartments_subq.c.is_new_house, func.count(apartments_subq.c.id).label("count")).group_by(
        apartments_subq.c.rooms_count, apartments_subq.c.is_new_house
    )
    rooms_data = await session.execute(rooms_stmt)

    rooms_by_count = {}
    apartments_by_house_type = {"new_houses": 0, "secondary": 0}

    for rooms, is_new, count in rooms_data:
        if rooms is not None:
            room_label = f"{rooms}_rooms" if 0 < rooms < 10 else "studio" if rooms == 0 else "open_plan"
            rooms_by_count[room_label] = rooms_by_count.get(room_label, 0) + count

        if is_new is True:
            apartments_by_house_type["new_houses"] += count
        elif is_new is False:
            apartments_by_house_type["secondary"] += count

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
            Address.full_address,
            RenovationType.name.label("renovation_type_name"),
        )
        .join(Address, Offer.address_id == Address.id)
        .join(PropertyType, Offer.property_type_id == PropertyType.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(Municipality, Address.municipality_id == Municipality.id, isouter=True)
        .join(SettlementType, Settlement.settlement_type_id == SettlementType.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
        .join(RenovationType, Offer.renovation_type_id == RenovationType.id, isouter=True)
    )

    if filters:
        top_offers_stmt = top_offers_stmt.where(and_(*filters))

    top_offers_stmt = top_offers_stmt.order_by(Offer.views_count.desc(), Offer.creation_date_source.desc()).limit(5)

    top_offers_result = await session.execute(top_offers_stmt)

    return {
        "total_count": main_stats_row.total_count if main_stats_row else 0,
        "offers_today": main_stats_row.offers_today if main_stats_row else 0,
        "statistics": {
            "averages": {
                "average_price": int(main_stats_row.avg_price) if main_stats_row and main_stats_row.avg_price else None,
                "average_price_per_square_meter": float(main_stats_row.avg_price_per_sqm) if main_stats_row and main_stats_row.avg_price_per_sqm else None,
                "average_area": float(main_stats_row.avg_area) if main_stats_row and main_stats_row.avg_area else None,
                "average_views_count": float(main_stats_row.avg_views_count) if main_stats_row and main_stats_row.avg_views_count else None,
            },
            "area_boxplot": {
                "min": float(main_stats_row.min_area) if main_stats_row and main_stats_row.min_area is not None else None,
                "q1": float(main_stats_row.q1_area) if main_stats_row and main_stats_row.q1_area is not None else None,
                "median": float(main_stats_row.median_area) if main_stats_row and main_stats_row.median_area is not None else None,
                "q3": float(main_stats_row.q3_area) if main_stats_row and main_stats_row.q3_area is not None else None,
                "max": float(main_stats_row.max_area) if main_stats_row and main_stats_row.max_area is not None else None,
            },
            "price_boxplot": {
                "min": float(main_stats_row.min_price) if main_stats_row and main_stats_row.min_price is not None else None,
                "q1": float(main_stats_row.q1_price) if main_stats_row and main_stats_row.q1_price is not None else None,
                "median": float(main_stats_row.median_price) if main_stats_row and main_stats_row.median_price is not None else None,
                "q3": float(main_stats_row.q3_price) if main_stats_row and main_stats_row.q3_price is not None else None,
                "max": float(main_stats_row.max_price) if main_stats_row and main_stats_row.max_price is not None else None,
            },
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
                "address": {"full_address": offer.full_address},
                "renovation_type": {"name": offer.renovation_type_name} if offer.renovation_type_name else None,
            }
            for offer in top_offers_result
        ],
    }


@analysis_router.get("/group-stats")
async def get_grouped_stats(
    group_by: Literal["region", "municipality", "settlement", "district", "microdistrict", "street"] = Query(...),
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    municipality_name: Optional[str] = Query(None, description="Название муниципального образования"),
    district_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
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

    if group_by not in group_map:
        raise HTTPException(400, "Invalid group_by")

    group_col = group_map[group_by]

    filters = []
    if region_name:
        filters.append(Region.short_name == region_name)
    if settlement_name:
        filters.append(Settlement.short_name == settlement_name)
    if municipality_name:
        filters.append(Municipality.short_name == municipality_name)
    if district_name:
        filters.append(District.short_name == district_name)
    if microdistrict_name:
        filters.append(Microdistrict.short_name == microdistrict_name)
    if street_name:
        filters.append(Street.short_name == street_name)
    if settlement_type_names:
        filters.append(SettlementType.name.in_(settlement_type_names))
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
        .select_from(Offer)
        .join(Address, Offer.address_id == Address.id)
        .join(Region, Address.region_id == Region.id, isouter=True)
        .join(Settlement, Address.settlement_id == Settlement.id, isouter=True)
        .join(Municipality, Address.municipality_id == Municipality.id, isouter=True)
        .join(SettlementType, Settlement.settlement_type_id == SettlementType.id, isouter=True)
        .join(District, Address.district_id == District.id, isouter=True)
        .join(Microdistrict, Address.microdistrict_id == Microdistrict.id, isouter=True)
        .join(Street, Address.street_id == Street.id, isouter=True)
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
                "family_categories": {
                    "low": row.family_low,
                    "medium": row.family_medium,
                    "high": row.family_high,
                },
                "elderly_categories": {
                    "low": row.elderly_low,
                    "medium": row.elderly_medium,
                    "high": row.elderly_high,
                },
                "transport_access_categories": {
                    "low": row.transport_low,
                    "medium": row.transport_medium,
                    "high": row.transport_high,
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


@analysis_router.get("/last-10-days-views-history")
async def get_views_last_10_days(
    session: AsyncSession = Depends(get_async_session),
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    municipality_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы населённых пунктов"),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    conditions = [
        "o.views_history IS NOT NULL",
        "jsonb_typeof(o.views_history) = 'array'",
        "(elem->>'date')::timestamptz >= (now() AT TIME ZONE 'utc') - interval '10 days'",
    ]

    params = {}

    if region_name:
        conditions.append("r.short_name = :region_name")
        params["region_name"] = region_name

    if settlement_name:
        conditions.append("s.short_name = :settlement_name")
        params["settlement_name"] = settlement_name

    if municipality_name:
        conditions.append("m.short_name = :municipality_name")
        params["municipality_name"] = municipality_name

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
            (elem->>'date')::date AS date,
            SUM((elem->>'views')::int) AS views
        FROM offer o
        JOIN address a ON o.address_id = a.id
        LEFT JOIN region r ON a.region_id = r.id
        LEFT JOIN settlement s ON a.settlement_id = s.id
        LEFT JOIN municipality m ON a.municipality_id = m.id
        LEFT JOIN settlement_type stt ON s.settlement_type_id = stt.id
        LEFT JOIN district d ON a.district_id = d.id
        LEFT JOIN street st ON a.street_id = st.id
        LEFT JOIN microdistrict md ON a.microdistrict_id = md.id
        CROSS JOIN LATERAL jsonb_array_elements(o.views_history) AS elem
        WHERE {where_clause}
        GROUP BY (elem->>'date')::date
        ORDER BY (elem->>'date')::date
    """)

    result = await session.execute(query, params)
    rows = result.all()

    return [{"date": row.date, "views": row.views} for row in rows]


@analysis_router.get("/average-prices-history")
async def get_average_prices_history(
    region_name: Optional[str] = Query(None),
    settlement_name: Optional[str] = Query(None),
    municipality_name: Optional[str] = Query(None),
    district_name: Optional[str] = Query(None),
    microdistrict_name: Optional[str] = Query(None),
    street_name: Optional[str] = Query(None),
    settlement_type_names: Optional[List[str]] = Query(None, description="Типы населённых пунктов"),
    session: AsyncSession = Depends(get_async_session),
    is_new_house: Optional[bool] = Query(None, description="Новостройка"),
):
    if not any([region_name, settlement_name, municipality_name, district_name, street_name, microdistrict_name, settlement_type_names, is_new_house]):
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
        filters = []
        params = {}

        if region_name is not None:
            filters.append("r.short_name = :region_name")
            params["region_name"] = region_name
        if settlement_name is not None:
            filters.append("s.short_name = :settlement_name")
            params["settlement_name"] = settlement_name
        if municipality_name is not None:
            filters.append("m.short_name = :municipality_name")
            params["municipality_name"] = municipality_name
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

        if settlement_type_names is not None and len(settlement_type_names) > 0:
            placeholders = ", ".join([f":settlement_type_{i}" for i in range(len(settlement_type_names))])
            filters.append(f"stt.name IN ({placeholders})")
            for i, st_name in enumerate(settlement_type_names):
                params[f"settlement_type_{i}"] = st_name

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
                m.short_name AS municipality,
                d.short_name AS district,
                md.short_name AS microdistrict,  
                st.short_name AS street,
                stt.name AS settlement_type,
                jsonb_array_elements(o.price_history) AS ph
            FROM offer o
            JOIN address a ON a.id = o.address_id
            LEFT JOIN region r ON a.region_id = r.id
            LEFT JOIN settlement s ON a.settlement_id = s.id
            LEFT JOIN municipality m ON a.municipality_id = m.id
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
