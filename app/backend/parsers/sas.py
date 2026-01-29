import asyncio
import json
import re
import dateparser
from geopy.distance import geodesic

# Английский → Русский
from geopy.geocoders import Photon


import overpy
import requests
import json

lat = 56.29594415106905
lon = 37.24678720569668
# 55.843308, 37.668273
# Запрос к публичному API Overpass Turbo


# 53.297473, 34.312347
# 56.29594415106905, 'lng': 37.24678720569668
# 53.280264, 34.305547
# 53.296445, 34.316371
# 56.054789, 37.410035
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
    lat = 53.266290
    lon = 34.323693
    overpass_url = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    overpass_query = f"""
[out:json];
is_in({lat},{lon})->.areas;

(
  node(pivot.areas);
  way(pivot.areas);
  relation(pivot.areas);
)->.inside;

.inside out tags center;
    """
    api = overpy.Overpass(url=overpass_url, retry_timeout=10, max_retry_count=5)

    data = await asyncio.to_thread(api.query, overpass_query)
    region = next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "4"), None)
    super_district = next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "6"), None)
    municipality_name = next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "8"), None)
    district = next((relation.tags["name"] for relation in data.relations if relation.tags.get("admin_level") == "9"), None)
    microdistrict = next((relation.tags["name"] for relation in [*data.relations, *data.nodes] if "микрорайон" in relation.tags.get("name", "")), None)
    settlement = [relation for relation in [*data.relations, *data.nodes] if relation.tags.get("place", "ы") in ["city", "town", "village", "hamlet"]]
    settlement = (
        min(
            settlement,
            key=lambda e: geodesic((lat, lon), (e.center_lat if e._type_value == "relation" else e.lat, e.center_lon if e._type_value == "relation" else e.lon)).meters,
        ).tags["name"]
        if settlement
        else None
    )
    street = min(
        [relation for relation in data.ways],
        key=lambda e: geodesic((lat, lon), (e.center_lat, e.center_lon)).meters,
    ).tags["name"]
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
geolocator = Photon(user_agent="strumin@mail")
location_reverse = geolocator.reverse(f"{lat}, {lon}")
location_text = json.dumps(location_reverse._raw, ensure_ascii=False)
print("sas")


async def main():
    kek = ""
    ere = kek in "dasdasd"
    print()

    await sas()
    print("sas")


if __name__ == "__main__":
    asyncio.run(main())
