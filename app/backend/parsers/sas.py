import json
import dateparser

# Английский → Русский
from geopy.geocoders import Nominatim


sas = ["попа", "какашка", "лол"]
sos = ["попа"]
print(
    next(
        (item for item in sas if item in sos),
        None,
    )
)

kek = "22-го Съезда КПСС"
sas = "пер. 22-го съезда КПСС"
lol = kek.lower() in sas.lower()
print(lol)


kok = "19 декабря 2025"
date = dateparser.parse(kok, languages=["ru"])
kek = {"sas": 45464, "lol": 4849894, "mda": 865116}
ses = "Квартал Медовый"
sdasd = ses[0].lower() + ses[1:]
sas = kek.get("sas", {})
for key, value in kek.items():
    print(value)
geolocator = Nominatim(user_agent="strumin@mail")
location = geolocator.geocode(
    "ул. Флотская, р-н Бежицкий,",
    addressdetails=True,
    language="ru",
    country_codes="ru",  # Ограничиваем поиск Россией
    exactly_one=True,
)
location_reverse = geolocator.reverse("55.608073, 37.362145", exactly_one=True, namedetails=True, addressdetails=True)
location_text = json.dumps(location_reverse._raw, ensure_ascii=False)
print("sas")
