import asyncio
import json
import logging
import os
import random
import re
from geopy.distance import geodesic
import time
from geoalchemy2 import WKTElement
import overpy
from app.backend.db.models1 import *

from app.backend.parsers.utils import (
    add_address_infrastructure_link,
    add_offer_to_db,
    check_existens_offers,
    check_identical_offers,
    create_offer_from_data,
    find_types,
)
import fake_useragent
import utils
from zendriver.core.connection import ProtocolException
import zendriver
from app.backend.db.config import async_session_maker

PATH_TO_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cian.config")
UA_DESKTOP = fake_useragent.UserAgent(platforms="desktop")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%H:%M:%S",
)


async def parse_offers_cian():
    config = utils.load_config(PATH_TO_CONFIG)
    browser = await zendriver.start(user_agent=UA_DESKTOP.random, headless=False)

    total_offers = 0
    successful_tasks_total = 0

    if config["offer_type"] == "suburban":
        no_need_filters = ["minfloor", "maxfloor", "room"]
        if config["region"] not in [-1, 1]:
            no_need_filters.append("minmcad")
            no_need_filters.append("maxmcad")
    else:
        no_need_filters = ["minmcad", "maxmcad"]
    while True:
        while config["p"] <= config["max_page"]:
            params = "&".join(f"{key}={value}" for key, value in config.items())

            for filters in no_need_filters:
                params = params.replace(f"&{filters}={config[filters]}", "")
            params = params.replace("room", f"room{config['room']}")
            logging.info(params)
            parse_url = (
                "https://cian.ru/cat.php?deal_type=sale&engine_version=2&sort=creation_date_asc&"
                + params
            )

            page = await browser.get(parse_url)

            await page.wait_for_ready_state("loading", timeout=30)
            no_properties = None
            try:
                no_properties = await page.find(
                    text="У нас ещё нет таких объявлений", best_match=True, timeout=3
                )
            except TimeoutError:
                pass
            has_properties = True if not no_properties else False

            if has_properties:
                urls = await page.select_all(
                    '[data-testid="offer-card"] > a[href]',
                    timeout=10,
                )
                tasks = []
                for url in urls:
                    task = asyncio.create_task(
                        parse_offer_to_db(browser, url.attrs["href"])
                    )
                    tasks.append(task)
                    await asyncio.sleep(random.uniform(0, 0.1))
                results = await asyncio.gather(*tasks, return_exceptions=True)
                successful_page_tasks = 0
                duplicates = 0
                errors = 0
                for idx, result in enumerate(results):
                    if isinstance(result, Exception):
                        if "Уже есть в БД" in str(result):
                            duplicates += 1
                        else:
                            print(
                                f"Ошибка в задаче {idx} (URL: {urls[idx].attrs['href']}): {str(result)}"
                            )
                            errors += 1
                        if errors > 10:
                            print(
                                "Сработал антибот, завершаем работу, попробуй спарсить позже"
                            )
                            await browser.stop()
                            return
                    else:
                        successful_page_tasks += 1
                        successful_tasks_total += 1
                    total_offers += 1
                logging.info(
                    f"Спарсили страницу {config['p']}, где добавлено в БД: {successful_page_tasks}, ошибок: {errors}, пропущено: {duplicates}, ВСЕГО спаршено {successful_tasks_total} / {total_offers}"
                )
                try:
                    btn_next = await page.wait_for(
                        selector='[data-name="Pagination"] > :last-child', timeout=3
                    )
                except TimeoutError:
                    btn_next = None

                is_last_page = (
                    True
                    if btn_next is None or "disabled" in btn_next.attributes
                    else False
                )

                if is_last_page:
                    break

                config["p"] += 1
                with open(PATH_TO_CONFIG, "w") as file:
                    json.dump(config, file, indent=2)
                print("Успешно записано в файл")
                await browser.stop()
                browser_args_desktop = [
                    "--window-size=1280,720",
                    "--ignore-gpu-blocklist",
                    f"--user-agent={UA_DESKTOP.random}",
                ]
                browser = await zendriver.start(
                    browser_args=browser_args_desktop, headless=True
                )
                # await asyncio.sleep(5.33)
            else:
                if config["offer_type"] == "suburban":
                    config["object_type"] = 4
                    config["minmcad"] = -1
                    config["maxmcad"] = 0
                else:
                    config["object_type"] += 1
                    config["minfloor"] = 0
                    config["maxfloor"] = 0
                break
        if config["offer_type"] == "suburban":
            config["minmcad"] += 1
            config["maxmcad"] += 1
        else:
            config["minfloor"] += 1
            config["maxfloor"] += 1
        config["p"] = 1
        with open(PATH_TO_CONFIG, "w") as file:
            json.dump(config, file, indent=2)
        print("Успешно записано в файл")


