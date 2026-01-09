import json

# Английский → Русский

from geopy.geocoders import Nominatim

kek = {"sas": 45464, "lol": 4849894, "mda": 865116}
ses = "Квартал Медовый"
sdasd = ses[0].lower() + ses[1:]
sas = kek.get("sas", {})
for key, value in kek.items():
    print(value)
geolocator = Nominatim(user_agent="strumin@mail")
location = geolocator.geocode(
    "Московская обл., г.о. Мытищи, пос. Нагорное, жилой комплекс Датский квартал, ул. Полковника Романова, 5",
    addressdetails=True,
    language="ru",
    country_codes="ru",  # Ограничиваем поиск Россией
    exactly_one=True,
)
location_reverse = geolocator.reverse("55.550305, 40.008986", exactly_one=True, namedetails=True, addressdetails=True)
location_text = json.dumps(location_reverse._raw, ensure_ascii=False)
print("sas")
