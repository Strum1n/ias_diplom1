import asyncio
import json
import logging
import os
import random
import re
import time
from typing import Literal
from urllib.parse import unquote
from app.backend.db.config import async_session_maker
import dateparser
import overpy
import zendriver as driver
from zendriver import Browser, Tab
from fake_useragent import UserAgent
from geopy.distance import geodesic
from jsonpath_ng import parse

from app.backend.db.models1 import *
from app.backend.parsers.parser_cian import parse_offer_to_db
from app.backend.parsers.utils import (
    add_address_infrastructure_link,
    add_offer_to_db,
    captcha_solver_v2,
    check_existens_offers,
    check_identical_offers,
    create_offer_from_data,
    deep_parse_json,
    find_types,
    use_config,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%H:%M:%S",
)

PATH_TO_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cian.config")
PATH_TO_CIAN_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cian_config.toml")
PATH_TO_AVITO_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "new_config.toml")
UA_DESKTOP = UserAgent(platforms="desktop")
FIRST_CLICK = True
STOP_CREATE_NEW_PAGE = False


async def offers_urls_bypass(source: Literal["avito", "cian"]):
    config = use_config(PATH_TO_AVITO_CONFIG, "r")
    browser = await driver.start(headless=False)
    page = await browser.get(config[source]["url"])
    try:
        await page.wait_for_ready_state("complete", timeout=10)
    except TimeoutError:
        pass
    try:
        is_geetest_captcha = await page.select("#geetest_captcha", 2)
    except TimeoutError:
        is_geetest_captcha = False
    if is_geetest_captcha:
        await captcha_solver_v2(page)
    # TODO добавтиь обработку конца парсинга
    await page.sleep(5)
    while True:
        filtered_offers_count = 0
        if config[source]["price_filter_btn_selector"] != "":
            try:
                price_filter_btn = await page.select(config[source]["price_filter_btn_selector"])
                await price_filter_btn.mouse_click()
            except Exception as e:
                pass
        max_price_filter_el = await page.select(config[source]["max_price_selector"])
        min_price_filter_el = await page.select(config[source]["min_price_selector"])
        while filtered_offers_count < config[source]["items_on_page"] * config[source]["max_available_page"]:
            await max_price_filter_el.focus()
            await max_price_filter_el.send_keys(str(config[source]["max_price"])[-1])
            await page.sleep(1)
            await max_price_filter_el.clear_input()
            await page.evaluate(f"document.querySelector('{config[source]['max_price_selector']}').value={str(config[source]['max_price'])[:-1]};")
            await page.sleep(1)
            await max_price_filter_el.send_keys(str(config[source]["max_price"])[-1])
            await page.sleep(3)

            await min_price_filter_el.focus()
            await min_price_filter_el.send_keys(str(config[source]["min_price"])[-1])
            await page.sleep(1)
            await min_price_filter_el.clear_input()
            await page.evaluate(f"document.querySelector('{config[source]['min_price_selector']}').value={str(config[source]['min_price'])[:-1]};")
            await page.sleep(1)
            await min_price_filter_el.send_keys(str(config[source]["min_price"])[-1])
            await page.sleep(3)
            try:
                filter_btn = await page.select(config[source]["filter_btn_selector"])
            except Exception as e:
                filter_btn = await page.select('[data-marker="page-title/count"]')
            filtered_offers_count = int(re.findall(r"\d+", filter_btn.text_all.replace(" ", ""))[0]) if re.findall(r"\d+", filter_btn.text_all.replace(" ", "")) else 0
            if filtered_offers_count > config[source]["items_on_page"] * config[source]["max_available_page"] or "Показать больше 1 тыс. объявлений" in filter_btn.text_all:
                config[source]["max_price"] -= config[source]["price_step"]
                break
            elif "Ничего не найден" in filter_btn.text_all:
                await page.reload()
            else:
                config[source]["max_price"] += config[source]["price_step"]
        await filter_btn.click()
        await filter_btn.mouse_click()
        await page.sleep(1.5)
        await parse_offers_from_urls(browser, page, config, source)


TOTAL_OFFERS = 0
SUCCESFULL_OFFERS = 0