async def parse_offer_to_db(browser: zendriver.Browser, url: str) -> Offer | None:
    already_exist = await check_existens_offers(
        url, session_factory=async_session_maker
    )
    if already_exist:
        logging.warning(f"{url} Уже есть в БД")
        raise Exception("Уже есть в БД")

    start_time = time.time()
    offer_id = re.findall(r"\d+", url)
    max_retries = 3
    # urls = [
    #     f"https://www-cian-ru.translate.goog/sale/flat/{offer_id[0]}/?_x_tr_sl=en&_x_tr_tl=ru&_x_tr_hl=ru&_x_tr_pto=wapp",
    #     url,
    # ]
    urls = [url]
    for attempt in range(max_retries):
        try:
            property_page = await browser.get(random.choice(urls), new_tab=True)

            await property_page.wait_for_ready_state("interactive", timeout=30)
            info_els = await property_page.find_all('phones":[{"countryCode', timeout=2)
            info = await info_els[0].get_html()
            json_info_text = (
                "{" + re.findall(r"\"offerData.*?seoData\"", info)[0] + ':""}}'
            )
            offer_json = json.loads(json_info_text)
            creation_date = offer_json["offerData"]["offer"].get("creationDate")
            offerId = offer_json["offerData"]["offer"].get("id")
            await property_page.get(
                f"https://api.cian.ru/offer-card/v1/get-offer-card-statistic/?offerCreationDate={creation_date[0:10]}&offerId={offerId}"
            )
            views_stats_text = await property_page.get_content()
            await property_page.close()
            views_stats_json = json.loads(re.findall(r"{\".+}", views_stats_text)[0])
            offer_json = offer_json["offerData"]
            offer_json["dailyViews"] = views_stats_json.get("daily", {}).get(
                "dailyViews", {}
            )
            offer_json["lastTenDaysViewsCount"] = (
                int(
                    re.findall(
                        r"\d+", views_stats_json.get("daily", {}).get("totalViews", "")
                    )[0]
                )
                if re.findall(
                    r"\d+", views_stats_json.get("daily", {}).get("totalViews", "")
                )
                else 0
            )
            offer_json["url"] = url
            new_offer_info, address_info = await parse_offer_info(offer_json)

            identical_offers = await check_identical_offers(
                (address_info["latitude"], address_info["longitude"]),
                new_offer_info.get("total_area"),
                new_offer_info.get("living_area"),
                new_offer_info.get("kitchen_area"),
                new_offer_info.get("floor"),
                new_offer_info.get("house_floors_count"),
                async_session_maker,
                url,
            )
            if identical_offers:
                print(
                    f"Идентичные объявления {[offer.url for offer in identical_offers]} для {url}"
                )
                raise Exception("Уже есть в БД", {url})
            type_ids = await find_types(
                async_session_maker, address_info, new_offer_info
            )

            if "suburban" in url:
                infrastructure_info = await parse_infrastructure(
                    coordinates=(address_info["latitude"], address_info["longitude"]),
                    radius=5000,
                )
            else:
                infrastructure_info = await parse_infrastructure(
                    coordinates=(address_info["latitude"], address_info["longitude"])
                )

            new_offer = create_offer_from_data(
                new_offer_info=new_offer_info,
                address_info=address_info,
                type_ids=type_ids,
            )

            address_id = await add_offer_to_db(new_offer, async_session_maker)
            if infrastructure_info:
                await add_address_infrastructure_link(
                    async_session_maker, address_id, infrastructure_info
                )
            # await property_page.close() if property_page else None
            # async with async_session_maker() as session:
            #     await update_price_categories_in_db(session)
            end_time = time.time()
            logging.info(
                f"Удачно добавлено в бд за {(end_time - start_time):.3f} - {url}"
            )
            return new_offer
        except ProtocolException as e:
            print(
                f"Ошибка: {e} на странице: {url},  попытка {attempt + 1} из {max_retries}"
            )
            await property_page.close() if property_page else None
            await asyncio.sleep(5 * (attempt))
        except TimeoutError as e:
            print(
                f"Ошибка: {e} на странице: {url},  попытка {attempt + 1} из {max_retries}"
            )
            await property_page.close() if property_page else None
            await asyncio.sleep(5 * (attempt))
        except Exception as e:
            if "Уже есть в БД" in str(e):
                raise Exception("Уже есть в БД")
            print(
                f"Ошибка: {e} на странице: {url},  попытка {attempt + 1} из {max_retries}"
            )
            await property_page.close() if property_page else None
            await asyncio.sleep(5 * (attempt))
    print(f"НЕУДАЧА {url}")
    print("АНТИБОТ ЗАРАБОТАЛ")
    await property_page.close() if property_page else None
    return


