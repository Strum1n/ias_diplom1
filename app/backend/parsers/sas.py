import asyncio
import json
import dateparser

# Английский → Русский
from geopy.geocoders import Photon


import overpy
import requests
import json

lat = 55.843308
lon = 37.668273
# 55.843308, 37.668273
# Запрос к публичному API Overpass Turbo


# 53.269452, 34.304505
# 53.233565, 34.310874
# 53.267653, 34.289709
# 53.348370, 34.310703
# 53.348913, 34.315311
# 53.296445, 34.316371
# 53.207631, 34.319408
# 55.751320, 37.595159
# 55.751143, 37.590003
async def sas():
    lat = 53.269452
    lon = 34.304505
    overpass_url = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    overpass_query = f"""
[out:json][timeout:25];

/* Найти все объекты, содержащие точку */
is_in({lat},{lon})->.a;

/* Административные границы */
relation(pivot.a)
  ["boundary"="administrative"]
  -> .admin;

/* Населённый пункт (город, посёлок и т.п.) */
(
  node(around:500,{lat},{lon})
    ["place"~"city|town|village|hamlet"];
  relation(around:500,{lat},{lon})
    ["place"~"city|town|village|hamlet"];
) -> .place;

/* Улица рядом с точкой */
way["highway"]["name"](around:250,{lat},{lon})
  -> .street;

/* ===== ЖИЛОЙ КОМПЛЕКС ===== */

/* 1. ЖК как site */
relation(around:150,{lat},{lon})
  ["site"="apartment_complex"]
  ["name"]
  -> .residential_site;

/* 2. ЖК как place */
(
  node(around:150,{lat},{lon})
    ["place"~"neighbourhood|quarter|residential"]
    ["name"];
  relation(around:150,{lat},{lon})
    ["place"~"neighbourhood|quarter|residential"]
    ["name"];
) -> .residential_place;

/* 3. ЖК как landuse */
(
  way(around:150,{lat},{lon})
    ["landuse"="residential"]
    ["name"];
  relation(around:150,{lat},{lon})
    ["landuse"="residential"]
    ["name"];
) -> .residential_landuse;

/* ===== СНТ / ДАЧНЫЕ ТОВАРИЩЕСТВА ===== */

/* 4. СНТ как allotments (основной вариант) */
(
  way(around:300,{lat},{lon})
    ["landuse"="allotments"]
    ["name"];
  relation(around:300,{lat},{lon})
    ["landuse"="allotments"]
    ["name"];
) -> .allotments;

/* ===== ВЫВОД ===== */
.admin               out tags;
.place               out tags;
.street              out tags;
.residential_site    out tags;
.residential_place   out tags;
.residential_landuse out tags;
.allotments          out tags;
    """
    api = overpy.Overpass(url=overpass_url, retry_timeout=10, max_retry_count=5)

    data = await asyncio.to_thread(api.query, overpass_query)
    return data


# response = requests.get(overpass_url, params={"data": overpass_query})
# data = response.json()

# if data["elements"]:
#     for elem in data["elements"]:
#         print(f"Найден район: {elem['tags'].get('name')}")
#         print(f"Административный уровень: {elem['tags'].get('admin_level')}")
# else:
#     print("Административный район не найден.")

# sas = ["попа", "какашка", "лол"]
# sos = ["попа"]
# print(
#     next(
#         (item for item in sas if item in sos),
#         None,
#     )
# )

# kek = "22-го Съезда КПСС"
# sas = "пер. 22-го съезда КПСС"
# lol = kek.lower() in sas.lower()
# print(lol)


# kok = "19 декабря 2025"
# date = dateparser.parse(kok, languages=["ru"])
# kek = {"sas": 45464, "lol": 4849894, "mda": 865116}
# ses = "Квартал Медовый"
# sdasd = ses[0].lower() + ses[1:]
# sas = kek.get("sas", {})
# for key, value in kek.items():
#     print(value)
# geolocator = Photon(user_agent="strumin@mail")
# location_reverse = geolocator.reverse(f"{lat}, {lon}")
# location_text = json.dumps(location_reverse._raw, ensure_ascii=False)
# print("sas")


async def main():
    await sas()
    print("sas")


if __name__ == "__main__":
    asyncio.run(main())
