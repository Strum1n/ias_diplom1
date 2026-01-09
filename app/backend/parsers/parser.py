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


import overpy
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

from app.backend.db.db_config import async_session_maker
from app.backend.db.models import *

PATH_TO_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cian.config")
PATH_TO_CIAN_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cian_config.toml")
PATH_TO_AVITO_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "new_config.toml")
UA_DESKTOP = UserAgent(platforms="desktop")


def load_config(path: str) -> dict:
    try:
        with open(path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception as e:
        return e
    return config


def use_config(path: str, read_or_write: Literal["r", "w"], config: dict[str, Any] = {}) -> dict:
    try:
        with open(path, read_or_write) as f:
            config = toml.load(f) if read_or_write == "r" else toml.dump(config, f)
    except Exception as e:
        raise e
    return config


async def check_property_existens(url: str, session_factory) -> bool:
    async with session_factory() as session:
        session: AsyncSession
        result = await session.exec(select(Offer).where(Offer.url == url))
        return result.first() is not None


async def parse_offers2(source: Literal["avito", "cian"], object_category: Literal["flat", "suburban"]):
    path_to_config = PATH_TO_AVITO_CONFIG
    config = use_config(path_to_config, "r")

    max_retries = 5
    while True:
        browser = await driver.start(user_agent=UA_DESKTOP.random, headless=False)
        page = await browser.get(config[source]["url"])
        try:
            await page.wait_for_ready_state("interactive", timeout=3)
        except TimeoutError:
            pass
        await asyncio.sleep(1)
        kek = await page.get_content()
        for attempt in range(max_retries):
            if "Доступ ограничен" in kek:
                await asyncio.sleep(2)
                await page.reload()
                await asyncio.sleep(2)
                kek = await page.get_content()
            else:
                break
        else:
            await browser.stop()
            continue
        break
    try:
        while True:
            # new_house_filter_el = await page.select('[data-marker="filterTabs/tab(1)"]', timeout=30)
            # await new_house_filter_el.mouse_click()
            # await page.sleep(1.5)
            # await new_house_filter_el.click()
            max_price_filter_el = await page.select('[data-marker="price-to/input"]')
            min_price_filter_el = await page.select('[data-marker="price-from/input"]')

            filtered_offers_count = 0
            while filtered_offers_count < config[source]["items_on_page"] * config[source]["max_available_on_page"]:
                while True:
                    try:
                        for digit in str(config[source]["max_price"]):
                            await max_price_filter_el.send_keys(digit)
                            await page.sleep(0.25)
                        await page.sleep(1.5)
                        for digit in str(config[source]["min_price"]):
                            await min_price_filter_el.send_keys(digit)
                            await page.sleep(0.25)
                        await page.sleep(1.5)
                        filter_btn = await page.select('[data-marker="search-filters/submit-button"]')
                        filtered_offers_count = int(re.findall(r"\d+", filter_btn.text_all)[0])
                        if filtered_offers_count > config[source]["items_on_page"] * config[source]["max_available_on_page"]:
                            config[source]["max_price"] -= config[source]["price_step"]
                            break
                        elif "Показать больше 1 тыс. объявлений" in filter_btn.text_all:
                            break
                        else:
                            config[source]["max_price"] += config[source]["price_step"]
                        await max_price_filter_el.focus()
                        await max_price_filter_el.clear_input_by_deleting()
                        await min_price_filter_el.focus()
                        await max_price_filter_el.clear_input_by_deleting()
                    except Exception as e:
                        print(e)
                        await max_price_filter_el.clear_input_by_deleting()
                        await min_price_filter_el.clear_input_by_deleting()
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
                offers_urls = [url_el.attrs["href"] for url_el in await page.select_all('[data-marker="item-photo-sliderLink"]')]

                tasks = []
                for url in offers_urls:
                    task = asyncio.create_task(parse_offer_to_db_avito(browser, url))
                    tasks.append(task)
                    await asyncio.sleep(random.uniform(1, 1.7))
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
                    next_page_btn = await page.select('[data-marker="pagination-button/nextPage"]')
                except TimeoutError:
                    print(f"Спарсили последнюю страницу {config[source]['p']}")
                if next_page_btn is None:
                    config[source]["p"] = 1
                    config[source]["min_price"] = config[source]["max_price"] + 1
                    use_config(path_to_config, "w", config)
                    break
                config[source]["p"] += 1
                use_config(path_to_config, "w", config)

    except Exception as e:
        print(e)
        print("Не найдено ссылок")
    return


async def parse_offers3(source: Literal["avito", "cian"], object_category: Literal["flat", "suburban"]):
    path_to_config = PATH_TO_AVITO_CONFIG

    def increment_param(param_name: str) -> str:
        incr_param = config[source][f"params{object_category}"][param_name] = (
            config[source][f"params{object_category}"][param_name].split("=")[0] + "=" + str(int(config[source][f"params{object_category}"][param_name].split("=")[1]) + 1)
        )
        return incr_param

    total_offers = 0
    successful_tasks_total = 0
    config = use_config(path_to_config)
    max_retries = 5
    while True:
        browser = await driver.start(user_agent=UA_DESKTOP.random, headless=False)
        page = await browser.get(config[source]["url"])
        try:
            await page.wait_for_ready_state("interactive", timeout=2)
        except TimeoutError:
            pass
        kek = await page.get_content()
        for attempt in range(max_retries):
            if "Доступ ограничен" in kek:
                await asyncio.sleep(3)
                await page.reload()
                await asyncio.sleep(3)
                kek = await page.get_content()
            else:
                break
        else:
            await browser.stop()
            continue
        break

    while int(config[source][f"params{object_category}"]["page"].split("=")[1]) <= config[source]["max_page"]:
        params = "&".join(f"{value}" for key, value in config[source][f"params{object_category}"].items())
        parse_url = config[source]["url_api"] + "&" + params
        if object_category == "suburban":
            parse_url = parse_url.replace("params[201]=1059", "params[202]=1064")
        while True:
            for attempt in range(max_retries):
                try:
                    page = await browser.get(parse_url, new_tab=True)
                    await asyncio.sleep(1.5)
                    json_el = await page.select(config[source]["selector"], timeout=5)
                    if "too-many-requests" in json_el.text:
                        raise TimeoutError
                    break
                except TimeoutError:
                    await asyncio.sleep(2)
                    await page.close()
            else:
                await browser.stop()
                while True:
                    browser = await driver.start(user_agent=UA_DESKTOP.random, headless=False)
                    page = await browser.get(config[source]["url"])
                    try:
                        await page.wait_for_ready_state("interactive", timeout=3)
                    except TimeoutError:
                        pass
                    kek = await page.get_content()
                    for attempt in range(max_retries):
                        if "Доступ ограничен" in kek:
                            await asyncio.sleep(3)
                            await page.reload()
                            await asyncio.sleep(3)
                            kek = await page.get_content()
                        else:
                            break
                    else:
                        await browser.stop()
                        continue
                    break
            break
        while True:
            try:
                json_text = await json_el.get_html()
                await asyncio.sleep(2)
                # urls = [config["url"] + el for el in re.findall(config["regex_selector"], json_text)]
                urls = re.findall(config[source]["regex_selector"], json_text)
                await page.close()
                break
            except Exception as e:
                print(e)
                await asyncio.sleep(5)
                await page.reload()
        if len(urls) == 0:
            config[source][f"params{object_category}"]["max_floor"] = increment_param("max_floor")
            config[source][f"params{object_category}"]["min_floor"] = increment_param("min_floor")
            config[source][f"params{object_category}"]["page"] = "p=1"
            continue
        tasks = []
        for url in urls:
            task = asyncio.create_task(parse_offer_to_db_avito(browser, url))
            tasks.append(task)
            await asyncio.sleep(random.uniform(1, 1.7))
        results = await asyncio.gather(*tasks, return_exceptions=True)
        successful_page_tasks = 0
        duplicates = 0
        errors = 0
        for idx, result in enumerate(results):
            if isinstance(result, Exception):
                if "Уже есть в БД" in str(result):
                    duplicates += 1
                else:
                    print(f"Ошибка в задаче {idx} (URL: {urls[idx]}): {str(result)}")
                    errors += 1
                if errors > 5:
                    print("Превышен лимит запросов с IP")
                    print("Ожидаем для сброса лимитов")
                    await asyncio.sleep(5)
            else:
                successful_page_tasks += 1
                successful_tasks_total += 1
            total_offers += 1
        print(
            f"Спарсили страницу {config[source]['params']['page']}, c которой добавлено в БД: {successful_page_tasks}, ошибок: {errors}, пропущено: {duplicates}, ВСЕГО спаршено {successful_tasks_total} / {total_offers}"
        )
        config[source][f"params{object_category}"]["page"] = increment_param("page")
        try:
            with open(path_to_config, "w") as f:
                toml.dump(config, f)
        except Exception as e:
            print(e)
    await page.close()
    return


async def parse_offer_to_db_avito(browser: driver.Browser, url: str) -> Offer | None:
    # already_exist = await check_property_existens(url, session_factory=async_session_maker)
    # if already_exist:
    #     logging.warning(f"{url} Уже есть в БД")
    #     raise Exception("Уже есть в БД")
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # urls = ["https://www-avito-ru.translate.goog" + url + "&_x_tr_sl=en&_x_tr_tl=ru&_x_tr_hl=ru&_x_tr_pto=wapp", "https://www.avito.ru" + url]
            # property_page = await browser.get(random.choice(urls), new_tab=True)
            property_page = await browser.get(
                "https://www-avito-ru.translate.goog" + url + "&_x_tr_sl=en&_x_tr_tl=ru&_x_tr_hl=ru&_x_tr_pto=wapp",
                new_tab=True,
            )
            await property_page.wait_for_ready_state("loading", timeout=2)
            start_time = time.time()
            offer_info_el = await property_page.find("window.__preloadedState__ = ", timeout=2)
            offer_info_raw_text_encoded = await offer_info_el.get_html()
            offer_info_raw_text_encoded = offer_info_raw_text_encoded.split('preloadedState__ = "')[1].split('";</script>')[0]
            offer_info_raw_text_decoded = unquote(offer_info_raw_text_encoded)
            offer_json = deep_parse_json(json.loads(offer_info_raw_text_decoded.replace("\xa0", "")))
            kekes = json.dumps(offer_json, ensure_ascii=False)
            offer_info = parse_offer_info_from_json(offer_json)
            start_time1 = time.time()
            geo_info = await parse_geo_info_from_json(offer_json, "https://www.avito.ru/" + url)
            end_time1 = time.time()
            print(f"Время геокода {(end_time1 - start_time1):.3f}")
            print()
            item_json = offer_json["@avito/bx-item-view"]["buyerItem"]["item"]
            sos = json.dumps(item_json, ensure_ascii=False)
            end_time = time.time()
            print(f"Удачно спаршено: {url} за {(end_time - start_time):.3f}")
            print()
            await property_page.close()
            return
        except Exception as e:
            await property_page.close()
            await asyncio.sleep(attempt * 4)
            print(e)
    print("Неудача: ", url)
    await property_page.close()
    return


async def parse_geo_info_from_json(json_data: dict, url: str):
    try:
        geo_info = parse("$..geo").find(json_data)[0].value
        district_short_name = (parse("$..content").find(geo_info)[0].value) if len(parse("$..content").find(geo_info)) > 0 else None
        coordinates = (geo_info["coords"]["lat"], geo_info["coords"]["lng"])
        ses = json.dumps(json_data, ensure_ascii=False)
        geolocator = Nominatim(user_agent="sassessds")
        address_for_geocode = parse("$..address").find(geo_info)[0].value
        location = geolocator.reverse(f"{coordinates[0]},{coordinates[1]}")

        location_s = json.dumps(location.raw, ensure_ascii=False)
        address_elements = location.raw["address"]
        address_elements["house_number"] = address_for_geocode.split(",")[len(address_for_geocode.split(", ")) - 1].strip()
        if parse("$..houseParams..items..title").find(json_data) and parse("$..houseParams..items..title").find(json_data)[0].value == "Название новостройки":
            residential_complex_short_name = parse("$..houseParams..items..description").find(json_data)[0].value
            address_elements["residential_complex"] = residential_complex_short_name

        if district_short_name:
            address_elements["district1"] = district_short_name
        full_address = location._address.replace("Россия", "") + (f", {district_short_name}" if district_short_name else "")
        address_objects = await initialize_address(address_elements, url, address_for_geocode, full_address)

        return
    except Exception as e:
        print(e)

    return address_objects


async def parse_geo_info_from_json1(json_data: dict, url: str):
    try:
        geo_info = parse("$..geo").find(json_data)[0].value
        district_short_name = (parse("$..content").find(geo_info)[0].value) if len(parse("$..content").find(geo_info)) > 0 else None
        coordinates = (geo_info["coords"]["lat"], geo_info["coords"]["lng"])
        ses = json.dumps(json_data, ensure_ascii=False)
        geolocator = Yandex(api_key="21f1db28-98e6-45e2-b495-12cb2eff4dc8", user_agent="sassessds")
        address_for_geocode = url.split("//")[2].split("/")[0] + " " + parse("$..address").find(geo_info)[0].value
        location = geolocator.geocode(address_for_geocode)
        location_s = json.dumps(location.raw, ensure_ascii=False)
        address_elements = location.raw["metaDataProperty"]["GeocoderMetaData"]["Address"]["Components"]

        if parse("$..houseParams..items..title").find(json_data)[0].value == "Название новостройки":
            residential_complex_short_name = parse("$..houseParams..items..description").find(json_data)[0].value
            address_elements.append({"kind": "residential_complex", "name": residential_complex_short_name})
        if district_short_name:
            address_elements.append({"kind": "district1", "name": district_short_name})
        full_address = location._address.replace("Россия", "") + (f", {district_short_name}" if district_short_name else "")
        address_objects = await initialize_address(address_elements, url, address_for_geocode, full_address)

        return
    except Exception as e:
        print(e)

    return address_objects


async def initialize_address(address_elements: dict, url: str, full_address: str, full_address_from_api):
    async with async_session_maker() as session:
        settlements_keys = {
            "city": "город",
            "village": "деревня",
            "hamlet": "поселок",
            "town": "поселок городского типа ",
        }
        settlements_keys["hamlet"] = "деревня" if "д." in full_address else "поселок"
        settlements_keys["village"] = "село" if "с." in full_address else "поселок" if "пос." in full_address else "рабочий поселок" if "рп." in full_address else "деревня"
        for key, value in settlements_keys.items():
            if address_elements.get(key):
                address_elements[key] = value + " " + address_elements[key]
        try:
            table_models = [
                {
                    "type": MunicipalityType,
                    "main": Municipality,
                    "suffix": "Municipality",
                },
                {"type": StreetType, "main": Street, "suffix": "Street"},
                {"type": PartnershipType, "main": Partnership, "suffix": "Partnership"},
                {"type": SettlementType, "main": Settlement, "suffix": "Settlement"},
            ]
            all_types = []
            for model_info in table_models:
                stmt = select(model_info["type"])
                result = await session.exec(stmt)
                types = result.all()
                types = sorted(types, key=lambda x: len(x.name), reverse=True)
                for t in types:
                    all_types.append(
                        {
                            "type_obj": t,
                            "main_model": model_info["main"],
                            "fk_field": f"{model_info['suffix'].lower()}_type_id",
                        }
                    )
            created_objects_info = []
            for key, value in address_elements.items():
                element_name = value
                if "микрорайон" in element_name:
                    print(element_name)
                for type_info in all_types:
                    type_name = type_info["type_obj"].name
                    pattern = r"\b" + type_name + r"\b"
                    match = re.search(pattern, element_name)
                    if match:
                        obj = type_info["main_model"](
                            name=element_name.replace(type_name, "").strip(),
                            full_name=element_name,
                            short_name=element_name,
                            **{type_info["fk_field"]: type_info["type_obj"].id},
                        )
                        created_objects_info.append({type_info["main_model"].__name__: obj})
                        break

            region = address_elements.get("state")
            region_obj = Region(name=region, short_name=region, full_name=region)
            created_objects_info.append({"Region": region_obj})

            if address_elements.get("district1") or address_elements.get("town") or address_elements.get("suburb") or address_elements.get("city_district"):
                district = address_elements.get("district1") or address_elements.get("town") or address_elements.get("suburb") or address_elements.get("city_district")
                district_obj = District(
                    name=district.replace("район", "").replace("р-н", "").strip(),
                    short_name="р-н " + district.replace("район", "").replace("р-н", "").strip(),
                    full_name="район " + district.replace("район", "").replace("р-н", "").strip(),
                )
                created_objects_info.append({"District": district_obj})

            if address_elements.get("quarter"):
                microdistrict_obj = address_elements.get("quarter")
                if microdistrict_obj:
                    microdistrict_obj = Microdistrict(
                        name=microdistrict_obj.replace("микрорайон", ""),
                        short_name="мкр. " + microdistrict_obj.replace("микрорайон", ""),
                        full_name="микрорайон " + microdistrict_obj.replace("микрорайон", ""),
                    )
                    created_objects_info.append({"Microdistrict": microdistrict_obj})
            # residential_complex = address_elements.get("neighbourhood") if address_elements.get("neighbourhood") in full_address else None
            house_number = address_elements.get("house_number")
            residential_complex = address_elements.get("residential_complex")
            if residential_complex is None:
                residential_complex = re.findall(r"жилой комплекс [^,][А-яЁ ]+", full_address)[0] if len(re.findall(r"жилой комплекс [^,][А-яЁ ]+", full_address)) > 0 else None
            if residential_complex:
                residential_complex = ResidentialComplex(
                    name=residential_complex.replace("жилой комплекс", "").replace("ЖК", "").strip(),
                    short_name="ЖК "
                    + residential_complex.replace("жилой комплекс", "").replace("ЖК", "").strip()[0].lower()
                    + residential_complex.replace("жилой комплекс", "").replace("ЖК", "").strip()[1:],
                    full_name=residential_complex.replace("жилой комплекс", "").replace("ЖК", "").strip() + " жилой комплекс",
                    is_suburban=True if "КП" in residential_complex else False,
                )
                created_objects_info.append({"ResidentialComplex": residential_complex})
        except Exception as e:
            print(e)
    print(f"С url'a: {url} спаршены объекты:")
    print(full_address)
    print(full_address_from_api)
    print("-" * 40)
    for el in created_objects_info:
        print(el)
    print("-" * 40)
    return created_objects_info


async def initialize_address_elements5(address_elements: dict, url: str, full_address: str, full_address_from_api):
    async with async_session_maker() as session:
        settlements_keys = {"city": "город", "village": "деревня", "hamlet": "посёлок"}
        for key, value in settlements_keys.items():
            if address_elements.get(key):
                address_elements[key] = value + " " + address_elements[key]
        try:
            table_models = [
                {
                    "type": MunicipalityType,
                    "main": Municipality,
                    "suffix": "Municipality",
                },
                {"type": StreetType, "main": Street, "suffix": "Street"},
                {"type": PartnershipType, "main": Partnership, "suffix": "Partnership"},
                {"type": SettlementType, "main": Settlement, "suffix": "Settlement"},
            ]
            all_types = []
            for model_info in table_models:
                stmt = select(model_info["type"])
                result = await session.exec(stmt)
                types = result.all()
                types = sorted(types, key=lambda x: len(x.name), reverse=True)
                for t in types:
                    all_types.append(
                        {
                            "type_obj": t,
                            "main_model": model_info["main"],
                            "fk_field": f"{model_info['suffix'].lower()}_type_id",
                        }
                    )
            created_objects_info = []
            for key, value in address_elements.items():
                element_name = value
                if "микрорайон" in element_name:
                    print(element_name)
                for type_info in all_types:
                    type_name = type_info["type_obj"].name
                    pattern = r"\b" + type_name + r"\b"
                    match = re.search(pattern, element_name)
                    if match:
                        obj = type_info["main_model"](
                            name=element_name.replace(type_name, "").strip(),
                            full_name=element_name,
                            short_name=element_name,
                            **{type_info["fk_field"]: type_info["type_obj"].id},
                        )
                        created_objects_info.append({type_info["main_model"].__name__: obj})
                        break

            region = Region(
                name=address_elements["state"],
                full_name=address_elements["state"],
                short_name=address_elements["state"],
            )
            created_objects_info.append({"Region": region})
            district = District(
                name=address_elements["suburb"].replace(" район", ""),
                short_name=address_elements["suburb"],
                full_name=address_elements["suburb"],
            )
            created_objects_info.append({"District": district})
            if address_elements.get("residential_complex"):
                residential_complex = ResidentialComplex(
                    name=address_elements["residential_complex"],
                    short_name=address_elements["residential_complex"],
                    full_name=address_elements["residential_complex"],
                    is_suburban=True if "КП" in address_elements["residential_complex"] else False,
                )
                created_objects_info.append({"ResidentialComplex": residential_complex})
            # if not any("Settlement" in obj.keys() for obj in created_objects_info):
            #     city = next((el["name"] for el in address_elements if "locality" == el.get("kind")), None)
            #     # city = " ".join([el.capitalize() for el in cyrtranslit.to_cyrillic(url.split("//")[2].split("/")[0].replace("_", " "), "ru").split()])
            #     city_id = next((item["type_obj"].id for item in all_types if getattr(item.get("type_obj"), "name", None) == "город"), None)
            #     settlement = Settlement(
            #         name=city,
            #         settlement_type_id=city_id,
            #         full_name="город " + city,
            #         short_name="город " + city,
            #     )
            #     created_objects_info.append({"Settlement": settlement})
            # jiloy_complex = next((el["name"] for el in address_elements if "residential_complex" == el.get("kind")), None)
            # if jiloy_complex:
            #     residential_complex = ResidentialComplex(
            #         name=jiloy_complex, short_name=jiloy_complex, full_name=jiloy_complex, is_suburban=True if "КП" in jiloy_complex.split() else False
            #     )
            #     created_objects_info.append({"ResidentialComplex": residential_complex})
        except Exception as e:
            print(e)
        # microraion = next((el["name"] for el in address_elements if el.get("kind") == "district"), None)
        # if microraion:
        #     if "микрорайон" in microraion:
        #         microdistrict = Microdistrict(name=microraion.replace("микрорайон ", ""), full_name=microraion, short_name=microraion)
        #         created_objects_info.append({"Microdistrict": microdistrict})
        #     else:
        #         print("ФеЙкОвЫй дистрикт: ", microraion)

        print(f"С url'a: {url} спаршены объекты:")
        print(full_address)
        print(full_address_from_api)
        print("-" * 40)
        for el in created_objects_info:
            print(el)
        print("-" * 40)
        return created_objects_info


async def initialize_address_elements1(address_elements: dict, url: str, full_address: str, full_address_from_api):
    async with async_session_maker() as session:
        try:
            table_models = [
                {
                    "type": MunicipalityType,
                    "main": Municipality,
                    "suffix": "Municipality",
                },
                {"type": StreetType, "main": Street, "suffix": "Street"},
                {"type": PartnershipType, "main": Partnership, "suffix": "Partnership"},
                {"type": SettlementType, "main": Settlement, "suffix": "Settlement"},
            ]
            all_types = []
            for model_info in table_models:
                stmt = select(model_info["type"])
                result = await session.exec(stmt)
                types = result.all()
                types = sorted(types, key=lambda x: len(x.name), reverse=True)
                for t in types:
                    all_types.append(
                        {
                            "type_obj": t,
                            "main_model": model_info["main"],
                            "fk_field": f"{model_info['suffix'].lower()}_type_id",
                        }
                    )
            created_objects_info = []
            for el_el in address_elements:
                element_name = el_el["name"]

                for type_info in all_types:
                    type_name = type_info["type_obj"].name
                    pattern = r"\b" + type_name + r"\b"
                    match = re.search(pattern, element_name)
                    if match:
                        obj = type_info["main_model"](
                            name=element_name.replace(type_name, "").strip(),
                            full_name=element_name,
                            short_name=element_name,
                            **{type_info["fk_field"]: type_info["type_obj"].id},
                        )
                        created_objects_info.append({type_info["main_model"].__name__: obj})
                        break
            oblast = [el["name"] for el in address_elements if "область" in el.get("name", "")][0]
            region = Region(
                name=oblast.replace("область", "").strip(),
                full_name=oblast,
                short_name=oblast,
            )
            created_objects_info.append({"Region": region})
            raion = next(
                (el["name"] for el in address_elements if "district1" == el.get("kind")),
                None,
            )
            if raion:
                district = District(name=raion.replace("р-н ", ""), short_name=raion, full_name=raion)
                created_objects_info.append({"District": district})
            if not any("Settlement" in obj.keys() for obj in created_objects_info):
                city = next(
                    (el["name"] for el in address_elements if "locality" == el.get("kind")),
                    None,
                )
                # city = " ".join([el.capitalize() for el in cyrtranslit.to_cyrillic(url.split("//")[2].split("/")[0].replace("_", " "), "ru").split()])
                city_id = next(
                    (item["type_obj"].id for item in all_types if getattr(item.get("type_obj"), "name", None) == "город"),
                    None,
                )
                settlement = Settlement(
                    name=city,
                    settlement_type_id=city_id,
                    full_name="город " + city,
                    short_name="город " + city,
                )
                created_objects_info.append({"Settlement": settlement})
            jiloy_complex = next(
                (el["name"] for el in address_elements if "residential_complex" == el.get("kind")),
                None,
            )
            if jiloy_complex:
                residential_complex = ResidentialComplex(
                    name=jiloy_complex,
                    short_name=jiloy_complex,
                    full_name=jiloy_complex,
                    is_suburban=True if "КП" in jiloy_complex.split() else False,
                )
                created_objects_info.append({"ResidentialComplex": residential_complex})
        except Exception as e:
            print(e)
        microraion = next(
            (el["name"] for el in address_elements if el.get("kind") == "district"),
            None,
        )
        if microraion:
            if "микрорайон" in microraion:
                microdistrict = Microdistrict(
                    name=microraion.replace("микрорайон ", ""),
                    full_name=microraion,
                    short_name=microraion,
                )
                created_objects_info.append({"Microdistrict": microdistrict})
            else:
                print("ФеЙкОвЫй дистрикт: ", microraion)

        print(f"С url'a: {url} спаршены объекты:")
        print(full_address)
        print(full_address_from_api)
        print("-" * 40)
        for el in created_objects_info:
            print(el)
        print("-" * 40)
        return created_objects_info


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


# TODO ИНФУ О ЗАСТРОЙЩИКЕ ПАРСИТЬ
def parse_offer_info_from_json(json_data: dict):
    today_views = parse("$..todayViews").find(json_data)[0].value
    total_views = parse("$..totalViews").find(json_data)[0].value
    return {"today_views": today_views, "total_views": total_views}


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

        # координаты и полный адрес
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
            address["microdistrict_full_name"] = microdistrict_match["shortName"]
            address["microdistrict_name"] = microdistrict_match["name"]
            address["microdistrict_short_name"] = microdistrict_match["fullName"]

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
            views_stats_json = json.loads(re.findall(r"{\".+\"}", views_stats_text)[0])
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


async def main():
    await parse_offers2("avito", "suburban")
    # await parse_offers_cian()


if __name__ == "__main__":
    asyncio.run(main())