async def parse_offer_info(
    offer_info_json: dict,
) -> tuple[dict[str, str] | None, dict[str, str] | None] | None:
    try:
        offer = offer_info_json["offer"]
        seller = offer_info_json.get("agent", {})
        features = offer_info_json.get("features", [])

        flat_info = next(
            (f["features"] for f in features if f["title"] == "О квартире"), []
        ) or next((f["features"] for f in features if f["title"] == "О доме"), [])
        flat_info += next(
            (
                f["features"]
                for f in features
                if f["title"] == "Коммуникации и удобства"
            ),
            [],
        )
        flat_info = {fi["label"]: fi["value"] for fi in flat_info}

        building_info = next(
            (f["features"] for f in features if f["title"] == "Об участке"), None
        ) or next((f["features"] for f in features if f["title"] == "О доме"), {})
        building_info = {bi["label"]: bi["value"] for bi in building_info}

        new_offer = {
            "url": offer_info_json.get("url"),
            "source": "cian",
            "update_date_source": offer.get("editDate"),
            "views_count": int(
                re.findall(
                    r"(\d+)",
                    offer_info_json.get("stats", {}).get("totalViewsFormattedString"),
                )[0]
            )
            if re.findall(
                r"(\d+)",
                offer_info_json.get("stats", {}).get("totalViewsFormattedString"),
            )
            else 0,
            "daily_views_count": re.findall(
                r" (\d+) за",
                offer_info_json.get("stats", {}).get("totalViewsFormattedString", ""),
            )[0]
            if re.findall(
                r" (\d+) за",
                offer_info_json.get("stats", {}).get("totalViewsFormattedString", ""),
            )
            else 0,
            "views_history": offer_info_json.get("dailyViews"),
            "last_ten_days_views_count": offer_info_json.get("lastTenDaysViewsCount"),
            "creation_date_source": offer.get("creationDate"),
            "is_new_house": True
            if "Новостройка" in flat_info.get("Тип жилья", [])
            else False
            if "Вторичка" in flat_info.get("Тип жилья", [])
            else None,
            "images_urls": [img["fullUrl"] for img in offer.get("photos")]
            if offer.get("photos")
            else None,
            "offer_type": "Продажа" if offer.get("dealType") == "sale" else "Аренда",
            "property_type": "Апартаменты"
            if offer.get("offerType") == "flat" and offer.get("isApartments")
            else "Квартира"
            if offer.get("offerType") == "flat"
            else "Коттедж"
            if offer.get("category") == "cottageSale"
            else "Дом"
            if offer.get("category") == "houseSale"
            else "Таунхаус",
            "house_built_year": building_info.get("Год постройки")
            or building_info.get("Год сдачи")
            or flat_info.get("Год постройки")
            or offer.get("building", {}).get("buildYear")
            or offer.get("building", {}).get("deadline", {}).get("year"),
            "is_build_complete": offer.get("building", {})
            .get("deadline", {})
            .get("isComplete")
            if offer.get("building", {}).get("deadline", {}).get("isComplete")
            is not None
            else False
            if datetime.now().year
            < offer.get("newbuilding", {})
            .get("house", {})
            .get("finishDate", {})
            .get("year", 0)
            else None,
            "description": offer.get("description"),
            "contact_phone": "+7" + offer.get("phones")[0]["number"],
            "seller_type": (
                "Застройщик"
                if seller.get("userType") == "developer"
                else "Агентство недвижимости"
                if seller.get("masterAgent") or seller.get("accountType") == "agency"
                else "Риелтор"
                if seller.get("name")
                else "Автор объявления"
            ),
            "seller_name": seller.get("name")
            if seller.get("companyName") == "Частный маклер"
            else seller.get("companyName")
            or seller.get("name")
            or str(seller.get("id")),
            "seller_foundation_date": (
                offer_info_json.get("company", {}).get("yearFoundation")
                if seller.get("userType") == "developer"
                else seller.get("masterAgent", {}).get("experience")
                or (
                    re.findall(r"\d+", seller.get("experience"))[0]
                    if seller.get("experience")
                    else None
                )
            ),
            "price": offer.get("priceTotal"),
            "price_history": offer_info_json.get("priceChanges"),
            "price_per_square_meter": next(
                (
                    re.findall(r"\d+", item["value"].replace(" ", ""))[0]
                    for item in offer_info_json.get("sidebar")
                    if item["title"] == "Цена за метр"
                ),
                None,
            ),
            "rooms_count": 0
            if offer.get("flatType") == "studio"
            else 10
            if offer.get("offerType") == "flat" and offer.get("roomsCount") is None
            else offer.get("roomsCount"),
            "bedrooms_count": offer.get("bedroomsCount"),
            "total_area": offer.get("totalArea"),
            "living_area": offer.get("livingArea"),
            "land_area": offer.get("land", {}).get("area"),
            "kitchen_area": offer.get("kitchenArea"),
            "floor": offer.get("floorNumber"),
            "house_floors_count": offer.get("building", {}).get("floorsCount")
            or flat_info.get("Количество этажей"),
            "ceiling_height": offer.get("building", {}).get("ceilingHeight"),
            "balconies_count": offer.get("loggiasCount") or offer.get("balconiesCount"),
            "bathrooms_count": offer.get("combinedWcsCount")
            or offer.get("separateWcsCount")
            or offer.get("wcsCount"),
            "bathroom_type": "Раздельный"
            if offer.get("separateWcsCount")
            else "Совмещенный"
            if offer.get("combinedWcsCount")
            else "На улице"
            if offer.get("wcLocationType") == "outdoors"
            else "В доме"
            if offer.get("wcLocationType") == "indoors"
            else None,
            "elevators_count": el_count
            if (
                el_count := sum(
                    [
                        offer.get("building", {}).get("passengerLiftsCount", 0),
                        offer.get("building", {}).get("cargoLiftsCount", 0),
                    ]
                )
            )
            > 0
            else None,
            "has_furniture": offer.get("hasFurniture"),
            "renovation_type": flat_info.get("Отделка") or flat_info.get("Ремонт"),
            "window_view_type": flat_info.get("Вид из окон"),
            "house_material_type": building_info.get("Тип дома")
            or flat_info.get("Материал дома"),
            "parking_type": building_info.get("Парковка"),
            "heating_type": building_info.get("Отопление")
            or flat_info.get("Отопление"),
            "water_supply_type": building_info.get("Водоснабжение")
            or flat_info.get("Водоснабжение"),
            "gas_type": building_info.get("Газоснабжение")
            or (
                flat_info.get("Газ").replace("\xa0", " ")
                if flat_info.get("Газ")
                else None
            ),
            "sewerage_type": building_info.get("Канализация")
            or flat_info.get("Канализация"),
            "land_type": building_info.get("Статус участка"),
            "has_electricity": offer.get("hasElectricity"),
            "has_sewerage": offer.get("hasDrainage"),
            "has_gas": False
            if (flat_info.get("Газ") or building_info.get("Газоснабжение")) == "Нет"
            else True
            if (flat_info.get("Газ") or building_info.get("Газоснабжение"))
            and (flat_info.get("Газ") or building_info.get("Газоснабжение"))
            != "Нет информации"
            else None,
            "has_heating": False
            if (flat_info.get("Отопление") or building_info.get("Отопление")) == "Нет"
            else True
            if (flat_info.get("Отопление") or building_info.get("Отопление"))
            and (flat_info.get("Отопление") or building_info.get("Отопление"))
            != "Нет информации"
            else None,
            "has_water_supply": False
            if (flat_info.get("Водоснабжение") or building_info.get("Водоснабжение"))
            == "Нет"
            else True
            if (flat_info.get("Водоснабжение") or building_info.get("Водоснабжение"))
            and (flat_info.get("Водоснабжение") or building_info.get("Водоснабжение"))
            != "Нет информации"
            else None,
            "has_garage": offer.get("hasGarage"),
            "has_pool": offer.get("hasPool"),
            "has_bathhouse": offer.get("hasBathhouse"),
            "has_guard": offer.get("hasSecurity"),
            "has_terrace": "Терраса" in flat_info.get("Дополнительно")
            if flat_info.get("Дополнительно")
            else None,
            "has_garbage_chute": offer.get("building", {}).get("hasGarbageChute"),
        }
        new_offer["has_elevator"] = True if new_offer["elevators_count"] else None
        new_offer["has_balcony"] = True if new_offer["balconies_count"] else None
        address = await parse_address(offer_info_json)
        return new_offer, address
    except Exception as e:
        logging.error(
            f"Произошла ошибка: {e} в {offer_info_json['url']}", exc_info=True
        )


