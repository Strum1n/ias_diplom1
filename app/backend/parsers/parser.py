import asyncio
import datetime
import json
import logging
import os
import random
import re
import time
from typing import Literal, TypeVar
from urllib.parse import unquote
from PIL import Image
from io import BytesIO

import dateparser
import overpy
import requests
import toml
import zendriver as driver
from fake_useragent import UserAgent
from geoalchemy2 import WKTElement
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from jsonpath_ng import parse
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, tuple_
from sqlmodel.ext.asyncio.session import AsyncSession
from zendriver.core.connection import ProtocolException

from app.backend.db.config import async_session_maker
from app.backend.db.models import *
from app.backend.parsers.solver_last_with_debug import get_simple_distance

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


def load_config(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception as e:
        return e
    return config


def use_config(path: str, read_or_write: Literal["r", "w"], config: dict[str, Any] = {}) -> dict:
    try:
        with open(path, read_or_write, encoding="utf-8") as f:
            config = toml.load(f) if read_or_write == "r" else toml.dump(config, f)
    except Exception as e:
        raise e
    return config


async def check_property_existens(url: str, session_factory) -> bool:
    async with session_factory() as session:
        session: AsyncSession
        result = await session.exec(select(Offer).where(Offer.url == url))
        return result.first() is not None


async def captcha_solver(page: driver.Tab):
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
        await slice_el.mouse_drag((distance, 0), relative=True, steps=random.randint(15, 25))
        await page.sleep(5)
        print("Капча возможно пройдена")
        return
    except Exception as e:
        await page.reload()
        print(e)


async def parse_offers_last(source: Literal["avito", "cian"]):
    path_to_config = PATH_TO_AVITO_CONFIG
    config = use_config(path_to_config, "r")

    max_retries = 8
    while True:
        browser = await driver.start(user_agent=UA_DESKTOP.random, headless=False)
        page = await browser.get(config[source]["url"])
        try:
            await page.wait_for_ready_state("interactive", timeout=3)
        except TimeoutError:
            pass
        for attempt in range(max_retries):
            if "Иногда такое случается, чтобы вернуться на сайт <b>нажмите на кнопку Продолжить</b> для решения капчи" in await page.get_content():
                print("sas")
                await captcha_solver(page)
            elif "#block" in page.url:
                continue
            elif "Доступ ограничен" in await page.get_content():
                await asyncio.sleep(random.uniform(2.5, 3))
                await page.reload()
                await asyncio.sleep(random.uniform(2.5, 3))
                kek = await page.get_content()
            else:
                break
        else:
            await browser.stop()
            continue
        break

    while True:
        try:
            if config[source]["price_filter_btn_selector"] != "":
                price_filter_btn = await page.select(config[source]["price_filter_btn_selector"])
                await price_filter_btn.mouse_click()
            max_price_filter_el = await page.select(config[source]["max_price_selector"])
            min_price_filter_el = await page.select(config[source]["min_price_selector"])
            filtered_offers_count = 0
            while filtered_offers_count < config[source]["items_on_page"] * config[source]["max_available_page"]:
                while True:
                    await max_price_filter_el.clear_input()
                    await max_price_filter_el.clear_input_by_deleting()
                    await min_price_filter_el.clear_input()
                    await min_price_filter_el.clear_input_by_deleting()
                    try:
                        for digit in str(config[source]["max_price"]):
                            await max_price_filter_el.send_keys(digit)

                        await page.sleep(1.5)
                        for digit in str(config[source]["min_price"]):
                            await min_price_filter_el.send_keys(digit)

                        await page.sleep(2)
                        filter_btn = await page.select(config[source]["filter_btn_selector"])
                        filtered_offers_count = int(re.findall(r"\d+", filter_btn.text_all.replace(" ", ""))[0])
                        if (
                            filtered_offers_count > config[source]["items_on_page"] * config[source]["max_available_page"]
                            or "Показать больше 1 тыс. объявлений" in filter_btn.text_all
                        ):
                            config[source]["max_price"] -= config[source]["price_step"]
                            break
                        elif "Ничего не найден" in filter_btn.text_all:
                            await page.reload()
                        else:
                            config[source]["max_price"] += config[source]["price_step"]
                    except Exception as e:
                        print(e)
                        await page.reload()
                        continue
                break
            await filter_btn.click()
            await filter_btn.mouse_click()
            await page.sleep(1.5)
            total_offers = 0
            successful_tasks_total = 0
            while True:
                correct_url = page.url.replace(f"&p={str(config[source]['p'] - 1)}", "") + f"&p={str(config[source]['p'])}"
                await page.get(correct_url)
                await page.wait_for_ready_state("interactive")
                await page.sleep(1.5)
                offers_urls = [
                    config[source]["domen_url"] + url_el.attrs["href"].replace(config[source]["domen_url"], "")
                    for url_el in await page.select_all(config[source]["offer_urls_selector"])
                ]
                tasks = []
                for url in offers_urls:
                    while STOP_CREATE_NEW_PAGE == True:
                        await asyncio.sleep(5)
                    active_tasks = [t for t in tasks if not t.done()]
                    if len(active_tasks) > 4:
                        await asyncio.sleep(5)
                    if source == "avito":
                        task = asyncio.create_task(parse_offer_to_db_avito(browser, url))
                    elif source == "cian":
                        task = asyncio.create_task(parse_offer_to_db(browser, url))
                    tasks.append(task)
                    await asyncio.sleep(random.uniform(1, 1.3))
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
                        if errors > 5:
                            print("Превышен лимит запросов с IP")
                            print("Ожидаем для сброса лимитов")
                            await asyncio.sleep(15)
                    else:
                        successful_page_tasks += 1
                        successful_tasks_total += 1
                    total_offers += 1
                print(
                    f"Спарсили страницу {config[source]['p']}, c которой добавлено в БД: {successful_page_tasks}, ошибок: {errors}, пропущено: {duplicates}, ВСЕГО спаршено {successful_tasks_total} / {total_offers}"
                )
                next_page_btn = None
                try:
                    next_page_btn = await page.select(config[source]["next_btn_selector"], timeout=2)
                except TimeoutError:
                    print(f"Спарсили последнюю страницу {config[source]['p']}")
                    return
                if next_page_btn is None:
                    config[source]["p"] = 1
                    config[source]["min_price"] = config[source]["max_price"] + 1
                    config[source]["max_price"] += config[source]["price_step"]

                    use_config(path_to_config, "w", config)
                    break
                config[source]["p"] += 1
                use_config(path_to_config, "w", config)
        except Exception as e:
            print(e)
            break


async def parse_offer_to_db_avito(browser: driver.Browser, url: str) -> Offer | None:
    start_time_origin = time.time()
    max_retries = 3
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
            if FIRST_CLICK:
                close_btn = None
                try:
                    close_btn = await property_page.select('[data-marker="NOT_INTERESTING_MARKER"]', 3)
                except Exception as e:
                    FIRST_CLICK = False
                    print(e)
                if close_btn:
                    await close_btn.mouse_click()
                    FIRST_CLICK = False
            if "Иногда такое случается, чтобы вернуться на сайт <b>нажмите на кнопку Продолжить</b> для решения капчи" in await property_page.get_content():
                raise Exception
            offer_info_el = await property_page.find("window.__preloadedState__ = ", timeout=3)
            offer_info_raw_text_encoded = await offer_info_el.get_html()
            offer_info_raw_text_encoded = offer_info_raw_text_encoded.split('preloadedState__ = "')[1].split('";</script>')[0]
            offer_info_raw_text_decoded = unquote(offer_info_raw_text_encoded)
            offer_json = deep_parse_json(json.loads(offer_info_raw_text_decoded.replace("\xa0", "")))
            kekes = json.dumps(offer_json, ensure_ascii=False)
            await property_page.sleep(0.25)
            try:
                price_history_el = await property_page.select(".price-history__cursorPointer___XzY5ZW")
                price_history_el = price_history_el.children[1]
                await price_history_el.mouse_move()
                price_h = await property_page.select(".style__container___XzhlND", timeout=2)
            except Exception as e:
                print(e)
                continue
            matches = re.findall(r"(\d{1,2}\s+[а-яё]+\s+\d{4})\s+(\d+)\s*₽(?:\s+\d+\s*₽)?", price_h.text_all.replace("\u2009", ""))

            price_history_result = []
            for i, (date_str, price_str) in enumerate(matches):
                # Преобразуем дату
                date_obj = dateparser.parse(date_str, languages=["ru"])

                change_time = date_obj.isoformat() + "+00:00"

                # Создаем объект
                item = {"priceData": {"price": int(price_str), "currency": "rur"}, "changeTime": change_time}

                price_history_result.append(item)
            start_time_parse_offer_info_from_json = time.time()
            offer_json["priceHistoryGenerated"] = price_history_result
            offer_info = await parse_offer_info_avito(offer_json)
            end_time_parse_offer_info_from_json = time.time()
            print()
            print(f"Время работы parse_offer_info_from_json: {(end_time_parse_offer_info_from_json - start_time_parse_offer_info_from_json):.3f}")
            print()
            start_time1 = time.time()
            geo_info = await parse_address_avito(offer_json, url)
            end_time1 = time.time()
            print(f"Время parse_geo_info_from_json {(end_time1 - start_time1):.3f}")
            print()
            item_json = offer_json["@avito/bx-item-view"]["buyerItem"]["item"]
            sos = json.dumps(item_json, ensure_ascii=False)
            end_time = time.time()
            print(f"Удачно спаршено: {url} за {(end_time - start_time_origin):.3f}")
            print()
            await property_page.close()
            return
        except Exception as e:
            print(e)
            if "Иногда такое случается, чтобы вернуться на сайт <b>нажмите на кнопку Продолжить</b> для решения капчи" in await property_page.get_content():
                STOP_CREATE_NEW_PAGE = True
                await captcha_solver(property_page)
                await asyncio.sleep(7)
            if "Доступ ограничен" not in await property_page.get_content():
                STOP_CREATE_NEW_PAGE = False
                FIRST_CLICK = True
                continue
    else:
        STOP_CREATE_NEW_PAGE = False
        print("Неудача: ", url)
        await property_page.close()
        return


async def parse_address_avito(json_data: dict, url: str):
    try:
        geo_info = parse("$..geo").find(json_data)[0].value
        district_name_from_site = (parse("$..content").find(geo_info)[0].value) if len(parse("$..content").find(geo_info)) > 0 else None
        ses = json.dumps(json_data, ensure_ascii=False)
        geolocator = Nominatim(user_agent="sassessds")
        address_from_url = parse("$..address").find(geo_info)[0].value + (f", {district_name_from_site}" if district_name_from_site else "")
        coordinates = (geo_info["coords"]["lat"], geo_info["coords"]["lng"])
        location = geolocator.reverse(f"{coordinates[0]},{coordinates[1]}")
        location_s = json.dumps(location.raw, ensure_ascii=False)

        address_elements = location.raw["address"]
        if district_name_from_site and ("район" in district_name_from_site or "р-н" in district_name_from_site):
            address_elements["district1"] = district_name_from_site

        if region := address_elements.get("state"):
            region_name = region.replace(" область", "")
            region_full_name = region
            region_short_name = region.replace(" область", " обл.")

        if munipality := address_elements.get("municipality") or address_elements.get("county") if "район" not in address_elements.get("county", "") else None:
            municipality_name = re.findall(
                r"(?:\b[А-ЯЁ][а-яё]{1,3}\.\s+)?(?:(?:\d+-[а-яё]+\s+)?[А-ЯЁ][а-яё]+(?:-[А-ЯЁ]?[а-яё]+)*(?:\s+[А-ЯЁ][а-яё]+(?:-[А-ЯЁ]?[а-яё]+)*)*(?:\s+[А-ЯЁ]+)?)", munipality
            )[0]
            municipality_full_name = munipality
            municipality_short_name = munipality

        settlements_keys = {
            "city": ("город", "г."),
            "village": ("деревня", "д."),
            "hamlet": ("поселок", "пос."),
            "town": ("город", "г."),
        }
        settlements_keys["hamlet"] = ("деревня", "д.") if "д." in address_from_url else ("поселок", "пос.")
        settlements_keys["town"] = (
            ("деревня", "д.")
            if "д." in address_from_url
            else ("поселок городского типа", "пгт")
            if "пгт" in address_from_url
            else ("рабочий поселок", "рп.")
            if "рп." in address_from_url
            else ("город", "г.")
        )
        settlements_keys["village"] = (
            ("поселок", "пос.")
            if "пос." in address_from_url
            else ("село", "с.")
            if "с." in address_from_url
            else ("рабочий поселок", "рп.")
            if "рп." in address_from_url
            else ("деревня", "д.")
        )

        for key, value in settlements_keys.items():
            if address_elements.get(key):
                settlement_name = address_elements[key]
                settlement_full_name = value[0] + " " + address_elements[key]
                settlement_short_name = value[1] + " " + address_elements[key]

        if (
            district := address_elements.get("district1")
            or (address_elements.get("county") if "микрорайон" not in address_elements.get("county", "") and "район" in address_elements.get("county", "") else None)
            or (address_elements.get("suburb") if "микрорайон" not in address_elements.get("suburb", "") and "район" in address_elements.get("suburb", "") else None)
        ):
            district_name = district.replace("район", "").replace("р-н", "").strip()
            district_short_name = "р-н " + district.replace("район", "").replace("р-н", "").strip()
            district_full_name = "район " + district.replace("район", "").replace("р-н", "").strip()

        if (
            microdistrict := address_elements.get("neighbourhood")
            if "микрорайон" in address_elements.get("neighbourhood", "")
            else None
            or (address_elements.get("quarter") if "микрорайон" in address_elements.get("quarter", "") else None)
            or (address_elements.get("suburb") if "микрорайон" in address_elements.get("suburb", "") else None)
        ):
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
            "проезд": ("проезд", "проезд"),
            "площадь": ("площадь", "пл."),
            "улица": ("улица", "ул."),
        }

        street_value = address_elements.get("road") or address_elements.get("street")

        street_keys = next((values for key, values in street_types.items() if street_value and any(v in street_value.lower() for v in values)), None)

        if street_keys:
            street_name = street_value.replace(street_keys[0], "").strip()
            street_full_name = street_keys[0] + " " + street_value.replace(street_keys[0], "").strip()
            street_short_name = street_keys[1] + " " + street_value.replace(street_keys[0], "").strip()
        else:
            print(f"Неверный геокод для адреса: {address_elements}, где верный адрес: {address_from_url}")
            return
        if street_name.lower() not in address_from_url.lower() and "city" in address_elements.keys():
            print(f"Неверный геокод для адреса: {address_elements}, где верный адрес: {address_from_url}")
            return

        residential_complex = None
        if parse("$..houseParams..items..title").find(json_data) and parse("$..houseParams..items..title").find(json_data)[0].value == "Название новостройки":
            residential_complex = parse("$..houseParams..items..description").find(json_data)[0].value
            address_elements["residential_complex"] = residential_complex

        if address_elements.get("residential_complex") is None:
            residential_complex = (
                re.findall(r"жилой комплекс [^,][А-яЁ ]+", address_from_url)[0]
                if re.findall(r"жилой комплекс [^,][А-яЁ ]+", address_from_url)
                else None or address_elements.get("neighbourhood")
                if "Жилой комплекс" in address_elements.get("neighbourhood", "")
                else None
            )

        if residential_complex:
            residential_complex_name = residential_complex.replace("жилой комплекс", "").replace("Жилой комплекс", "").replace("ЖК", "").strip()
            residential_complex_short_name = (
                "ЖК "
                + residential_complex.replace("жилой комплекс", "").replace("Жилой комплекс", "").replace("ЖК", "").strip()[0].lower()
                + residential_complex.replace("жилой комплекс", "").replace("Жилой комплекс", "").replace("ЖК", "").strip()[1:]
            )
            residential_complex_full_name = residential_complex.replace("жилой комплекс", "").replace("Жилой комплекс", "").replace("ЖК", "").strip() + " жилой комплекс"
            is_suburban = True if "КП" in residential_complex else False
        house_number = re.findall(r"(?:д\.\s*)?(\d+\w*)(?=\s*(?:,|р-н|$))", address_from_url) or address_elements.get("house_number")
        if house_number:
            house_number = house_number[0].strip().replace(",", "").replace("корп.", "к").replace(" ", "")

        address = {
            "latitude": coordinates[0],
            "longitude": coordinates[1],
            "region_name": region_name if "region_name" in locals() else None,
            "region_full_name": region_full_name if "region_full_name" in locals() else None,
            "region_short_name": region_short_name if "region_short_name" in locals() else None,
            "municipality_name": municipality_name if "municipality_name" in locals() else None,
            "municipality_full_name": municipality_full_name if "municipality_full_name" in locals() else None,
            "municipality_short_name": municipality_short_name if "municipality_short_name" in locals() else None,
            "settlement_name": settlement_name if "settlement_name" in locals() else None,
            "settlement_full_name": settlement_full_name if "settlement_full_name" in locals() else None,
            "settlement_short_name": settlement_short_name if "settlement_short_name" in locals() else None,
            "district_name": district_name if "district_name" in locals() else None,
            "district_full_name": district_full_name if "district_full_name" in locals() else None,
            "district_short_name": district_short_name if "district_short_name" in locals() else None,
            "microdistrict_name": microdistrict_name if "microdistrict_name" in locals() else None,
            "microdistrict_full_name": microdistrict_full_name if "microdistrict_full_name" in locals() else None,
            "microdistrict_short_name": microdistrict_short_name if "microdistrict_short_name" in locals() else None,
            "street_name": street_name if "street_name" in locals() else None,
            "street_full_name": street_full_name if "street_full_name" in locals() else None,
            "street_short_name": street_short_name if "street_short_name" in locals() else None,
            "house_number": house_number,
            "residential_complex_name": residential_complex_name if "residential_complex_name" in locals() else None,
            "residential_complex_full_name": residential_complex_full_name if "residential_complex_full_name" in locals() else None,
            "residential_complex_short_name": residential_complex_short_name if "residential_complex_short_name" in locals() else None,
            "is_complex_suburban": True if ("is_suburban" in locals() and is_suburban) else False if ("is_suburban" in locals() and is_suburban == False) else None,
        }

        full_address = ", ".join(value for key, value in address.items() if ("full_name" in key or "house_number" in key) and value is not None)

        address["full_address"] = full_address
        print(f"URL: {url}")
        print()
        print("Адрес на сайте: ", address_from_url)
        print()
        print("Адрес с геокода: ", address_elements)
        print()
        print("Распаршенный адрес: ")
        print("-" * 40)
        for key, value in address.items():
            print(f"{key}: {value}")
        print("-" * 40)

        return address
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {url}", exc_info=True)
        logging.error(address_elements, exc_info=True)


