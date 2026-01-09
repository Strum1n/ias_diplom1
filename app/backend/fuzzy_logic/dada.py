import asyncio
import httpx
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
from ckmeans_1d_dp import ckmeans

API_URL = "http://localhost:8000/properties/data"

async def fetch_property_data() -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(API_URL)
        resp.raise_for_status()
        return resp.json()

def build_1d_trimfs(universe: np.ndarray, centers: list[float]) -> dict[str, np.ndarray]:
    c0, c1, c2 = centers
    return {
        'low': fuzz.trimf(universe, [universe[0], universe[0], c0]),
        'medium': fuzz.trimf(universe, [c0, c1, c2]),
        'high': fuzz.trimf(universe, [c1, universe[-1], universe[-1]]),
    }

def get_centers(arr: np.ndarray) -> list[float]:
    clean = arr[~np.isnan(arr)]
    result = ckmeans(clean.tolist(), k=3)
    return sorted(result.centers)

async def initialize_models() -> dict:
    props = await fetch_property_data()

    area_arr = np.array([p["total_area"] or 0 for p in props], dtype=float)
    prices = np.array([p["price"] or 0 for p in props], dtype=float)
    metros = np.array([p["distances"]["Станция метро"] or 0 for p in props], dtype=float)
    buses = np.array([p["distances"]["Остановка"] or 0 for p in props], dtype=float)
    kinders = np.array([p["distances"]["Детский сад"] or 0 for p in props], dtype=float)
    schools = np.array([p["distances"]["Школа"] or 0 for p in props], dtype=float)

    area_centers = get_centers(area_arr)
    price_centers = get_centers(prices)
    metro_centers = get_centers(metros)
    bus_centers = get_centers(buses)
    kinder_centers = get_centers(kinders)
    school_centers = get_centers(schools)

    # 1. Модель цены
    price = ctrl.Antecedent(np.linspace(0, prices.max(), 100), 'price')
    fns = build_1d_trimfs(price.universe, price_centers)
    price['low'], price['medium'], price['high'] = fns['low'], fns['medium'], fns['high']

    category = ctrl.Consequent(np.arange(0, 11, 1), 'category')
    category['cheap'] = fuzz.trimf(category.universe, [0, 0, 4])
    category['normal'] = fuzz.trimf(category.universe, [3, 5, 7])
    category['expensive'] = fuzz.trimf(category.universe, [6, 10, 10])

    price_rules = [
        ctrl.Rule(price['low'], category['cheap']),
        ctrl.Rule(price['medium'], category['normal']),
        ctrl.Rule(price['high'], category['expensive']),
    ]
    price_model = ctrl.ControlSystem(price_rules)

    # 2. Модель транспортной доступности
    metro_distance = ctrl.Antecedent(np.linspace(0, metros.max(), 100), 'metro')
    bus_stop_distance = ctrl.Antecedent(np.linspace(0, buses.max(), 100), 'bus_stop')
    access = ctrl.Consequent(np.arange(0, 11, 1), 'access')

    for var, centers in ((metro_distance, metro_centers),
                         (bus_stop_distance, bus_centers)):
        fns = build_1d_trimfs(var.universe, centers)
        var['close'], var['medium'], var['far'] = fns['low'], fns['medium'], fns['high']

    access['low'] = fuzz.trimf(access.universe, [0, 0, 4])
    access['medium'] = fuzz.trimf(access.universe, [3, 5, 7])
    access['high'] = fuzz.trimf(access.universe, [6, 10, 10])

    trans_rules = [
        ctrl.Rule(metro_distance['close'] & bus_stop_distance['close'], access['high']),
        ctrl.Rule(metro_distance['medium'] | bus_stop_distance['medium'], access['medium']),
        ctrl.Rule(metro_distance['far'] & bus_stop_distance['far'], access['low']),
    ]
    transport_model = ctrl.ControlSystem(trans_rules)

    # 3. Модель комфорта для пожилых
    floor = ctrl.Antecedent(np.arange(1, 26, 1), 'floor')
    elevator = ctrl.Antecedent(np.arange(0, 2, 1), 'elevator')
    comfort_elder = ctrl.Consequent(np.arange(0, 11, 1), 'comfort_senior')

    floor['low'] = fuzz.trapmf(floor.universe, [1, 1, 2, 4])
    floor['medium'] = fuzz.trimf(floor.universe, [3, 5, 8])
    floor['high'] = fuzz.trapmf(floor.universe, [7, 10, 25, 25])

    elevator['no'] = fuzz.trimf(elevator.universe, [0, 0, 0])
    elevator['yes'] = fuzz.trimf(elevator.universe, [1, 1, 1])

    comfort_elder['low'] = fuzz.trimf(comfort_elder.universe, [0, 0, 4])
    comfort_elder['medium'] = fuzz.trimf(comfort_elder.universe, [3, 5, 7])
    comfort_elder['high'] = fuzz.trimf(comfort_elder.universe, [6, 10, 10])

    senior_rules = [
        ctrl.Rule(floor['low'], comfort_elder['high']),
        ctrl.Rule(floor['medium'] & elevator['yes'], comfort_elder['medium']),
        ctrl.Rule(floor['medium'] & elevator['no'], comfort_elder['low']),
        ctrl.Rule(floor['high'] & elevator['yes'], comfort_elder['medium']),
        ctrl.Rule(floor['high'] & elevator['no'], comfort_elder['low']),
    ]
    senior_model = ctrl.ControlSystem(senior_rules)

    # 4. Модель комфорта для семьи (ИСПРАВЛЕННАЯ)
    rooms = ctrl.Antecedent(np.arange(1, 7, 1), 'rooms')
    area = ctrl.Antecedent(np.linspace(0, area_arr.max(), 100), 'area')  # Исправленный universe
    kindergarten_distance = ctrl.Antecedent(np.linspace(0, kinders.max(), 100), 'kindergarten')
    school_distance = ctrl.Antecedent(np.linspace(0, schools.max(), 100), 'school')
    comfort_family = ctrl.Consequent(np.arange(0, 11, 1), 'comfort_family')

    # Функции принадлежности для комнат
    rooms['few'] = fuzz.trapmf(rooms.universe, [1, 1, 2, 3])
    rooms['enough'] = fuzz.trapmf(rooms.universe, [2, 3, 4, 5])
    rooms['many'] = fuzz.trapmf(rooms.universe, [4, 5, 6, 6])
    
    # ИСПРАВЛЕННЫЕ функции для площади
    # Генерируем функции принадлежности на основе центров
    small_center, medium_center, large_center = area_centers
    area['small'] = fuzz.trapmf(area.universe, 
                               [0, 0, small_center, (small_center + medium_center)/2])
    area['medium'] = fuzz.trimf(area.universe, 
                               [small_center, medium_center, large_center])
    area['large'] = fuzz.trapmf(area.universe, 
                               [(medium_center + large_center)/2, large_center, 
                                area.universe[-1], area.universe[-1]])
    
    # Функции для расстояний
    for var, centers in ((kindergarten_distance, kinder_centers),
                         (school_distance, school_centers)):
        close_center, medium_center, far_center = centers
        var['close'] = fuzz.trapmf(var.universe, 
                                  [0, 0, close_center, (close_center + medium_center)/2])
        var['medium'] = fuzz.trimf(var.universe, 
                                  [close_center, medium_center, far_center])
        var['far'] = fuzz.trapmf(var.universe, 
                                [(medium_center + far_center)/2, far_center, 
                                 var.universe[-1], var.universe[-1]])
    
    comfort_family.automf(3, names=['low', 'medium', 'high'])

    # УЛУЧШЕННЫЕ правила для семьи
    family_rules = [
        # Идеальные условия
        ctrl.Rule(
            rooms['many'] & area['large'] & 
            kindergarten_distance['close'] & school_distance['close'], 
            comfort_family['high']
        ),
        
        # Хорошие условия по площади и комнатам
        ctrl.Rule(
            (area['large'] | area['medium']) & 
            (rooms['many'] | rooms['enough']), 
            comfort_family['high']
        ),
        
        # Положительное влияние площади
        ctrl.Rule(
            area['large'], 
            comfort_family['high']
        ),
        ctrl.Rule(
            area['medium'], 
            comfort_family['medium']
        ),
        
        # Отрицательное влияние удаленности
        ctrl.Rule(
            kindergarten_distance['far'] | school_distance['far'], 
            comfort_family['low']
        ),
        
        # Негативные условия по комнатам
        ctrl.Rule(
            rooms['few'], 
            comfort_family['low']
        ),
        
        # Компенсация площади при удаленности
        ctrl.Rule(
            area['large'] & 
            (kindergarten_distance['medium'] | school_distance['medium']), 
            comfort_family['medium']
        ),
        
        # Резервное правило
        ctrl.Rule(
            rooms['enough'] & area['medium'] & 
            ~kindergarten_distance['far'] & ~school_distance['far'], 
            comfort_family['medium']
        ),
    ]
    family_model = ctrl.ControlSystem(family_rules)

    return {
        'price_model': price_model,
        'transport_model': transport_model,
        'senior_model': senior_model,
        'family_model': family_model,
    }