async def parse_infrastructure(
    coordinates: tuple[float, float], radius: int = 1500, timeout: int = 25
) -> dict[str, list[dict[str, str | tuple[float, float]]]] | None:
    lat, lon = coordinates
    result = {
        "Супермаркет": [],
        "Школа": [],
        "Детский сад": [],
        "Медучреждение": [],
        "Спортивное учреждение": [],
        "Парк": [],
        "Остановка": [],
        "Станция метро": [],
        "Ресторан": [],
        "Университет": [],
        "Аптека": [],
        "Центр города": [],
    }

    unified_query = f"""
    (
      nwr["shop"~"^(supermarket|convenience)$"](around:{radius},{lat},{lon});
      nwr["amenity"~"^(school|kindergarten|hospital|clinic|restaurant|university|pharmacy)$"](around:{radius},{lat},{lon});
      nwr["leisure"~"^(sports_centre|fitness_centre|park)$"](around:{radius},{lat},{lon});
      node["highway"="bus_stop"](around:{radius},{lat},{lon});
      nwr["station"="subway"](around:{radius},{lat},{lon});
      node["railway"="subway_entrance"](around:{radius},{lat},{lon});
      node["place"~"city|town"](around:100000,{lat},{lon});
    );
    out center;
    """

    try:
        server = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
        api = overpy.Overpass(url=server, retry_timeout=10, max_retry_count=5)

        data = await asyncio.to_thread(api.query, unified_query)

        settlement_candidates = []

        def process_element(coords, tags):
            name = tags.get("name") or ("Вход в метро" if tags.get("railway") else None)
            coords_with_name = {"coordinates": coords, "name": name}

            if tags.get("shop") in ["supermarket", "convenience"]:
                result["Супермаркет"].append(coords_with_name)
            elif tags.get("amenity") == "school":
                result["Школа"].append(coords_with_name)
            elif tags.get("amenity") == "kindergarten":
                result["Детский сад"].append(coords_with_name)
            elif tags.get("amenity") in ["hospital", "clinic"]:
                result["Медучреждение"].append(coords_with_name)
            elif tags.get("amenity") == "restaurant":
                result["Ресторан"].append(coords_with_name)
            elif tags.get("amenity") == "university":
                result["Университет"].append(coords_with_name)
            elif tags.get("amenity") == "pharmacy":
                result["Аптека"].append(coords_with_name)
            elif tags.get("leisure") in ["sports_centre", "fitness_centre"]:
                result["Спортивное учреждение"].append(coords_with_name)
            elif tags.get("leisure") == "park":
                result["Парк"].append(coords_with_name)
            elif tags.get("highway") == "bus_stop":
                result["Остановка"].append(coords_with_name)
            elif (
                tags.get("station") == "subway"
                or tags.get("railway") == "subway_entrance"
            ):
                result["Станция метро"].append(coords_with_name)
            elif tags.get("place") in ["city", "town"]:
                settlement_candidates.append(coords_with_name)

        for node in data.nodes:
            coords = (float(node.lat), float(node.lon))
            process_element(coords, node.tags)

        for elem in data.ways + data.relations:
            if hasattr(elem, "center") and elem.center:
                coords = (float(elem.center_lat), float(elem.center_lon))
                process_element(coords, elem.tags)

        if settlement_candidates:
            nearest = min(
                settlement_candidates,
                key=lambda e: geodesic((lat, lon), e["coordinates"]).meters,
            )
            result["Центр города"] = [nearest]

        return result
    except Exception as e:
        print(e)