# TODO ИНФУ О ЗАСТРОЙЩИКЕ ПАРСИТЬ
async def parse_offer_info_avito(json_data: dict):
    try:
        json_data_2 = json_data["@avito/bx-item-view"]["buyerItem"]
        json_data_1 = json_data_2["item"]
        url = json_data_1["seo"]["canonicalUrl"]
        source = "avito" if "avito.ru" in url else None
        update_date_source = None
        total_views_count = parse("$..totalViews").find(json_data)[0]
        total_views_count = json_data_2["viewStat"]["totalViews"]
        daily_views_count = json_data_2["viewStat"]["todayViews"]
        views_history = None
        last_ten_days_views_count = None
        creation_date_source = dateparser.parse(json_data_1["sortFormatedDate"], languages=["ru"])
        is_new_house = True if json_data["@avito/bx-item-view"]["analytics"]["microCategorySlug"] == "novostroyka" else False
        images_urls = [img["1280x960"] for img in json_data_1["imageUrls"]]
        offer_type = "Продажа"
        title = json_data_2["galleryInfo"]["imageAlt"]
        property_type = json_data_2["ga"][1]["status"]

        all_attributes = parse("$..items..attributeId").find(json_data)
        house_built_year = next(
            (int(re.findall(r"\d{4}", item.context.value["description"])[0]) for item in all_attributes if item.value in [110684, 110499]),
            None,
        )
        is_build_complete = (
            True
            if "Сдан"
            in next(
                (re.findall(r"\d{4}", item.context.value["description"])[0] for item in all_attributes if item.value in [110684, 110499]),
                "",
            )
            else None
        )
        description = json_data_1["descriptionHtml"]
        contact_phone = None
        seller_type = json_data_2["contactBarInfo"]["publicProfileInfo"]["sellerName"]
        seller_name = json_data_2["contactBarInfo"]["publicProfileInfo"]["itemSellerName"]
        seller_foundation_date = json_data_2["contactBarInfo"]["publicProfileInfo"].get("howOldInfo")
        price = json_data_2["contactBarInfo"]["price"]
        price_history = json_data["priceHistoryGenerated"]
        price_per_square_meter = re.findall(r"\d+", json_data_2["priceDataDTO"]["normalizedPrice"])[0]
        ga = json_data_2["ga"]
        rooms_count = ga[1].get("rooms")
        # bedrooms_count=None
        total_area = ga[1].get("area")
        living_area = ga[1].get("area_live")
        # land_area=None
        kitchen_area = ga[1].get("area_kitchen")
        floor = ga[1].get("floor")
        house_floors_count = ga[1].get("floors_count")
        ceiling_height = next(
            (int(re.findall(r"\d", item.context.value["description"])[0]) for item in all_attributes if item.value in [110718]),
            None,
        )
        balconies_count = 1 if ga[1].get("balkon_ili_lodzhiya_multi") else 0
        bathroom_type = ga[1].get("sanuzel_multiple")
        if bathroom_type:
            bathroom_type = bathroom_type.replace("Совмещённый", "Совмещенный")
        bathrooms_count = 1 if bathroom_type else 0
        elevators_count = int(ga[1].get("gruzovoi_lift", 0)) + int(ga[1].get("passazhirskii_lift", 0))
        has_furniture = None
        renovation_type = next(
            (item.context.value["description"] for item in all_attributes if item.value in [100068]),
            "",
        ).capitalize()
        window_view_type = next(
            (item.context.value["description"] for item in all_attributes if item.value in [110687]),
            "",
        )
        window_view_type = "На улицу и двор" if ("во двор" in window_view_type and "на улицу" in window_view_type) else window_view_type.split(",")[0].capitalize()
        house_material_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [498]),
                "",
            )
            .capitalize()
            .replace("Монолитно-кирпичный", "Кирпично-монолитный")
        )
        parking_type = (
            next(
                (item.context.value["description"] for item in all_attributes if item.value in [110919]),
                "",
            )
            .split(",")[0]
            .capitalize()
        )
        new_offer_info = {
            "url": url,
            "source": source,
            "update_date_source": update_date_source,
            "total_views_count": total_views_count,
            "daily_views_count": daily_views_count,
            "views_history": views_history,
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
            "total_area": total_area,
            "living_area": living_area,
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
        }
        # print(new_offer_info)
        return new_offer_info
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {url}", exc_info=True)