async def parse_offers_from_urls(browser: Browser, page: Tab, config: dict, source: Literal["avito", "cian"]):
    while True:
        if "?p" in page.url:
            url_with_page_number = page.url.replace(f"?p={str(config[source]['p'] - 1)}", "") + f"?p={str(config[source]['p'])}"
        else:
            url_with_page_number = page.url.replace(f"&p={str(config[source]['p'] - 1)}", "") + f"&p={str(config[source]['p'])}"
        await page.get(url_with_page_number)
        await page.wait_for_ready_state("interactive")
        await page.sleep(1.5)
        if source == "avito":
            offers_urls = [config[source]["domen_url"] + url_el.attrs["href"].split("?")[0] for url_el in await page.select_all(config[source]["offer_urls_selector"])]
        elif source == "cian":
            offers_urls = [url_el.attrs["href"].split("?")[0] for url_el in await page.select_all(config[source]["offer_urls_selector"])]
        global TOTAL_OFFERS
        global SUCCESFULL_OFFERS

        tasks = []
        for url in offers_urls:
            while STOP_CREATE_NEW_PAGE == True:
                await asyncio.sleep(5)
            active_tasks = [t for t in tasks if not t.done()]
            if source == "avito":
                task = asyncio.create_task(parse_offer_to_db_avito(browser, url))
            elif source == "cian":
                task = asyncio.create_task(parse_offer_to_db(browser, url))
            tasks.append(task)
            if source == "avito":
                await asyncio.sleep(random.uniform(2, 2.5))
            if source == "cian":
                await asyncio.sleep(random.uniform(0.75, 1.1))
        results = await asyncio.gather(*tasks, return_exceptions=True)
        successful_page_tasks = 0
        duplicates = 0
        errors = 0
        for idx, result in enumerate(results):
            if isinstance(result, Exception):
                if "Уже есть в БД" in str(result):
                    duplicates += 1
                else:
                    print(f"Ошибка в задаче {idx} (URL: {offers_urls[idx]}): {str(result)}")
                    errors += 1
                if source == "cian":
                    if errors > 5:
                        print("Превышен лимит запросов с IP")
                        print("Ожидаем для сброса лимитов")
                        await asyncio.sleep(15)
            else:
                successful_page_tasks += 1
                SUCCESFULL_OFFERS += 1
            TOTAL_OFFERS += 1
        print(
            f"Спарсили страницу {config[source]['p']}, c которой добавлено в БД: {successful_page_tasks}, ошибок: {errors}, пропущено: {duplicates}, ВСЕГО спаршено {SUCCESFULL_OFFERS} / {TOTAL_OFFERS}"
        )
        next_page_btn = None
        try:
            next_page_btn = await page.select(config[source]["next_btn_selector"], timeout=2)
        except Exception as e:
            print(f"Спарсили последнюю страницу {config[source]['p']} c ценами {config[source]['min_price']} - {config[source]['max_price']}")
        if next_page_btn is None:
            config[source]["p"] = 1
            config[source]["min_price"] = config[source]["max_price"] + 1
            config[source]["max_price"] += config[source]["price_step"]
            use_config(PATH_TO_AVITO_CONFIG, "w", config)
            return
        config[source]["p"] += 1
        use_config(PATH_TO_AVITO_CONFIG, "w", config)


async def parse_offer_to_db_avito(browser: driver.Browser, url: str) -> Offer | None:
    already_exist = await check_existens_offers(url, session_factory=async_session_maker)
    if already_exist:
        logging.warning(f"{url} Уже есть в БД")
        raise Exception("Уже есть в БД")
    start_time_origin = time.time()
    max_retries = 6
    property_page = None
    global STOP_CREATE_NEW_PAGE
    global FIRST_CLICK
    for attempt in range(max_retries):
        print(STOP_CREATE_NEW_PAGE)
        try:
            if property_page is None:
                property_page = await browser.get(url, new_tab=True)

            else:
                await property_page.reload()
                await property_page.sleep(1.5)

            if "Иногда такое случается, чтобы вернуться на сайт <b>нажмите на кнопку Продолжить</b> для решения капчи" in await property_page.get_content():
                raise Exception
            offer_info_el = await property_page.find("buyerItem", timeout=3)
            offer_info_raw_text_encoded = await offer_info_el.get_html()
            offer_info_raw_text_encoded = offer_info_raw_text_encoded.split("<script>window.__staticRouterHydrationData = JSON.parse(")[1].split(");</script>")[0]
            offer_info_raw_text_decoded = unquote(offer_info_raw_text_encoded)
            offer_json = deep_parse_json(json.loads(offer_info_raw_text_decoded.replace("\xa0", "")))
            json_text = json.dumps(offer_json, ensure_ascii=False)
            await property_page.sleep(0.25)
            try:
                price_history_el = await property_page.select(".price-history__cursorPointer___XzY5ZW", 3)
                price_history_el = price_history_el.children[1]
                await price_history_el.mouse_move()
                price_h = await property_page.select(".style__container___XzhlND", timeout=2)
            except Exception as e:
                close_btn = await property_page.select('[data-marker="NOT_INTERESTING_MARKER"]', 2)
                await close_btn.mouse_click()
                continue
            matches = re.findall(r"(\d{1,2}\s+[а-яё]+(?:\s+\d{4})?)\s+(\d+)\s*₽(?:\s+\d+\s*₽)?", price_h.text_all.replace("\u2009", ""))

            price_history_result = []
            for i, (date_str, price_str) in enumerate(matches):
                date_obj = dateparser.parse(date_str, languages=["ru"])

                change_time = date_obj.isoformat() + "+00:00"

                item = {"priceData": {"price": int(price_str), "currency": "rur"}, "changeTime": change_time}

                price_history_result.append(item)

            start_time_parse_offer_info_from_json = time.time()
            if price_history_result is None:
                logging.warning(f"Ошибка, попытка {attempt}")
                continue
            await property_page.close()
            offer_json["priceHistoryGenerated"] = price_history_result
            start_time1 = time.time()

            address_info = await parse_address(offer_json, url)

            if address_info is None:
                logging.warning(f"Неверный геокод, пропуск: {url}")
                raise Exception("Уже есть в БД")
            end_time1 = time.time()

            new_offer_info = await parse_offer_info(offer_json)
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
                print(f"Идентичные объявления {[offer.url for offer in identical_offers]} для {url}")
                return
            end_time_parse_offer_info_from_json = time.time()

            type_ids = await find_types(async_session_maker, address_info, new_offer_info)

            if "suburban" or "doma_dachi_kottedzhi" in url:
                infrastructure_info = await parse_infrastructure(
                    coordinates=(address_info["latitude"], address_info["longitude"]),
                    radius=5000,
                )
            else:
                infrastructure_info = await parse_infrastructure(coordinates=(address_info["latitude"], address_info["longitude"]))

            new_offer = create_offer_from_data(new_offer_info, address_info, type_ids=type_ids)

            address_id = await add_offer_to_db(new_offer, async_session_maker)
            if infrastructure_info:
                await add_address_infrastructure_link(async_session_maker, address_id, infrastructure_info)

            end_time = time.time()
            print()
            logging.info(f"Удачно добавлено в бд за {(end_time - start_time_origin):.3f} - {url}")
            print()

            return new_offer
        except Exception as e:
            print(e)
            if "no close frame" in str(e):
                print(f"Ошибка, {e} в {url}")
                property_page = None
                continue
            elif "Уже есть в БД" in str(e):
                await property_page.close()
                raise Exception(f"Уже есть в БД, {url}")
            elif "Иногда такое случается, чтобы вернуться на сайт <b>нажмите на кнопку Продолжить</b> для решения капчи" in await property_page.get_content():
                STOP_CREATE_NEW_PAGE = True
                is_captcha_solved = await captcha_solver_v2(property_page)
                if is_captcha_solved:
                    STOP_CREATE_NEW_PAGE = False
                else:
                    continue
            elif "Доступ ограничен" not in await property_page.get_content():
                STOP_CREATE_NEW_PAGE = False
                FIRST_CLICK = True
                continue
            else:
                print(e)

    else:
        STOP_CREATE_NEW_PAGE = False
        print("Неудача: ", url)
        await property_page.close()
        return


