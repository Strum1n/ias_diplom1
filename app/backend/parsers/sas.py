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


# 55.751143, 37.590003
async def sas():
    lat = 55.751143
    lon = 37.590003
    overpass_url = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    overpass_query = f"""
    [out:json];
    is_in({lat},{lon})->.a;
    relation(pivot.a)["boundary"="administrative"]["admin_level"~"5|6|7|8|9"];
    out body;
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