async def parse_offers_cian():
    config = load_config(PATH_TO_CONFIG)
    browser = await driver.start(user_agent=UA_DESKTOP.random, headless=False)

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
            parse_url = "https://cian.ru/cat.php?deal_type=sale&engine_version=2&sort=creation_date_asc&" + params

            page = await browser.get(parse_url)

            await page.wait_for_ready_state("loading", timeout=30)
            no_properties = None
            try:
                no_properties = await page.find(text="У нас ещё нет таких объявлений", best_match=True, timeout=3)
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
                    task = asyncio.create_task(parse_offer_to_db(browser, url.attrs["href"]))
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
                            print(f"Ошибка в задаче {idx} (URL: {urls[idx].attrs['href']}): {str(result)}")
                            errors += 1
                        if errors > 10:
                            print("Сработал антибот, завершаем работу, попробуй спарсить позже")
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
                    btn_next = await page.wait_for(selector='[data-name="Pagination"] > :last-child', timeout=3)
                except TimeoutError:
                    btn_next = None

                is_last_page = True if btn_next is None or "disabled" in btn_next.attributes else False

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
                    f"--user-agent={ua_desktop.random}",
                ]
                browser = await driver.start(browser_args=browser_args_desktop, headless=True)
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
                    stmt = select(Address).where(Address.coordinates == coordinates)
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
                        r"\b(?:[а-я/]{2,}(?:\s+[а-я]{2,})*)\b|\b[А-Я]{2,}\b",
                        address.get("partnership_full_name", ""),
                    )
                    or [None]
                )[0]
            )
            settlement_stmt = select(SettlementType.id).where(SettlementType.name.in_(address.get("settlement_full_name", "").split()))
            municipality_stmt = select(MunicipalityType.id).where(
                MunicipalityType.name
                == (
                    re.findall(
                        r"\b(?:[а-я/]{2,}(?:\s+[а-я]{2,})*)\b|\b[А-Я]{2,}\b",
                        address.get("municipality_full_name", ""),
                    )
                    or [None]
                )[0]
            )
            street_stmt = select(StreetType.id).where(
                StreetType.name
                == (
                    re.findall(
                        r"\b(?:[а-я/]{2,}(?:\s+[а-я]{2,})*)\b|\b[А-Я]{2,}\b",
                        address.get("street_full_name", ""),
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
            }
        return type_ids
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {new_offer_types['url']}", exc_info=True)


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
                (item["fullName"] for item in address_info if item["type"] == "house" or item["locationTypeId"] == 288),
                None,
            ),
        }

        if region_match := next(
            (item for item in address_info if item["locationTypeId"] == 2 or "Москва" in item["fullName"]),
            None,
        ):
            address["region_full_name"] = region_match["fullName"]
            address["region_name"] = region_match["name"]
            address["region_short_name"] = region_match["shortName"]

        city_matches = [item["shortName"] for item in address_info if item["locationTypeId"] in [161, 1, 149] and len(item["fullName"].split()) == 1]

        if address["region_name"] != "Москва":
            city = next(
                (item for item in address_info if item["locationTypeId"] in [161, 1, 149] and len(item["fullName"].split()) == 1),
                None,
            )
        elif city_matches == 2:
            city = next(
                (item for item in address_info if item["locationTypeId"] in [161, 1, 149] and item["name"] != "Москва" and len(item["fullName"].split()) == 1),
                None,
            )
        else:
            city = next(
                (item for item in address_info if item["locationTypeId"] in [161, 1, 149] and item["name"] and len(item["fullName"].split()) == 1),
                None,
            )
        if city:
            city["shortName"] = f"город {city['name']}"
            city["fullName"] = f"г. {city['name']}"

        if municipality_match := next(
            (
                item
                for item in address_info
                if item["locationTypeId"] in [210, 197, 219, 282, 325, -1, 197] and item["type"] not in ["raion", "street", "house", "mikroraion"] or item["type"] == "okrug"
            ),
            None,
        ):
            address["municipality_full_name"] = municipality_match["fullName"]
            address["municipality_full_name"] = (
                address["municipality_full_name"][0] + " " + address["municipality_full_name"][1:]
                if len(address["municipality_full_name"]) == 3
                else address["municipality_full_name"][0] + " " + address["municipality_full_name"][1] + " " + address["municipality_full_name"][2:]
                if len(address["municipality_full_name"]) == 4
                else address["municipality_full_name"]
            )
            address["municipality_name"] = municipality_match["name"]
            address["municipality_short_name"] = municipality_match["shortName"]

        if settlement_matches := [item for item in address_info if item["locationTypeId"] in [161, 1, 149, 186, 185, 187, 177]]:
            address["settlement_full_name"] = settlement_matches[0]["shortName"]
            address["settlement_name"] = settlement_matches[0]["name"]
            address["settlement_short_name"] = settlement_matches[0]["fullName"]
            if len(settlement_matches) == 2:
                address["settlement_full_name"] = settlement_matches[1]["shortName"]
                address["settlement_name"] = settlement_matches[1]["name"]
                address["settlement_short_name"] = settlement_matches[1]["fullName"]

        sas = next(
            (item for item in address_info if "с/пос" in item["fullName"] or "с/пос" in item["shortName"]),
            None,
        )
        if sas:
            kek = 4
        if partnership_match := next(
            (item for item in address_info if item["locationTypeId"] in [415, 373, 249, 260, 325, 142, 199]),
            None,
        ):
            address["partnership_full_name"] = partnership_match["shortName"]
            address["partnership_name"] = partnership_match["name"]
            address["partnership_short_name"] = partnership_match["fullName"]

        if district_match := next(
            (item for item in address_info if item["type"] == "raion" or item["locationTypeId"] in [141]),
            None,
        ):
            address["district_full_name"] = district_match["fullName"]
            address["district_name"] = district_match["name"]
            address["district_short_name"] = district_match["shortName"]

        if microdistrict_match := next(
            (item for item in address_info if item["type"] == "mikroraion" or item["locationTypeId"] == 174),
            None,
        ):
            address["microdistrict_full_name"] = microdistrict_match["fullName"]
            address["microdistrict_name"] = microdistrict_match["name"]
            address["microdistrict_short_name"] = microdistrict_match["shortName"]

        if street_match := next((item for item in address_info if item["type"] == "street"), None):
            address["street_full_name"] = street_match["fullName"]
            address["street_name"] = street_match["name"]
            address["street_short_name"] = street_match["shortName"]

        if residential_complex_match := next(
            (item for item in address_info if item["locationTypeId"] in [213, 193, 208]),
            None,
        ):
            address["residential_complex_full_name"] = residential_complex_match["shortName"]
            address["residential_complex_name"] = residential_complex_match["name"]
            address["residential_complex_short_name"] = residential_complex_match["fullName"]
            address["is_complex_suburban"] = True if "коттеджный поселок" in address["residential_complex_full_name"] else False

        address["full_address"] = ", ".join(item["fullName"] for item in address_info)

        return address
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {json_info['url']}", exc_info=True)