async def parse_address(json_data: dict, url: str):
    try:
        geo_info = json_data["loaderData"]["catalog-or-main-or-item"]["buyerItem"]["item"]["geo"]

        overpass_query = f"""
[out:json][timeout:25];

/* Найти все объекты, содержащие точку */
is_in({geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})->.a;

/* Административные границы */
relation(pivot.a)
  ["boundary"="administrative"]
  -> .admin;

/* ===== НАСЕЛЁННЫЙ ПУНКТ (БЕЗ SUBURB) ===== */
(
  node(around:7000,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"city|town|village|hamlet"];
  relation(around:7000,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"city|town|village|hamlet"];
) -> .place;

/* ===== SUBURB (ТОЛЬКО ЕСЛИ ТОЧКА СТОИТ В НЁМ) ===== */
(
  node(around:1,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"suburb|residential"];
  relation(around:1,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"suburb|residential"];
    way(around:1,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"suburb|residential"];
) -> .suburb;

/* ===== УЛИЦА ===== */
way["highway"]["name"](around:300,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
  -> .street;

/* ===== ЖИЛОЙ КОМПЛЕКС ===== */

/* 1. ЖК как site */
relation(around:150,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
  ["site"="apartment_complex"]
  ["name"]
  -> .residential_site;

/* 2. ЖК как place */
(
  node(around:150,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"neighbourhood|quarter|residential"]
    ["name"];
  relation(around:150,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["place"~"neighbourhood|quarter|residential"]
    ["name"];
) -> .residential_place;

/* 3. ЖК как landuse */
(
  way(around:150,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["landuse"="residential"]
    ["name"];
  relation(around:150,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["landuse"="residential"]
    ["name"];
) -> .residential_landuse;

/* ===== СНТ / ДАЧНЫЕ ТОВАРИЩЕСТВА ===== */
(
  way(around:300,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["landuse"="allotments"]
    ["name"];
  relation(around:300,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["landuse"="allotments"]
    ["name"];
) -> .allotments;

/* ===== ВЫВОД ===== */
.admin               out tags;
.place               out tags center;
.suburb              out tags center;
.street              out tags center;
.residential_site    out tags;
.residential_place   out tags;
.residential_landuse out tags;
.allotments          out tags;
    """
        overpass_query = f"""
[out:json];
is_in({geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})->.areas;

(
  node(pivot.areas);
  way(pivot.areas);
  relation(pivot.areas);
)->.inside;

way["highway"]["name"](around:600,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
  -> .street;

(
  node
    (around:1000,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["name"~"район",i];
  way
    (around:1000,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["name"~"район",i];
  relation
    (around:1000,{geo_info["coords"]["lat"]},{geo_info["coords"]["lng"]})
    ["name"~"район",i];
)-> .microdistrict;

.inside out tags center;
.street out tags center;
.microdistrict out tags center;
    """
        api = overpy.Overpass(url="https://maps.mail.ru/osm/tools/overpass/api/interpreter", retry_timeout=10, max_retry_count=5)

        data = await asyncio.to_thread(api.query, overpass_query)

        region = next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "4"), None)
        settlement = [
            relation
            for relation in [*data.relations, *data.nodes]
            if (relation.tags.get("place", "ы") in ["city", "town", "village", "hamlet"] and relation.tags["name"] in geo_info["address"])
        ] or [relation for relation in [*data.relations, *data.ways] if (relation.tags.get("place", "ы") in ["city", "town", "village", "hamlet"] and relation.tags["name"])]
        settlement = settlement[0].tags
        if settlement is None and region == "Москва":
            settlement = {"name": "Москва"}

        settlement_types_prefix = {"деревня": "д.", "поселок": "пос.", "поселок городского типа": "пгт.", "рабочий поселок": " рп.", "село": "с.", "город": "г."}
        if re.search(r"д\.\s+[А-ЯЁA-Z]", geo_info["address"]) is None:
            del settlement_types_prefix["деревня"]
        found_settlement_type = next((key for key, value in settlement_types_prefix.items() if value in geo_info["address"]), "город")

        if settlement:
            settlement_name = settlement["name"]
            settlement_full_name = found_settlement_type + " " + settlement_name
            settlement_short_name = settlement_types_prefix[found_settlement_type] + " " + settlement_name

        super_municipality = next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "6" and "район" in relation.tags["name"]), None)

        municipality = (
            next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "5"), None)
            if region == "Москва"
            else next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") in ["8", "6"] and "район" not in relation.tags["name"]), None)
        )

        district = (
            next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "8"), None)
            if region == "Москва"
            else next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "9"), None)
        )
        if "район" in geo_info["address"] or "мкр" in geo_info["address"]:
            print(geo_info["address"])

        partnership = next(
            (
                way.tags["name"]
                for way in [*data.relations, *data.ways]
                if way.tags.get("landuse") in ["allotments", "residential"]
                and re.findall(r"(?<!\S)[А-ЯЁ][А-Яа-яёЁ-]*", way.tags.get("name", ""))
                and "микрорайон" not in way.tags.get("name", "")
                and re.findall(r"(?<!\S)[А-ЯЁ][А-Яа-яёЁ-]*", way.tags["name"])[0] in geo_info["address"]
            ),
            None,
        )

        street = next(
            (
                way.tags["name"]
                for way in data.ways
                if way.tags.get("name", "") != partnership
                and re.findall(r"\b[A-ZА-ЯЁ0-9][^ \n\r\t]*\b", way.tags.get("name", ""))
                and way.tags.get("name", "") != settlement_name
                and "микрорайон" not in way.tags.get("name", "")
                and re.findall(r"\b[A-ZА-ЯЁ0-9][^ \n\r\t]*\b", way.tags["name"])[0].split()[len(re.findall(r"\b[A-ZА-ЯЁ0-9][^ \n\r\t]*\b", way.tags["name"])[0].split()) - 1]
                in geo_info["address"]
            ),
            None,
        )

        microdistrict = next(
            (
                relation.tags["name"]
                for relation in [*data.relations, *data.nodes, *data.ways]
                if ("микрорайон" in relation.tags.get("name", "") or "микрорайон" in relation.tags.get("alt_name", ""))
                and (
                    relation.tags.get("name", "ы") != street
                    and relation.tags.get("alt_name", "ы") != street
                    and relation.tags.get("name").replace("микрорайон", "").replace("мкр.", "").replace("мкр", "").replace("мкр-н", "").strip() in geo_info["address"]
                    or relation.tags.get("alt_name", "ы").replace("микрорайон", "").replace("мкр.", "").replace("мкр", "").replace("мкр-н", "").strip() in geo_info["address"]
                )
            ),
            None,
        )

        residential_complex = None
        residential_complex = (
            json_data["loaderData"]["catalog-or-main-or-item"]["buyerItem"]["item"]["houseParams"]["data"]["items"][0]["description"]
            if json_data["loaderData"]["catalog-or-main-or-item"]["buyerItem"]["item"].get("houseParams")
            and "Название новостройки" in json_data["loaderData"]["catalog-or-main-or-item"]["buyerItem"]["item"]["houseParams"]["data"]["items"][0]["title"]
            else None
        )
        if residential_complex is None:
            residential_complex = (
                re.findall(r"(?:(?<=кп\s)|(?<=жк\s)|(?<=жилой комплекс\s)|(?<=коттеджный посёлок\s)|(?<=коттеджный поселок\s))[^,]+", geo_info["address"])[0]
                if re.findall(r"(?:(?<=кп\s)|(?<=жк\s)|(?<=жилой комплекс\s)|(?<=коттеджный посёлок\s)|(?<=коттеджный поселок\s))[^,]+", geo_info["address"])
                else None
                or next((way.tags["name"] for way in data.ways if way.tags.get("landuse") in ["allotments", "construction"] and way.tags.get("name") != partnership), None)
            )
        if residential_complex is None:
            residential_complex = next((relation.tags["name"] for relation in data.relations if "ЖК" in relation.tags.get("name", "")), None)

        partnership_name = partnership
        partnership_full_name = partnership
        partnership_short_name = partnership

        if region:
            region_name = region.replace(" область", "")
            region_full_name = region
            region_short_name = region.replace(" область", " обл.")

        if municipality:
            municipality_name = re.findall(
                r"(?:\b[А-ЯЁ][а-яё]{1,3}\\.\s+)?(?:(?:\d+-[а-яё]+\s+)?[А-ЯЁ][а-яё]+(?:-[А-ЯЁ]?[а-яё]+)*(?:\s+[А-ЯЁ][а-яё]+(?:-[А-ЯЁ]?[а-яё]+)*)*(?:\s+[А-ЯЁ]+)?)",
                municipality,
            )[0]

            municipality_full_name = municipality
            municipality_short_name = municipality
            if "административный округ" in municipality:
                municipality = (
                    municipality.replace("Северо-Западный административный округ", "СВАО")
                    .replace("Юго-Западный административный округ", "ЮЗАО")
                    .replace("Западный административный округ", "ЗАО")
                    .replace("Северо-Восточный административный округ", "СВАО")
                    .replace("Юго-Восточный административный округ", "ЮВАО")
                    .replace("Северный административный округ", "САО")
                    .replace("Восточный административный округ", "ВАО")
                    .replace("Центральный административный округ", "ЦАО")
                    .replace("Южный административный округ", "ЮАО")
                    .replace("Зеленоградский административный округ", "ЗелАО")
                    .replace("Троицкий административный округ", "ТАО (Троицкий)")
                    .replace("Новомосковский административный округ", "НАО (Новомосковский)")
                )
                municipality_full_name = municipality
                municipality_short_name = municipality
                municipality_name = municipality
        if super_municipality:
            super_municipality_name = re.findall(
                r"(?:\b[А-ЯЁ][а-яё]{1,3}\.\s+)?(?:(?:\d+-[а-яё]+\s+)?[А-ЯЁ][а-яё]+(?:-[А-ЯЁ]?[а-яё]+)*(?:\s+[А-ЯЁ][а-яё]+(?:-[А-ЯЁ]?[а-яё]+)*)*(?:\s+[А-ЯЁ]+)?)",
                super_municipality,
            )[0]
            super_municipality_full_name = super_municipality
            super_municipality_short_name = super_municipality

        if district:
            district_name = district.replace("район", "").replace("р-н", "").strip()
            district_short_name = "р-н " + district.replace("район", "").replace("р-н", "").strip()
            district_full_name = "район " + district.replace("район", "").replace("р-н", "").strip()

        if microdistrict:
            microdistrict_name = microdistrict.replace("микрорайон", "").strip()
            microdistrict_short_name = "мкр. " + microdistrict.replace("микрорайон", "").strip()
            microdistrict_full_name = "микрорайон " + microdistrict.replace("микрорайон", "").strip()

        street_types = {
            "шоссе": ("шоссе", "ш."),
            "тупик": ("тупик", "туп."),
            "аллея": ("аллея", "ал."),
            "проспект": ("проспект", "просп."),
            "бульвар": ("бульвар", "бул."),
            "набережная": ("набережная", "наб."),
            "переулок": ("переулок", "пер."),
            "проезд": ("проезд", "пр."),
            "площадь": ("площадь", "пл."),
            "улица": ("улица", "ул."),
        }

        street_keys = next((values for key, values in street_types.items() if street and any(v in street.lower() for v in values)), None)
        if street_keys:
            street_name = street.replace(street_keys[0], "").replace(" (дублёр)", "").strip()
            street_full_name = street_keys[0] + " " + street.replace(street_keys[0], "").replace(" (дублёр)", "").strip()
            street_short_name = street_keys[1] + " " + street.replace(street_keys[0], "").replace(" (дублёр)", "").strip()

        if residential_complex:
            residential_complex_name = (
                residential_complex.replace("жилой комплекс", "").replace("Жилой комплекс", "").replace("ЖК", "").replace("Коттеджный посёлок", "").replace("КП", "").strip()
            )
            if "Коттеджный посёлок" not in residential_complex:
                residential_complex_name = residential_complex.replace("жилой комплекс", "").replace("Жилой комплекс", "").replace("ЖК", "").strip()
                residential_complex_short_name = "ЖК " + residential_complex_name[0].lower() + residential_complex_name[1:]
                residential_complex_full_name = residential_complex_name + " жилой комплекс"
            else:
                residential_complex_name = residential_complex.replace("Коттеджный посёлок", "").replace("коттеджный посёлок", "").replace("КП", "").strip()
                residential_complex_short_name = "КП " + residential_complex_name[0].lower() + residential_complex_name[1:]
                residential_complex_full_name = residential_complex_name + " коттеджный поселок"
            is_suburban = True if "коттеджный поселок" in residential_complex_full_name else False
        house_number = re.findall(r"(?:д\.\s*)?(\d+[\w/]*)(?=\s*(?:,|р-н|$))", geo_info["address"])
        if house_number:
            house_number = house_number[0].strip().replace(",", "").replace("корп.", "к").replace(" ", "")

        address = {
            "latitude": geo_info["coords"]["lat"],
            "longitude": geo_info["coords"]["lng"],
            "region_name": region_name if "region_name" in locals() else None,
            "region_full_name": region_full_name if "region_full_name" in locals() else None,
            "region_short_name": region_short_name if "region_short_name" in locals() else None,
            "super_municipality_name": super_municipality_name if "super_municipality_name" in locals() else None,
            "super_municipality_full_name": super_municipality_full_name if "super_municipality_full_name" in locals() else None,
            "super_municipality_short_name": super_municipality_short_name if "super_municipality_short_name" in locals() else None,
            "municipality_name": municipality_name if "municipality_name" in locals() else None,
            "municipality_full_name": municipality_full_name if "municipality_full_name" in locals() else None,
            "municipality_short_name": municipality_short_name if "municipality_short_name" in locals() else None,
            "settlement_name": settlement_name if "settlement_name" in locals() else None,
            "settlement_full_name": settlement_full_name if "settlement_full_name" in locals() else None,
            "settlement_short_name": settlement_short_name if "settlement_short_name" in locals() else None,
            "partnership_name": partnership_name if "partnership_name" in locals() else None,
            "partnership_full_name": partnership_full_name if "partnership_full_name" in locals() else None,
            "partnership_short_name": partnership_short_name if "partnership_short_name" in locals() else None,
            "district_name": district_name if "district_name" in locals() else None,
            "district_full_name": district_full_name if "district_full_name" in locals() else None,
            "district_short_name": district_short_name if "district_short_name" in locals() else None,
            "microdistrict_name": microdistrict_name if "microdistrict_name" in locals() else None,
            "microdistrict_full_name": microdistrict_full_name if "microdistrict_full_name" in locals() else None,
            "microdistrict_short_name": microdistrict_short_name if "microdistrict_short_name" in locals() else None,
            "street_name": street_name if "street_name" in locals() else None,
            "street_full_name": street_full_name if "street_full_name" in locals() else None,
            "street_short_name": street_short_name if "street_short_name" in locals() else None,
            "residential_complex_name": residential_complex_name if "residential_complex_name" in locals() else None,
            "residential_complex_full_name": residential_complex_full_name if "residential_complex_full_name" in locals() else None,
            "residential_complex_short_name": residential_complex_short_name if "residential_complex_short_name" in locals() else None,
            "is_complex_suburban": True if ("is_suburban" in locals() and is_suburban) else False if ("is_suburban" in locals() and is_suburban == False) else None,
            "house_number": house_number,
        }

        if region == "Москва":
            address = {
                "latitude": geo_info["coords"]["lat"],
                "longitude": geo_info["coords"]["lng"],
                "region_name": region_name if "region_name" in locals() else None,
                "region_full_name": region_full_name if "region_full_name" in locals() else None,
                "region_short_name": region_short_name if "region_short_name" in locals() else None,
                "super_municipality_name": super_municipality_name if "super_municipality_name" in locals() else None,
                "super_municipality_full_name": super_municipality_full_name if "super_municipality_full_name" in locals() else None,
                "super_municipality_short_name": super_municipality_short_name if "super_municipality_short_name" in locals() else None,
                "settlement_name": settlement_name if "settlement_name" in locals() else None,
                "settlement_full_name": settlement_full_name if "settlement_full_name" in locals() else None,
                "settlement_short_name": settlement_short_name if "settlement_short_name" in locals() else None,
                "municipality_name": municipality_name if "municipality_name" in locals() else None,
                "municipality_full_name": municipality_full_name if "municipality_full_name" in locals() else None,
                "municipality_short_name": municipality_short_name if "municipality_short_name" in locals() else None,
                "partnership_name": partnership_name if "partnership_name" in locals() else None,
                "partnership_full_name": partnership_full_name if "partnership_full_name" in locals() else None,
                "partnership_short_name": partnership_short_name if "partnership_short_name" in locals() else None,
                "district_name": district_name if "district_name" in locals() else None,
                "district_full_name": district_full_name if "district_full_name" in locals() else None,
                "district_short_name": district_short_name if "district_short_name" in locals() else None,
                "microdistrict_name": microdistrict_name if "microdistrict_name" in locals() else None,
                "microdistrict_full_name": microdistrict_full_name if "microdistrict_full_name" in locals() else None,
                "microdistrict_short_name": microdistrict_short_name if "microdistrict_short_name" in locals() else None,
                "street_name": street_name if "street_name" in locals() else None,
                "street_full_name": street_full_name if "street_full_name" in locals() else None,
                "street_short_name": street_short_name if "street_short_name" in locals() else None,
                "residential_complex_name": residential_complex_name if "residential_complex_name" in locals() else None,
                "residential_complex_full_name": residential_complex_full_name if "residential_complex_full_name" in locals() else None,
                "residential_complex_short_name": residential_complex_short_name if "residential_complex_short_name" in locals() else None,
                "is_complex_suburban": True if ("is_suburban" in locals() and is_suburban) else False if ("is_suburban" in locals() and is_suburban == False) else None,
                "house_number": house_number,
            }
        full_address = ", ".join(
            value
            for key, value in address.items()
            if ("full_name" in key or "house_number" in key or "settlement_short_name" in key) and value is not None and key != "settlement_full_name"
        )

        address["full_address"] = full_address
        address["full_address"] = address["full_address"][8:] if address.get("settlement_name", "") == "Москва" else address["full_address"]
        print(f"распаршенный адрес {address['full_address']}, адрес с сайта: {geo_info['address']}, url: {url}")
        return address
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {url}", exc_info=True)