def evaluate_property(prop: dict, models: dict) -> dict:
    results = {}
    
    # 1. Модель цены
    price_sim = ctrl.ControlSystemSimulation(models['price_model'])
    price_sim.input['price'] = prop["price"] or 0
    price_sim.compute()
    results["price_category"] = price_sim.output["category"]
    
    # 2. Модель транспортной доступности
    transport_sim = ctrl.ControlSystemSimulation(models['transport_model'])
    transport_sim.input['metro'] = prop["distances"].get("Станция метро", 0) or 0
    transport_sim.input['bus_stop'] = prop["distances"].get("Остановка", 0) or 0
    transport_sim.compute()
    results["accessibility"] = transport_sim.output["access"]
    
    # 3. Модель комфорта для пожилых
    senior_sim = ctrl.ControlSystemSimulation(models['senior_model'])
    senior_sim.input['floor'] = prop["floor"] or 1
    senior_sim.input['elevator'] = 1 if prop.get("elevator") else 0
    senior_sim.compute()
    results["senior_comfort"] = senior_sim.output["comfort_senior"]
    
    # 4. Модель комфорта для семьи
    family_sim = ctrl.ControlSystemSimulation(models['family_model'])
    family_sim.input['rooms'] = prop["rooms"] or 1
    family_sim.input['area'] = prop["total_area"] or 0
    family_sim.input['kindergarten'] = prop["distances"].get("Детский сад", 0) or 0
    family_sim.input['school'] = prop["distances"].get("Школа", 0) or 0
    
    try:
        family_sim.compute()
        results["family_comfort"] = family_sim.output["comfort_family"]
    except Exception as e:
        print(f"Ошибка в модели для семьи: {e}")
        # В случае ошибки используем значение по умолчанию
        results["family_comfort"] = 5.0
    
    # Отладочная информация
    print("\nОтладочная информация для модели семьи:")
    print(f"Комнаты: {prop['rooms']}, Площадь: {prop['total_area']}")
    print(f"Детсад: {prop['distances'].get('Детский сад', 0)} м, Школа: {prop['distances'].get('Школа', 0)} м")
    print(f"Результат: {results['family_comfort']:.2f}")
    
    return results

if __name__ == "__main__":
    models = asyncio.run(initialize_models())
    
        # Тест 2: Большая площадь
    property_data_large = {
        "price": 15_000_000,
        "total_area": 1,
        "floor": 3,
        "rooms": 5,
        "elevator": True,
        "distances": {
            "Станция метро": 800,
            "Остановка": 150,
            "Детский сад": 1,
            "Школа": 1,
        }
    }
    
    print("Тест с большой площадью (100 кв.м):")
    evaluation_large = evaluate_property(property_data_large, models)
    print(f"Комфорт для семьи: {evaluation_large['family_comfort']:.2f}")