async def parse_offer_info(
    offer_info_json: dict,
) -> tuple[dict[str, str] | None, dict[str, str] | None] | None:
    try:
        offer = offer_info_json["offer"]
        seller = offer_info_json.get("agent", {})
        features = offer_info_json.get("features", [])

        flat_info = next((f["features"] for f in features if f["title"] == "О квартире"), []) or next((f["features"] for f in features if f["title"] == "О доме"), [])
        flat_info += next(
            (f["features"] for f in features if f["title"] == "Коммуникации и удобства"),
            [],
        )
        flat_info = {fi["label"]: fi["value"] for fi in flat_info}

        building_info = next((f["features"] for f in features if f["title"] == "Об участке"), None) or next((f["features"] for f in features if f["title"] == "О доме"), {})
        building_info = {bi["label"]: bi["value"] for bi in building_info}

        new_offer = {
            "url": offer_info_json.get("url"),
            "update_date_source": offer.get("editDate"),
            "views_count": offer_info_json.get("stats", {}).get("total"),
            "daily_views_count": offer_info_json.get("stats", {}).get("daily"),
            "views_history": offer_info_json.get("dailyViews"),
            "last_ten_days_views_count": offer_info_json.get("lastTenDaysViewsCount"),
            "creation_date_source": offer.get("creationDate"),
            "is_new_house": True if "Новостройка" in flat_info.get("Тип жилья", []) else False if "Вторичка" in flat_info.get("Тип жилья", []) else None,
            "images_urls": [img["fullUrl"] for img in offer.get("photos")] if offer.get("photos") else None,
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
            "is_build_complete": offer.get("building", {}).get("deadline", {}).get("isComplete")
            if offer.get("building", {}).get("deadline", {}).get("isComplete") is not None
            else False
            if datetime.now().year < offer.get("newbuilding", {}).get("house", {}).get("finishDate", {}).get("year", 0)
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
            "seller_name": seller.get("companyName") or seller.get("name") or str(seller.get("id")),
            "seller_foundation_date": (
                offer_info_json.get("company", {}).get("yearFoundation")
                if seller.get("userType") == "developer"
                else seller.get("masterAgent", {}).get("experience") or (re.findall(r"\d+", seller.get("experience"))[0] if seller.get("experience") else None)
            ),
            "price": offer.get("priceTotal"),
            "price_history": offer_info_json.get("priceChanges"),
            "price_per_square_meter": next(
                (re.findall(r"\d+", item["value"].replace(" ", ""))[0] for item in offer_info_json.get("sidebar") if item["title"] == "Цена за метр"),
                None,
            ),
            "rooms_count": 0 if offer.get("flatType") == "studio" else 10 if offer.get("offerType") == "flat" and offer.get("roomsCount") is None else offer.get("roomsCount"),
            "bedrooms_count": offer.get("bedroomsCount"),
            "total_area": offer.get("totalArea"),
            "living_area": offer.get("livingArea"),
            "land_area": offer.get("land", {}).get("area"),
            "kitchen_area": offer.get("kitchenArea"),
            "floor": offer.get("floorNumber"),
            "house_floors_count": offer.get("building", {}).get("floorsCount") or flat_info.get("Количество этажей"),
            "ceiling_height": offer.get("building", {}).get("ceilingHeight"),
            "balconies_count": offer.get("loggiasCount") or offer.get("balconiesCount"),
            "bathrooms_count": offer.get("combinedWcsCount") or offer.get("separateWcsCount") or offer.get("wcsCount"),
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
            "house_material_type": building_info.get("Тип дома") or flat_info.get("Материал дома"),
            "parking_type": building_info.get("Парковка"),
            "heating_type": building_info.get("Отопление") or flat_info.get("Отопление"),
            "water_supply_type": building_info.get("Водоснабжение") or flat_info.get("Водоснабжение"),
            "gas_type": building_info.get("Газоснабжение") or (flat_info.get("Газ").replace("\xa0", " ") if flat_info.get("Газ") else None),
            "sewerage_type": building_info.get("Канализация") or flat_info.get("Канализация"),
            "land_type": building_info.get("Статус участка"),
            "has_electricity": offer.get("hasElectricity"),
            "has_sewerage": offer.get("hasDrainage"),
            "has_gas": False
            if (flat_info.get("Газ") or building_info.get("Газоснабжение")) == "Нет"
            else True
            if (flat_info.get("Газ") or building_info.get("Газоснабжение")) and (flat_info.get("Газ") or building_info.get("Газоснабжение")) != "Нет информации"
            else None,
            "has_heating": False
            if (flat_info.get("Отопление") or building_info.get("Отопление")) == "Нет"
            else True
            if (flat_info.get("Отопление") or building_info.get("Отопление")) and (flat_info.get("Отопление") or building_info.get("Отопление")) != "Нет информации"
            else None,
            "has_water_supply": False
            if (flat_info.get("Водоснабжение") or building_info.get("Водоснабжение")) == "Нет"
            else True
            if (flat_info.get("Водоснабжение") or building_info.get("Водоснабжение")) and (flat_info.get("Водоснабжение") or building_info.get("Водоснабжение")) != "Нет информации"
            else None,
            "has_garage": offer.get("hasGarage"),
            "has_pool": offer.get("hasPool"),
            "has_bathhouse": offer.get("hasBathhouse"),
            "has_guard": offer.get("hasSecurity"),
            "has_terrace": "Терраса" in flat_info.get("Дополнительно") if flat_info.get("Дополнительно") else None,
            "has_garbage_chute": offer.get("building", {}).get("hasGarbageChute"),
        }
        new_offer["has_elevator"] = True if new_offer["elevators_count"] else None
        new_offer["has_balcony"] = True if new_offer["balconies_count"] else None
        address = await parse_address(offer_info_json)
        return new_offer, address
    except Exception as e:
        logging.error(f"Произошла ошибка: {e} в {offer_info_json['url']}", exc_info=True)


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