# TODO ИНФУ О ЗАСТРОЙЩИКЕ ПАРСИТЬ
async def parse_offer_info(json_data: dict):
    try:
        json_data_2 = json_data["loaderData"]["catalog-or-main-or-item"]["buyerItem"]
        json_data_1 = json_data_2["item"]
        url = json_data_1["seo"]["canonicalUrl"]
        source = "avito" if "avito.ru" in url else None
        update_date_source = dateparser.parse(json_data_1["sortFormatedDate"], languages=["ru"]).isoformat() + "+00:00"

        total_views_count = json_data_2["viewStat"]["totalViews"]
        daily_views_count = json_data_2["viewStat"]["todayViews"]

        views_history = None
        last_ten_days_views_count = None
        creation_date_source = json_data["priceHistoryGenerated"][len(json_data["priceHistoryGenerated"]) - 1]["changeTime"]
        is_new_house = (
            True
            if json_data["loaderData"]["catalog-or-main-or-item"]["analytics"]["microCategorySlug"] == "novostroyka"
            else False
            if json_data["loaderData"]["catalog-or-main-or-item"]["analytics"]["microCategorySlug"] == "vtorichka"
            else None
        )
        images_urls = [img["1280x960"] for img in json_data_1["imageUrls"]]
        offer_type = "Продажа"
        title = None

        property_type = json_data_2["ga"][1].get("status") or json_data_2["ga"][1].get("type")

        all_attributes = parse("$..items..attributeId").find(json_data)
        house_built_year = next(
            (int(re.findall(r"\d{4}", item.context.value["description"])[0]) for item in all_attributes if item.value in [110684, 110499]),
            None,
        )
        is_build_complete = (
            True
            if "Сдан"
            in next(
                (item.context.value["description"] for item in all_attributes if item.value in [110684, 110499]),
                "",
            )
            else None
        )
        if is_build_complete is None and is_new_house:
            is_build_complete = False
        description = json_data_1.get("description") or json_data_1.get("descriptionHtml")
        contact_phone = None
        seller_type = json_data_2["contactBarInfo"]["publicProfileInfo"]["sellerName"].replace("Агентство", "Агентство недвижимости")
        seller_name = json_data_2["contactBarInfo"]["publicProfileInfo"]["itemSellerName"]
        seller_foundation_date = json_data_2["contactBarInfo"]["publicProfileInfo"].get("howOldInfo")
        price = json_data_2["contactBarInfo"]["price"]
        price_history = json_data["priceHistoryGenerated"]
        price_per_square_meter = int(re.findall(r"\d+", json_data_2["priceDataDTO"]["normalizedPrice"])[0])
        ga = json_data_2["ga"]
        rooms_count = 0 if "Студия" in ga[1].get("rooms", "") else int(ga[1].get("rooms")) if ga[1].get("rooms") else None
        bedrooms_count = next(
            (int(re.findall(r"\d+", item.context.value["description"])[0]) for item in all_attributes if item.value in [118971]),
            None,
        )
        total_area = (re.findall(r"[\d.,]+", ga[1].get("area", ""))[0] if re.findall(r"[\d.,]+", ga[1].get("area", "")) else None) or (
            re.findall(r"[\d.,]+", ga[1].get("house_area", ""))[0] if re.findall(r"[\d.,]+", ga[1].get("house_area", "")) else None
        )
        living_area = re.findall(r"[\d.,]+", ga[1].get("area_live", ""))[0] if re.findall(r"[\d.,]+", ga[1].get("area_live", "")) else None
        land_area = re.findall(r"[\d.,]+", ga[1].get("site_area", ""))[0] if re.findall(r"[\d.,]+", ga[1].get("site_area", "")) else None
        kitchen_area = re.findall(r"[\d.,]+", ga[1].get("area_kitchen", ""))[0] if re.findall(r"[\d.,]+", ga[1].get("area_kitchen", "")) else None
        floor = ga[1].get("floor")
        house_floors_count = int(ga[1].get("floors_count")) if ga[1].get("floors_count") else None
        ceiling_height = next(
            (int(re.findall(r"\d", item.context.value["description"])[0]) for item in all_attributes if item.value in [110718]),
            None,
        )
        balconies_count = 1 if ga[1].get("balkon_ili_lodzhiya_multi") else 0
        bathroom_type = ga[1].get("sanuzel_multiple") or next(
            (item.context.value["description"] for item in all_attributes if item.value in [118594]),
            "",
        )
        if bathroom_type:
            bathroom_type = bathroom_type.capitalize().replace("Совмещённый", "Совмещенный")
        bathrooms_count = 1 if bathroom_type else 0
        elevators_count = int(ga[1].get("gruzovoi_lift", 0)) + int(ga[1].get("passazhirskii_lift", 0))
        has_furniture = None
        renovation_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [100068, 110710]),
                "",
            )
            .capitalize()
            .replace("Евро", "Евроремонт")
        )
        window_view_type = next(
            (item.context.value["description"] for item in all_attributes if item.value in [110687]),
            "",
        )
        window_view_type = "На улицу и двор" if ("во двор" in window_view_type and "на улицу" in window_view_type) else window_view_type.split(",")[0].capitalize()
        house_material_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [498, 527]),
                "",
            )
            .capitalize()
            .replace("Монолитно-кирпичный", "Кирпично-монолитный")
            .replace("Газоблоки", "Газобетонный блок")
            .replace("Пеноблоки", "Пенобетонный блок")
            .replace("Брус", "Каркасный")
            .replace("Бревно", "Деревянный")
        )
        house_material_type = house_material_type.replace("Кирпич", "Кирпичный") if "Кирпичнно" not in house_material_type else house_material_type
        parking_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [110919, 118584]),
                "",
            )
            .split(",")[0]
            .capitalize()
        )
        heating_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [166728]),
                "",
            )
            .split(",")[0]
            .capitalize()
        )
        water_supply_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [166714]),
                "",
            )
            .split(",")[0]
            .capitalize()
        )
        gas_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [166711]),
                "",
            )
            .split(",")[0]
            .capitalize()
        )
        sewerage_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [166715]),
                "",
            )
            .split(",")[0]
            .capitalize()
        )
        land_type = (
            (
                next(
                    (item.context.value["description"] for item in all_attributes if item.value in [118629]),
                    "",
                )
                .split(",")[0]
                .capitalize()
            )
            .replace(" (дпп)", "")
            .replace(" (снт)", "")
            .replace(" (лпх)", "")
            .replace(" (ижс)", "")
            .replace("Дачное некоммерческое партнёрство", "Дачное некоммерческое партнерство")
        )
        has_electricity = (
            True
            if "есть"
            in (
                next(
                    (item.context.value["description"] for item in all_attributes if item.value in [166710]),
                    "",
                )
            )
            or "электричество"
            in (
                next(
                    (item.context.value["description"] for item in all_attributes if item.value in [118600]),
                    "",
                )
            )
            else None
        )
        has_sewerage = (
            True if sewerage_type or ("канализация" in (next((item.context.value["description"] for item in all_attributes if item.value in [118600]), ""))) else None
        )
        has_gas = True if gas_type or ("газ" in (next((item.context.value["description"] for item in all_attributes if item.value in [118600]), ""))) else None
        has_heating = True if heating_type or ("отопление" in (next((item.context.value["description"] for item in all_attributes if item.value in [118600]), ""))) else None
        has_water_supply = True if water_supply_type else None
        has_garage = True if "Гараж" in parking_type else None
        has_pool = (
            True
            if "бассейн"
            in (
                next(
                    (item.context.value["description"] for item in all_attributes if item.value in [118598]),
                    "",
                )
            )
            else None
        )
        has_bathhouse = (
            True
            if "баня"
            in (
                next(
                    (item.context.value["description"] for item in all_attributes if item.value in [118598]),
                    "",
                )
            )
            else None
        )
        has_guard = None
        has_terrace = (
            True
            if "есть"
            in (
                next(
                    (item.context.value["description"] for item in all_attributes if item.value in [118599]),
                    "",
                )
            )
            else None
        )
        has_garbage_chute = None
        has_elevator = True if elevators_count > 0 else None
        has_balcony = True if balconies_count > 0 else None
        new_offer_info = {
            "url": url,
            "source": source,
            "update_date_source": update_date_source,
            "views_count": total_views_count,
            "daily_views_count": daily_views_count,
            "views_history": views_history,
            "last_ten_days_views_count": last_ten_days_views_count,
            "creation_date_source": creation_date_source,
            "is_new_house": is_new_house,
            "images_urls": images_urls,
            "offer_type": offer_type,
            "title": title,
            "property_type": property_type,
            "house_built_year": house_built_year,
            "is_build_complete": is_build_complete,
            "description": description,
            "contact_phone": contact_phone,
            "seller_type": seller_type,
            "seller_name": seller_name,
            "seller_foundation_date": seller_foundation_date,
            "price": price,
            "price_history": price_history,
            "price_per_square_meter": price_per_square_meter,
            "rooms_count": rooms_count,
            "bedrooms_count": bedrooms_count,
            "total_area": total_area,
            "living_area": living_area,
            "land_area": land_area,
            "kitchen_area": kitchen_area,
            "floor": floor,
            "house_floors_count": house_floors_count,
            "ceiling_height": ceiling_height,
            "balconies_count": balconies_count,
            "bathroom_type": bathroom_type,
            "bathrooms_count": bathrooms_count,
            "elevators_count": elevators_count,
            "has_furniture": has_furniture,
            "renovation_type": renovation_type,
            "window_view_type": window_view_type,
            "house_material_type": house_material_type,
            "parking_type": parking_type,
            "heating_type": heating_type,
            "water_supply_type": water_supply_type,
            "gas_type": gas_type,
            "sewerage_type": sewerage_type,
            "land_type": land_type,
            "has_electricity": has_electricity,
            "has_sewerage": has_sewerage,
            "has_heating": has_heating,
            "has_water_supply": has_water_supply,
            "has_garage": has_garage,
            "has_pool": has_pool,
            "has_bathhouse": has_bathhouse,
            "has_guard": has_guard,
            "has_terrace": has_terrace,
            "has_garbage_chute": has_garbage_chute,
            "has_elevator": has_elevator,
            "has_balcony": has_balcony,
            "has_gas": has_gas,
        }

        return new_offer_info
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {url}", exc_info=True)


async def parse_infrastructure(coordinates: tuple[float, float], radius: int = 1500, timeout: int = 25) -> dict[str, list[dict[str, str | tuple[float, float]]]] | None:
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
            elif tags.get("station") == "subway" or tags.get("railway") == "subway_entrance":
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


async def main():
    await offers_urls_bypass("cian")


if __name__ == "__main__":
    asyncio.run(main())
