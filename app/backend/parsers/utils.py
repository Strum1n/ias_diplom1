from ast import TypeVar
import json
import logging
import random
from geoalchemy2 import WKTElement
import sqlmodel
import re
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import func
import toml
from app.backend.db.models import *
from sqlalchemy.dialects.postgresql import insert
from sqlmodel import select, tuple_
from sqlalchemy.exc import IntegrityError
import zendriver

from app.backend.parsers.solver_last_with_debug import get_simple_distance

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%H:%M:%S",
)


def deep_parse_json(value):
    if isinstance(value, str):
        s = value.strip()
        if (s.startswith("{") and s.endswith("}")) or (s.startswith("[") and s.endswith("]")):
            try:
                return deep_parse_json(json.loads(s))
            except json.JSONDecodeError:
                return value
        return value

    if isinstance(value, list):
        return [deep_parse_json(v) for v in value]

    if isinstance(value, dict):
        return {k: deep_parse_json(v) for k, v in value.items()}
    return value


def use_config(path: str, read_or_write: Literal["r", "w"], config: dict[str, Any] = {}) -> dict:
    try:
        with open(path, read_or_write, encoding="utf-8") as f:
            config = toml.load(f) if read_or_write == "r" else toml.dump(config, f)
    except Exception as e:
        raise e
    return config