async def parse_offer_to_db(browser: driver.Browser, url: str) -> Offer | None:
    already_exist = await check_property_existens(url, session_factory=async_session_maker)
    if already_exist:
        logging.warning(f"{url} Уже есть в БД")
        raise Exception("Уже есть в БД")
    start_time = time.time()
    offer_id = re.findall(r"\d+", url)
    max_retries = 3
    urls = [
        f"https://www-cian-ru.translate.goog/sale/flat/{offer_id[0]}/?_x_tr_sl=en&_x_tr_tl=ru&_x_tr_hl=ru&_x_tr_pto=wapp",
        url,
    ]
    # urls = [url]
    for attempt in range(max_retries):
        try:
            property_page = await browser.get(random.choice(urls), new_tab=True)

            await property_page.wait_for_ready_state("interactive", timeout=30)
            info_els = await property_page.find_all('phones":[{"countryCode', timeout=2)
            info = await info_els[0].get_html()
            json_info_text = "{" + re.findall(r"\"offerData.*?seoData\"", info)[0] + ':""}}'
            offer_json = json.loads(json_info_text)
            creation_date = offer_json["offerData"]["offer"].get("creationDate")
            offerId = offer_json["offerData"]["offer"].get("id")
            await property_page.get(f"https://api.cian.ru/offer-card/v1/get-offer-card-statistic/?offerCreationDate={creation_date[0:10]}&offerId={offerId}")
            views_stats_text = await property_page.get_content()
            views_stats_json = json.loads(re.findall(r"{\".+}", views_stats_text)[0])
            offer_json = offer_json["offerData"]
            offer_json["dailyViews"] = views_stats_json.get("daily", {}).get("dailyViews", {})
            offer_json["lastTenDaysViewsCount"] = int(re.findall(r"\d+", views_stats_json.get("daily", {}).get("totalViews", ""))[0])
            offer_json["url"] = url
            new_offer_info, address_info = await parse_offer_info(offer_json)
            type_ids = await find_types(async_session_maker, address_info, new_offer_info)

            if "suburban" in url:
                infrastructure_info = await parse_infrastructure(
                    coordinates=(address_info["latitude"], address_info["longitude"]),
                    radius=5000,
                )
            else:
                infrastructure_info = await parse_infrastructure(coordinates=(address_info["latitude"], address_info["longitude"]))

            address = Address(
                full_address=address_info["full_address"],
                coordinates=WKTElement(
                    f"POINT({address_info['longitude']} {address_info['latitude']})",
                    srid=4326,
                ),
                region=Region(
                    name=address_info.get("region_name"),
                    full_name=address_info.get("region_full_name"),
                    short_name=address_info.get("region_short_name"),
                )
                if address_info.get("region_name")
                else None,
                municipality=Municipality(
                    name=address_info.get("municipality_name"),
                    full_name=address_info.get("municipality_full_name"),
                    short_name=address_info.get("municipality_short_name"),
                    municipality_type_id=type_ids.get("municipality_type_id"),
                )
                if address_info.get("municipality_name")
                else None,
                settlement=Settlement(
                    name=address_info.get("settlement_name"),
                    full_name=address_info.get("settlement_full_name"),
                    short_name=address_info.get("settlement_short_name"),
                    settlement_type_id=type_ids.get("settlement_type_id"),
                )
                if address_info.get("settlement_name")
                else None,
                partnership=Partnership(
                    name=address_info.get("partnership_name"),
                    full_name=address_info.get("partnership_full_name"),
                    short_name=address_info.get("partnership_short_name"),
                    partnership_type_id=type_ids.get("partnership_type_id"),
                )
                if address_info.get("partnership_name")
                else None,
                district=District(
                    name=address_info.get("district_name"),
                    full_name=address_info.get("district_full_name"),
                    short_name=address_info.get("district_short_name"),
                    district_type_id=type_ids.get("district_type_id"),
                )
                if address_info.get("district_name")
                else None,
                microdistrict=Microdistrict(
                    name=address_info.get("microdistrict_name"),
                    full_name=address_info.get("microdistrict_full_name"),
                    short_name=address_info.get("microdistrict_short_name"),
                    microdistrict_type_id=type_ids.get("microdistrict_type_id"),
                )
                if address_info.get("microdistrict_name")
                else None,
                street=Street(
                    name=address_info.get("street_name"),
                    full_name=address_info.get("street_full_name"),
                    short_name=address_info.get("street_short_name"),
                    street_type_id=type_ids.get("street_type_id"),
                )
                if address_info.get("street_name")
                else None,
                residential_complex=ResidentialComplex(
                    name=address_info.get("residential_complex_name"),
                    full_name=address_info.get("residential_complex_full_name"),
                    short_name=address_info.get("residential_complex_short_name"),
                    is_suburban=address_info.get("is_complex_suburban"),
                    complex_type_id=type_ids.get("residential_complex_type_id"),
                )
                if address_info.get("residential_complex_name")
                else None,
                house_number=address_info.get("house_number"),
            )
            fmt = lambda *p: ", ".join(str(x) for x in p if x not in (None, ""))
            g = lambda k: new_offer_info.get(k)
            seller = Seller(
                name=new_offer_info["seller_name"],
                foundation_date=(int(re.findall(r"\d+", str(new_offer_info["seller_foundation_date"]))[0]) if new_offer_info["seller_foundation_date"] is not None else None),
                seller_type_id=type_ids["seller_type_id"],
            )
            new_offer = Offer(
                url=url,
                update_date_source=datetime.fromisoformat(new_offer_info.get("update_date_source")),
                creation_date_source=datetime.fromisoformat(new_offer_info.get("creation_date_source")),
                views_count=new_offer_info.get("views_count"),
                daily_views_count=new_offer_info.get("daily_views_count"),
                last_ten_days_views_count=new_offer_info.get("last_ten_days_views_count"),
                views_history=new_offer_info.get("views_history"),
                offer_type_id=type_ids.get("offer_type_id"),
                address=address,
                title=(
                    fmt(
                        f"{g('rooms_count')}-комн. {g('property_type').lower()}",
                        f"{g('total_area')} м²" if g("total_area") else None,
                        f"{g('floor')}/{g('house_floors_count')} этаж" if g("floor") and g("house_floors_count") else None,
                    )
                    if g("property_type") in ["Квартира", "Апартаменты"] and 0 < (g("rooms_count") or 99) < 10
                    else fmt(
                        g("property_type"),
                        f"{g('total_area')} м²" if g("total_area") else None,
                        f"{g('land_area')} сот." if g("land_area") else None,
                        g("land_type"),
                    )
                    if g("property_type") in ["Дом", "Таунхаус", "Коттедж"]
                    else fmt(
                        "Квартира-студия" if g("rooms_count") == 0 else "Квартира со свободной планировкой",
                        f"{g('total_area')} м²" if g("total_area") else None,
                        f"{g('floor')}/{g('house_floors_count')} этаж" if g("floor") and g("house_floors_count") else None,
                    )
                ),
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

            address_id = await add_offer_to_db(new_offer, async_session_maker)
            if infrastructure_info:
                await add_address_infrastructure_link(async_session_maker, address_id, infrastructure_info)
            await property_page.close()
            # async with async_session_maker() as session:
            #     await update_price_categories_in_db(session)
            end_time = time.time()
            logging.info(f"Удачно добавлено в бд за {(end_time - start_time):.3f} - {url}")
            return new_offer
        except ProtocolException as e:
            print(f"Ошибка: {e} на странице: {url},  попытка {attempt + 1} из {max_retries}")
            await property_page.close() if property_page else None
            await asyncio.sleep(5 * (attempt))
        except TimeoutError as e:
            print(f"Ошибка: {e} на странице: {url},  попытка {attempt + 1} из {max_retries}")
            await property_page.close() if property_page else None
            await asyncio.sleep(5 * (attempt))
        except Exception as e:
            logging.error(f"Произошла ошибка: {e} в {url}", exc_info=True)
            await property_page.close() if property_page else None
            return
    else:
        print(f"НЕУДАЧА {url}")
        print("АНТИБОТ ЗАРАБОТАЛ")
        await property_page.close() if property_page else None
        return


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


async def main():
    await parse_offers_last("avito")
    # await parse_offers_cian()


if __name__ == "__main__":
    asyncio.run(main())