async def parse_address(json_info: dict) -> dict[str, str | int | float] | None:
    try:
        geo = json_info["offer"]["geo"]
        address_info = geo["address"]

        # добавить ЖК, если есть
        if jk := geo.get("jk"):
            jk_item = next(
                (item for item in address_info if item["locationTypeId"] in [213, 193]),
                None,
            )
            jk_name = jk["name"]
            if jk_item:
                jk_item.update(
                    {
                        "fullName": f"{jk_name} жилой комплекс",
                        "shortName": f"ЖК {jk_name}",
                    }
                )
            else:
                address_info.append(
                    {
                        "fullName": f"{jk_name} жилой комплекс",
                        "name": jk_name,
                        "shortName": f"ЖК {jk_name}",
                        "locationTypeId": 213,
                        "type": "",
                    }
                )

        address = {
            "latitude": geo["coordinates"]["lat"],
            "longitude": geo["coordinates"]["lng"],
            "house_number": next(
                (
                    item["fullName"]
                    for item in address_info
                    if item["type"] == "house" or item["locationTypeId"] == 288
                ),
                None,
            ),
        }

        if region_match := next(
            (
                item
                for item in address_info
                if item["locationTypeId"] == 2 or "Москва" in item["fullName"]
            ),
            None,
        ):
            address["region_full_name"] = region_match["fullName"]
            address["region_name"] = region_match["name"]
            address["region_short_name"] = region_match["shortName"]

        city_matches = [
            item["shortName"]
            for item in address_info
            if item["locationTypeId"] in [161, 1, 149]
            and len(item["fullName"].split()) == 1
        ]

        if address.get("region_name") and address["region_name"] != "Москва":
            city = next(
                (
                    item
                    for item in address_info
                    if item["locationTypeId"] in [161, 1, 149]
                    and len(item["fullName"].split()) == 1
                ),
                None,
            )
        elif city_matches == 2:
            city = next(
                (
                    item
                    for item in address_info
                    if item["locationTypeId"] in [161, 1, 149]
                    and item["name"] != "Москва"
                    and len(item["fullName"].split()) == 1
                ),
                None,
            )
        else:
            city = next(
                (
                    item
                    for item in address_info
                    if item["locationTypeId"] in [161, 1, 149]
                    and item["name"]
                    and len(item["fullName"].split()) == 1
                ),
                None,
            )
        if city:
            city["shortName"] = f"город {city['name']}"
            city["fullName"] = f"г. {city['name']}"
        # TODO ДОБАВИТЬ СУПЕРМУНИЦИПАЛИТИ

        if super_municipality_match := next(
            (
                item
                for item in address_info
                if item["locationTypeId"] in [141, -1] and item["type"] == "location"
            ),
            None,
        ):
            address["super_municipality_full_name"] = super_municipality_match[
                "fullName"
            ]
            address["super_municipality_full_name"] = (
                address["super_municipality_full_name"][0]
                + " "
                + address["super_municipality_full_name"][1:]
                if len(address["super_municipality_full_name"]) == 3
                else address["super_municipality_full_name"][0]
                + " "
                + address["super_municipality_full_name"][1]
                + " "
                + address["super_municipality_full_name"][2:]
                if len(address["super_municipality_full_name"]) == 4
                else address["super_municipality_full_name"]
            )
            address["super_municipality_name"] = super_municipality_match["name"]
            address["super_municipality_short_name"] = super_municipality_match[
                "shortName"
            ]

        if municipality_match := next(
            (
                item
                for item in address_info
                if item["locationTypeId"] in [210, 197, 219, 282, 325, -1, 197]
                and item["type"] not in ["raion", "street", "house", "mikroraion"]
                and address.get("super_municipality_full_name") is None
                or (
                    item["type"] == "okrug"
                    and address.get("super_municipality_full_name") is None
                )
            ),
            None,
        ):
            address["municipality_full_name"] = municipality_match["fullName"]
            address["municipality_full_name"] = (
                address["municipality_full_name"][0]
                + " "
                + address["municipality_full_name"][1:]
                if len(address["municipality_full_name"]) == 3
                else address["municipality_full_name"][0]
                + " "
                + address["municipality_full_name"][1]
                + " "
                + address["municipality_full_name"][2:]
                if len(address["municipality_full_name"]) == 4
                else address["municipality_full_name"]
            )
            address["municipality_name"] = municipality_match["name"]
            address["municipality_short_name"] = municipality_match["shortName"]

        if settlement_matches := [
            item
            for item in address_info
            if item["locationTypeId"] in [161, 1, 149, 186, 185, 187, 177]
        ]:
            address["settlement_full_name"] = settlement_matches[0]["shortName"]
            address["settlement_name"] = settlement_matches[0]["name"]
            address["settlement_short_name"] = settlement_matches[0]["fullName"]
            if len(settlement_matches) == 2:
                address["settlement_full_name"] = settlement_matches[1]["shortName"]
                address["settlement_name"] = settlement_matches[1]["name"]
                address["settlement_short_name"] = settlement_matches[1]["fullName"]

        if partnership_match := next(
            (
                item
                for item in address_info
                if item["locationTypeId"] in [415, 373, 249, 260, 325, 142, 199]
            ),
            None,
        ):
            address["partnership_full_name"] = partnership_match["shortName"]
            address["partnership_name"] = partnership_match["name"]
            address["partnership_short_name"] = partnership_match["fullName"]

        if district_match := next(
            (
                item
                for item in address_info
                if item["type"] == "raion" or item["locationTypeId"] in [141]
            ),
            None,
        ):
            address["district_full_name"] = district_match["fullName"]
            address["district_name"] = district_match["name"]
            address["district_short_name"] = district_match["shortName"]

        if microdistrict_match := next(
            (
                item
                for item in address_info
                if item["type"] == "mikroraion" or item["locationTypeId"] == 174
            ),
            None,
        ):
            address["microdistrict_full_name"] = microdistrict_match["fullName"]
            address["microdistrict_name"] = microdistrict_match["name"]
            address["microdistrict_short_name"] = microdistrict_match["shortName"]

        if street_match := next(
            (item for item in address_info if item["type"] == "street"), None
        ):
            address["street_full_name"] = street_match["fullName"]
            address["street_name"] = street_match["name"]
            address["street_short_name"] = street_match["shortName"]

        if residential_complex_match := next(
            (
                item
                for item in address_info
                if item["locationTypeId"] in [213, 193, 208]
            ),
            None,
        ):
            address["residential_complex_full_name"] = residential_complex_match[
                "fullName"
            ]
            address["residential_complex_name"] = residential_complex_match["name"]
            address["residential_complex_short_name"] = residential_complex_match[
                "shortName"
            ]

            address["is_complex_suburban"] = (
                True
                if "коттеджный поселок" in address["residential_complex_short_name"]
                else False
            )

        address["full_address"] = ", ".join(item["fullName"] for item in address_info)

        return address
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {json_info['url']}", exc_info=True)
