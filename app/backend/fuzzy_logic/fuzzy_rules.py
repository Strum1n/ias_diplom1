import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


def create_transport_access_model():
    metro = ctrl.Antecedent(np.arange(0, 3001, 1), "metro")
    bus_stop = ctrl.Antecedent(np.arange(0, 2001, 1), "bus_stop")
    parking = ctrl.Antecedent(np.arange(0, 1001, 1), "parking")
    access = ctrl.Consequent(np.arange(0, 11, 1), "access")

    metro["close"] = fuzz.trimf(metro.universe, [0, 0, 500])
    metro["medium"] = fuzz.trimf(metro.universe, [300, 800, 1500])
    metro["far"] = fuzz.trimf(metro.universe, [1200, 3000, 3000])

    bus_stop["close"] = fuzz.trimf(bus_stop.universe, [0, 0, 400])
    bus_stop["medium"] = fuzz.trimf(bus_stop.universe, [200, 700, 1300])
    bus_stop["far"] = fuzz.trimf(bus_stop.universe, [1000, 2000, 2000])

    parking["close"] = fuzz.trimf(parking.universe, [0, 0, 200])
    parking["medium"] = fuzz.trimf(parking.universe, [150, 400, 700])
    parking["far"] = fuzz.trimf(parking.universe, [600, 1000, 1000])

    access["low"] = fuzz.trimf(access.universe, [0, 0, 4])
    access["medium"] = fuzz.trimf(access.universe, [3, 5, 7])
    access["high"] = fuzz.trimf(access.universe, [6, 10, 10])

    rules = [
        ctrl.Rule(metro["close"] & bus_stop["close"], access["high"]),
        ctrl.Rule(metro["medium"] | bus_stop["medium"], access["medium"]),
        ctrl.Rule(metro["far"] & bus_stop["far"], access["low"]),
        ctrl.Rule(parking["far"], access["low"]),
    ]

    return ctrl.ControlSystem(rules)


def create_senior_comfort_model():
    floor = ctrl.Antecedent(np.arange(1, 26, 1), "floor")
    elevator = ctrl.Antecedent(np.arange(0, 2, 1), "elevator")
    comfort = ctrl.Consequent(np.arange(0, 11, 1), "comfort")

    floor["low"] = fuzz.trapmf(floor.universe, [1, 1, 2, 4])
    floor["medium"] = fuzz.trimf(floor.universe, [3, 5, 8])
    floor["high"] = fuzz.trapmf(floor.universe, [7, 10, 25, 25])

    elevator["no"] = fuzz.trimf(elevator.universe, [0, 0, 0])
    elevator["yes"] = fuzz.trimf(elevator.universe, [1, 1, 1])

    comfort["low"] = fuzz.trimf(comfort.universe, [0, 0, 4])
    comfort["medium"] = fuzz.trimf(comfort.universe, [3, 5, 7])
    comfort["high"] = fuzz.trimf(comfort.universe, [6, 10, 10])

    rules = [
        ctrl.Rule(floor["low"] & elevator["yes"], comfort["high"]),
        ctrl.Rule(floor["medium"] & elevator["no"], comfort["low"]),
        ctrl.Rule(floor["high"] & elevator["no"], comfort["low"]),
    ]

    return ctrl.ControlSystem(rules)


def create_family_comfort_model():
    rooms = ctrl.Antecedent(np.arange(1, 7, 1), "rooms")
    area = ctrl.Antecedent(np.arange(20, 201, 1), "area")
    kindergarten = ctrl.Antecedent(np.arange(0, 2001, 1), "kindergarten")
    comfort = ctrl.Consequent(np.arange(0, 11, 1), "comfort")

    rooms["few"] = fuzz.trimf(rooms.universe, [1, 1, 2])
    rooms["enough"] = fuzz.trimf(rooms.universe, [2, 3, 4])
    rooms["many"] = fuzz.trimf(rooms.universe, [4, 5, 6])

    area["small"] = fuzz.trimf(area.universe, [20, 30, 50])
    area["medium"] = fuzz.trimf(area.universe, [40, 70, 100])
    area["large"] = fuzz.trimf(area.universe, [90, 150, 200])

    kindergarten["close"] = fuzz.trimf(kindergarten.universe, [0, 0, 500])
    kindergarten["medium"] = fuzz.trimf(kindergarten.universe, [300, 800, 1500])
    kindergarten["far"] = fuzz.trimf(kindergarten.universe, [1200, 2000, 2000])

    comfort["low"] = fuzz.trimf(comfort.universe, [0, 0, 4])
    comfort["medium"] = fuzz.trimf(comfort.universe, [3, 5, 7])
    comfort["high"] = fuzz.trimf(comfort.universe, [6, 10, 10])

    rules = [
        ctrl.Rule(rooms["many"] & area["large"] & kindergarten["close"], comfort["high"]),
        ctrl.Rule(rooms["few"] | kindergarten["far"], comfort["low"]),
        ctrl.Rule(rooms["enough"] & area["medium"], comfort["medium"]),
    ]

    return ctrl.ControlSystem(rules)


def create_price_model():
    price = ctrl.Antecedent(np.arange(0, 30_000_001, 100_000), "price")
    category = ctrl.Consequent(np.arange(0, 11, 1), "category")

    price["low"] = fuzz.trapmf(price.universe, [0, 0, 3_000_000, 5_000_000])
    price["medium"] = fuzz.trapmf(price.universe, [4_000_000, 6_000_000, 9_000_000, 12_000_000])
    price["high"] = fuzz.trapmf(price.universe, [11_000_000, 15_000_000, 30_000_000, 30_000_000])

    category["cheap"] = fuzz.trimf(category.universe, [0, 0, 4])
    category["normal"] = fuzz.trimf(category.universe, [3, 5, 7])
    category["expensive"] = fuzz.trimf(category.universe, [6, 10, 10])

    rules = [
        ctrl.Rule(price["low"], category["cheap"]),
        ctrl.Rule(price["medium"], category["normal"]),
        ctrl.Rule(price["high"], category["expensive"]),
    ]

    return ctrl.ControlSystem(rules)