def load_config(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception as e:
        print(e)
    return config


async def check_existens_offers(url: str, session_factory) -> bool:
    async with session_factory() as session:
        session: AsyncSession
        result = await session.exec(select(Offer).where(Offer.url == url))
        return result.first() is not None


async def check_identical_offers(
    coordinates: tuple,
    total_area: int | None,
    living_area: int | None,
    kitchen_area: int | None,
    floor: int | None,
    house_floor_count: int | None,
    session_factory,
    current_url: str | None = None,
):
    """Ищет офферы с точно такими же значениями полей и адресом в радиусе 5 метров.

    Аргументы:
    - `coordinates`: кортеж с координатами (lat, lon) или (lon, lat). Порядок определяется автоматически.
    - остальные поля сравниваются на точное равенство (None -> IS NULL).
    """
    # Разрешаем оба порядка координат: (lat, lon) или (lon, lat)
    async with session_factory() as session:
        session: AsyncSession

        stmt = select(Offer).join(Address, Offer.address_id == Address.id)

        conditions = []

        # Helper to add equality or IS NULL for None
        def _eq_or_isnull(col, value):
            return col.is_(None) if value is None else col == value

        conditions.append(_eq_or_isnull(Offer.total_area, float(total_area) if total_area is not None else None))
        conditions.append(_eq_or_isnull(Offer.living_area, float(living_area) if living_area is not None else None))
        conditions.append(_eq_or_isnull(Offer.kitchen_area, float(kitchen_area) if kitchen_area is not None else None))
        conditions.append(_eq_or_isnull(Offer.floor, int(floor) if floor is not None else None))
        conditions.append(_eq_or_isnull(Offer.house_floors_count, int(house_floor_count) if house_floor_count is not None else None))

        if coordinates[0] is not None and coordinates[1] is not None:
            lat = coordinates[0]
            lon = coordinates[1]
            pt_wkt = f"SRID=4326;POINT({lon} {lat})"

            conditions.append(func.ST_DWithin(Address.coordinates, func.ST_GeogFromText(pt_wkt), 5))

        stmt = stmt.where(*conditions).limit(1)
        result = await session.exec(stmt)
        offers = result.all()

        # Если передан текущий URL, добавим его в поле identical_urls найденных объявлений
        if current_url and offers:
            try:
                for off in offers:
                    # Не добавляем ссылку на самого себя
                    if getattr(off, "url", None) == current_url:
                        continue

                    urls = off.identical_urls or []
                    if current_url not in urls:
                        urls.append(current_url)
                        off.identical_urls = urls
                        session.add(off)
                await session.commit()
            except Exception:
                await session.rollback()
                raise

        return offers


async def captcha_solver_v2(page: zendriver.Tab) -> bool:
    is_captcha_solved = False
    while is_captcha_solved is False:
        geetest_footer = None
        try:
            geetest_footer = await page.select_all(".geetest_footer", 2)
        except TimeoutError:
            pass
        if geetest_footer is None:
            button = await page.select(".button")
            await button.click()
        background_el = await page.wait_for(".geetest_bg")
        await background_el.save_screenshot("background_with_puzzle.png")
        slice_el = await page.select(".geetest_slice")
        await page.evaluate("document.querySelector('.geetest_slice').style.display = 'none';")

        await background_el.save_screenshot("background.png")
        await page.evaluate("document.querySelector('.geetest_slice').style.display = '';")

        distance = get_simple_distance("background_with_puzzle.png", "background.png")
        await slice_el.mouse_drag((distance, 0), relative=True, steps=random.randint(30, 40))
        await page.sleep(5)
        background_el = None
        try:
            background_el = await page.wait_for(".geetest_bg", timeout=2)
        except TimeoutError:
            pass
        if background_el is None:
            print("Капча успешно решена")
            is_captcha_solved = True
            return is_captcha_solved


async def captcha_solver(page: zendriver.Tab):
    print("Пробуем пройти капчу")

    try:
        geetest_footer = None
        try:
            geetest_footer = await page.select_all(".geetest_footer", 2)
        except TimeoutError:
            pass
        if geetest_footer is None:
            button = await page.select(".button")
            await button.click()
        await page.sleep(1.5)
        background_el = await page.select(".geetest_bg")
        await background_el.save_screenshot("background_with_puzzle.png")
        slice_el = await page.select(".geetest_slice")
        await page.evaluate("document.querySelector('.geetest_slice').style.display = 'none';")

        await background_el.save_screenshot("background.png")
        await page.evaluate("document.querySelector('.geetest_slice').style.display = '';")

        distance = get_simple_distance("background_with_puzzle.png", "background.png")
        await slice_el.mouse_drag((distance, 0), relative=True, steps=random.randint(30, 40))
        await page.sleep(5)
        print("Капча возможно пройдена")
        return
    except Exception as e:
        await page.reload()
        print(e)


T = TypeVar("T", bound="BaseModel")


async def add_offer_to_db(new_offer: Offer, session_factory) -> int | None:
    async def get_existing(session: AsyncSession, model: type[T], name: str) -> T | None:
        stmt = select(model).where(model.name == name)
        result = await session.exec(stmt)

        return result.first()

    async with session_factory() as session:
        while True:
            try:
                # Пытаемся добавить новое объявление с новым адресом
                session.add(new_offer)
                await session.commit()
                await session.refresh(new_offer)
                return new_offer.address_id

            except IntegrityError as e:
                await session.rollback()

                if "uq_settlement_full_name" in str(e):
                    stmt = select(Settlement).where(Settlement.full_name == new_offer.address.settlement.full_name)
                    result = await session.exec(stmt)

                    new_offer.address.settlement = result.first()

                elif "uq_municipality_name" in str(e):
                    new_offer.address.municipality = await get_existing(session, Municipality, new_offer.address.municipality.name)

                elif "uq_super_municipality_name" in str(e):
                    new_offer.address.super_municipality = await get_existing(session, SuperMunicipality, new_offer.address.super_municipality.name)

                elif "uq_region_name" in str(e):
                    new_offer.address.region = await get_existing(session, Region, new_offer.address.region.name)

                elif "uq_street_name" in str(e):
                    new_offer.address.street = await get_existing(session, Street, new_offer.address.street.name)

                elif "uq_district_name" in str(e):
                    new_offer.address.district = await get_existing(session, District, new_offer.address.district.name)

                elif "uq_microdistrict_name" in str(e):
                    new_offer.address.microdistrict = await get_existing(session, Microdistrict, new_offer.address.microdistrict.name)

                elif "uq_partnership_name" in str(e):
                    new_offer.address.partnership = await get_existing(session, Partnership, new_offer.address.partnership.name)

                elif "uq_residential_complex_name" in str(e):
                    new_offer.address.residential_complex = await get_existing(
                        session,
                        ResidentialComplex,
                        new_offer.address.residential_complex.name,
                    )

                elif "uq_seller_name" in str(e):
                    new_offer.seller = await get_existing(session, Seller, new_offer.seller.name)

                elif "coordinates" in str(e):
                    coordinates = new_offer.address.coordinates
                    stmt = sqlmodel.select(Address).where(Address.coordinates == coordinates)
                    result = await session.exec(stmt)
                    existing_address = result.first()
                    new_offer.address = existing_address
                else:
                    raise e
            except Exception as e:
                logging.error(f"Произошла ошибка: {e} в {new_offer.url}", exc_info=True)
                return


async def find_types(session_factory, address: dict, new_offer_types: dict) -> dict[str, int] | None:
    try:
        async with session_factory() as session:
            partnership_stmt = select(PartnershipType.id).where(
                PartnershipType.name
                == (
                    re.findall(
                        r"\b(?:[а-яё/]{2,}(?:\s+[а-яё]{2,})*)\b|\b[А-ЯЁ]{2,}\b",
                        address.get("partnership_full_name") or "",
                    )
                    or [None]
                )[0]
            )
            settlement_stmt = select(SettlementType.id).where(SettlementType.name.in_((address.get("settlement_full_name") or "").split()))
            print(
                re.findall(
                    r"\b(?:[а-яё/]{2,}(?:\s+[а-яё]{2,})*)\b|\b[А-ЯЁ]{2,}\b",
                    address.get("super_municipality_full_name") or "",
                )
            )
            super_municipality_stmt = select(SuperMunicipalityType.id).where(
                SuperMunicipalityType.name
                == (
                    re.findall(
                        r"\b(?:[а-яё/]{2,}(?:\s+[а-яё]{2,})*)\b|\b[А-ЯЁ]{2,}\b",
                        address.get("super_municipality_full_name") or "",
                    )
                    or [None]
                )[0]
            )
            municipality_stmt = select(MunicipalityType.id).where(
                MunicipalityType.name
                == (
                    re.findall(
                        r"\b(?:[а-яё/]{2,}(?:\s+[а-яё]{2,})*)\b|\b[А-ЯЁ]{2,}\b",
                        address.get("municipality_full_name") or "",
                    )
                    or [None]
                )[0]
            )
            street_stmt = select(StreetType.id).where(
                StreetType.name
                == (
                    re.findall(
                        r"\b(?:[а-яё/]{2,}(?:\s+[а-яё]{2,})*)\b|\b[А-ЯЁ]{2,}\b",
                        address.get("street_full_name") or "",
                    )
                    or [None]
                )[0]
            )

            renovation_stmt = select(RenovationType.id).where(RenovationType.name == new_offer_types["renovation_type"])
            bathroom_stmt = select(BathroomType.id).where(BathroomType.name == new_offer_types["bathroom_type"])
            window_view_stmt = select(WindowViewType.id).where(WindowViewType.name == new_offer_types["window_view_type"])
            parking_stmt = select(ParkingType.id).where(ParkingType.name == new_offer_types["parking_type"])
            house_material_stmt = select(HouseMaterialType.id).where(HouseMaterialType.name == new_offer_types["house_material_type"])
            heating_stmt = select(HeatingType.id).where(HeatingType.name == new_offer_types["heating_type"])
            gas_stmt = select(GasType.id).where(GasType.name == new_offer_types["gas_type"])
            seller_stmt = select(SellerType.id).where(SellerType.name == new_offer_types["seller_type"])
            sewerage_stmt = select(SewerageType.id).where(SewerageType.name == new_offer_types["sewerage_type"])
            property_stmt = select(PropertyType.id).where(PropertyType.name == new_offer_types["property_type"])
            offer_stmt = select(OfferType.id).where(OfferType.name == new_offer_types["offer_type"])
            land_stmt = select(LandType.id).where(LandType.name == new_offer_types["land_type"])
            water_stmt = select(WaterSupplyType.id).where(WaterSupplyType.name == new_offer_types["water_supply_type"])

            results = []
            for stmt in [
                partnership_stmt,
                settlement_stmt,
                municipality_stmt,
                street_stmt,
                renovation_stmt,
                bathroom_stmt,
                window_view_stmt,
                parking_stmt,
                house_material_stmt,
                heating_stmt,
                gas_stmt,
                seller_stmt,
                sewerage_stmt,
                property_stmt,
                offer_stmt,
                land_stmt,
                water_stmt,
                super_municipality_stmt,
            ]:
                res = await session.exec(stmt)
                results.append(res.first())

            type_ids = {
                "partnership_type_id": results[0],
                "settlement_type_id": results[1],
                "municipality_type_id": results[2],
                "street_type_id": results[3],
                "renovation_type_id": results[4],
                "bathroom_type_id": results[5],
                "window_view_type_id": results[6],
                "parking_type_id": results[7],
                "house_material_type_id": results[8],
                "heating_type_id": results[9],
                "gas_type_id": results[10],
                "seller_type_id": results[11],
                "sewerage_type_id": results[12],
                "property_type_id": results[13],
                "offer_type_id": results[14],
                "land_type_id": results[15],
                "water_supply_type_id": results[16],
                "super_municipality_type_id": results[17],
            }
        return type_ids
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {new_offer_types['url']}", exc_info=True)


async def add_address_infrastructure_link(
    session_factory,
    address_id: int,
    infrastructure_info: dict[str, list[dict[str, str | tuple[float, float]]]],
) -> True | False:
    async with session_factory() as session:
        infra_objects = []
        for infra_type, infra_list in infrastructure_info.items():
            type_stmt = select(InfrastructureType.id).where(InfrastructureType.name == infra_type)
            type_result = await session.exec(type_stmt)
            infra_type_id = type_result.first()

            for infra_data in infra_list:
                infra_objects.append(
                    {
                        "name": infra_data.get("name") or "unknown",
                        "coordinates": WKTElement(
                            f"POINT({infra_data['coordinates'][1]} {infra_data['coordinates'][0]})",
                            srid=4326,
                        ),
                        "infrastructure_type_id": infra_type_id,
                    }
                )

        if infra_objects:
            stmt = insert(Infrastructure).values(infra_objects).on_conflict_do_nothing(index_elements=["name", "coordinates"])
            await session.exec(stmt)

            conditions = [(infra["name"], infra["coordinates"]) for infra in infra_objects]
            infra_query = select(Infrastructure.id).where(tuple_(Infrastructure.name, Infrastructure.coordinates).in_(conditions))
            infra_result = await session.exec(infra_query)
            infra_ids = [row for row in infra_result.all()]

            link_objects = [{"address_id": address_id, "infrastructure_id": infra_id} for infra_id in infra_ids]
            if link_objects:
                stmt = insert(AddressInfrastructureLink).values(link_objects).on_conflict_do_nothing(index_elements=["address_id", "infrastructure_id"])
                await session.exec(stmt)
                await session.commit()
        return True


def create_offer_from_data(new_offer_info, address_info, type_ids):
    """Создает объекты Address, Seller и Offer из данных"""

    # Создание объекта Address
    address = Address(
        full_address=address_info["full_address"],
        coordinates=WKTElement(
            f"POINT({address_info['longitude']} {address_info['latitude']})",
            srid=4326,
        ),
        region=_create_region(address_info, type_ids),
        super_municipality=_create_super_municipality(address_info, type_ids),
        municipality=_create_municipality(address_info, type_ids),
        settlement=_create_settlement(address_info, type_ids),
        partnership=_create_partnership(address_info, type_ids),
        district=_create_district(address_info, type_ids),
        microdistrict=_create_microdistrict(address_info, type_ids),
        street=_create_street(address_info, type_ids),
        residential_complex=_create_residential_complex(address_info, type_ids),
        house_number=address_info.get("house_number"),
    )

    # Создание объекта Seller
    seller = _create_seller(new_offer_info, type_ids)

    # Генерация заголовка
    title = _generate_offer_title(new_offer_info)

    # Создание объекта Offer
    new_offer = Offer(
        url=new_offer_info["url"],
        source=new_offer_info.get("source"),
        identical_urls=new_offer_info.get("identical_urls"),
        update_date_source=datetime.fromisoformat(new_offer_info.get("update_date_source")) if new_offer_info.get("update_date_source") else None,
        creation_date_source=datetime.fromisoformat(new_offer_info.get("creation_date_source")),
        views_count=new_offer_info.get("views_count"),
        daily_views_count=int(new_offer_info.get("daily_views_count")),
        last_ten_days_views_count=new_offer_info.get("last_ten_days_views_count"),
        views_history=new_offer_info.get("views_history"),
        offer_type_id=type_ids.get("offer_type_id"),
        address=address,
        title=title,
        images_urls=new_offer_info.get("images_urls"),
        property_type_id=type_ids.get("property_type_id"),
        renovation_type_id=type_ids.get("renovation_type_id"),
        bathroom_type_id=type_ids.get("bathroom_type_id"),
        window_view_type_id=type_ids.get("window_view_type_id"),
        parking_type_id=type_ids.get("parking_type_id"),
        house_material_type_id=type_ids.get("house_material_type_id"),
        heating_type_id=type_ids.get("heating_type_id"),
        gas_type_id=type_ids.get("gas_type_id"),
        water_supply_type_id=type_ids.get("water_supply_type_id"),
        sewerage_type_id=type_ids.get("sewerage_type_id"),
        land_type_id=type_ids.get("land_type_id"),
        is_new_house=new_offer_info.get("is_new_house"),
        is_build_complete=new_offer_info.get("is_build_complete"),
        house_built_year=int(new_offer_info.get("house_built_year")) if new_offer_info.get("house_built_year") else None,
        description=new_offer_info.get("description"),
        contact_phone=new_offer_info.get("contact_phone"),
        price=new_offer_info.get("price"),
        price_history=new_offer_info.get("price_history"),
        price_per_square_meter=int(new_offer_info.get("price_per_square_meter")),
        rooms_count=new_offer_info.get("rooms_count"),
        bedrooms_count=new_offer_info.get("bedrooms_count"),
        total_area=(float(new_offer_info.get("total_area")) if new_offer_info.get("total_area") else None),
        living_area=(float(new_offer_info.get("living_area")) if new_offer_info.get("living_area") else None),
        kitchen_area=(float(new_offer_info.get("kitchen_area")) if new_offer_info.get("kitchen_area") else None),
        land_area=(float(new_offer_info.get("land_area")) if new_offer_info.get("land_area") else None),
        floor=new_offer_info.get("floor"),
        house_floors_count=new_offer_info.get("house_floors_count"),
        ceiling_height=(float(new_offer_info.get("ceiling_height")) if new_offer_info.get("ceiling_height") else None),
        balconies_count=new_offer_info.get("balconies_count"),
        bathrooms_count=new_offer_info.get("bathrooms_count"),
        elevators_count=new_offer_info.get("elevators_count"),
        has_furniture=new_offer_info.get("has_furniture"),
        has_garbage_chute=new_offer_info.get("has_garbage_chute"),
        has_electricity=new_offer_info.get("has_electricity"),
        has_sewerage=new_offer_info.get("has_sewerage"),
        has_gas=new_offer_info.get("has_gas"),
        has_heating=new_offer_info.get("has_heating"),
        has_water_supply=new_offer_info.get("has_water_supply"),
        has_garage=new_offer_info.get("has_garage"),
        has_terrace=new_offer_info.get("has_terrace"),
        has_guard=new_offer_info.get("has_guard"),
        has_pool=new_offer_info.get("has_pool"),
        has_bathhouse=new_offer_info.get("has_bathhouse"),
        has_elevator=new_offer_info.get("has_elevator"),
        has_balcony=new_offer_info.get("has_balcony"),
        seller=seller,
    )

    return new_offer


# Вспомогательные функции для создания адресных компонентов
def _create_region(address_info, type_ids):
    """Создает объект Region при наличии данных"""
    if address_info.get("region_name"):
        return Region(
            name=address_info.get("region_name"),
            full_name=address_info.get("region_full_name"),
            short_name=address_info.get("region_short_name"),
        )
    return None


def _create_super_municipality(address_info, type_ids):
    """Создает объект SuperMunicipality при наличии данных"""
    if address_info.get("super_municipality_name"):
        return SuperMunicipality(
            name=address_info.get("super_municipality_name"),
            full_name=address_info.get("super_municipality_full_name"),
            short_name=address_info.get("super_municipality_short_name"),
            municipality_type_id=type_ids.get("super_municipality_type_id"),
        )
    return None


def _create_municipality(address_info, type_ids):
    """Создает объект Municipality при наличии данных"""
    if address_info.get("municipality_name"):
        return Municipality(
            name=address_info.get("municipality_name"),
            full_name=address_info.get("municipality_full_name"),
            short_name=address_info.get("municipality_short_name"),
            municipality_type_id=type_ids.get("municipality_type_id"),
        )
    return None


def _create_settlement(address_info, type_ids):
    """Создает объект Settlement при наличии данных"""
    if address_info.get("settlement_name"):
        return Settlement(
            name=address_info.get("settlement_name"),
            full_name=address_info.get("settlement_full_name"),
            short_name=address_info.get("settlement_short_name"),
            settlement_type_id=type_ids.get("settlement_type_id"),
        )
    return None


def _create_partnership(address_info, type_ids):
    """Создает объект Partnership при наличии данных"""
    if address_info.get("partnership_name"):
        return Partnership(
            name=address_info.get("partnership_name"),
            full_name=address_info.get("partnership_full_name"),
            short_name=address_info.get("partnership_short_name"),
            partnership_type_id=type_ids.get("partnership_type_id"),
        )
    return None


def _create_district(address_info, type_ids):
    """Создает объект District при наличии данных"""
    if address_info.get("district_name"):
        return District(
            name=address_info.get("district_name"),
            full_name=address_info.get("district_full_name"),
            short_name=address_info.get("district_short_name"),
            district_type_id=type_ids.get("district_type_id"),
        )
    return None


def _create_microdistrict(address_info, type_ids):
    """Создает объект Microdistrict при наличии данных"""
    if address_info.get("microdistrict_name"):
        return Microdistrict(
            name=address_info.get("microdistrict_name"),
            full_name=address_info.get("microdistrict_full_name"),
            short_name=address_info.get("microdistrict_short_name"),
            microdistrict_type_id=type_ids.get("microdistrict_type_id"),
        )
    return None


def _create_street(address_info, type_ids):
    """Создает объект Street при наличии данных"""
    if address_info.get("street_name"):
        return Street(
            name=address_info.get("street_name"),
            full_name=address_info.get("street_full_name"),
            short_name=address_info.get("street_short_name"),
            street_type_id=type_ids.get("street_type_id"),
        )
    return None


def _create_residential_complex(address_info, type_ids):
    """Создает объект ResidentialComplex при наличии данных"""
    if address_info.get("residential_complex_name"):
        return ResidentialComplex(
            name=address_info.get("residential_complex_name"),
            full_name=address_info.get("residential_complex_full_name"),
            short_name=address_info.get("residential_complex_short_name"),
            is_suburban=address_info.get("is_complex_suburban"),
            complex_type_id=type_ids.get("residential_complex_type_id"),
        )
    return None


def _create_seller(new_offer_info, type_ids):
    """Создает объект Seller"""
    foundation_date = None
    if new_offer_info.get("seller_foundation_date") is not None:
        numbers = re.findall(r"\d+", str(new_offer_info["seller_foundation_date"]))
        if numbers:
            foundation_date = int(numbers[0])

    return Seller(
        name=new_offer_info["seller_name"],
        foundation_date=foundation_date,
        seller_type_id=type_ids["seller_type_id"],
    )


def _generate_offer_title(new_offer_info):
    """Генерирует заголовок предложения на основе данных"""

    def _fmt(*parts):
        """Форматирует части заголовка, пропуская None и пустые строки"""
        return ", ".join(str(x) for x in parts if x not in (None, ""))

    def _g(key):
        """Вспомогательная функция для получения значения из new_offer_info"""
        return new_offer_info.get(key)

    property_type = _g("property_type")
    rooms_count = _g("rooms_count")

    if property_type in ["Квартира", "Апартаменты"] and 0 < (rooms_count or 99) < 10:
        return _fmt(
            f"{_g('rooms_count')}-комн. {_g('property_type').lower()}",
            f"{_g('total_area')} м²" if _g("total_area") else None,
            f"{_g('floor')}/{_g('house_floors_count')} этаж" if _g("floor") and _g("house_floors_count") else None,
        )
    elif property_type in ["Дом", "Таунхаус", "Коттедж"]:
        return _fmt(
            property_type,
            f"{_g('total_area')} м²" if _g("total_area") else None,
            f"{_g('land_area')} сот." if _g("land_area") else None,
            _g("land_type"),
        )
    else:
        # Квартиры-студии или свободная планировка
        if rooms_count == 0:
            if property_type == "Апартаменты":
                room_text = "Апартаменты-студия"
            else:
                room_text = "Квартира-студия"
        else:
            room_text = "Квартира со свободной планировкой"

        return _fmt(
            room_text,
            f"{_g('total_area')} м²" if _g("total_area") else None,
            f"{_g('floor')}/{_g('house_floors_count')} этаж" if _g("floor") and _g("house_floors_count") else None,
        )
