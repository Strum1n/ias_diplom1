from typing import Any, Dict

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


class FuzzyEvaluator:
    def __init__(self):
        self.setup_fuzzy_systems()

    # -------------------------
    # COMMON UTILITIES
    # -------------------------

    @staticmethod
    def clip(value, min_v, max_v):
        return max(min(value, max_v), min_v)

    def get_category(self, value: float, consequent: ctrl.Consequent) -> str:
        memberships = {name: fuzz.interp_membership(consequent.universe, term.mf, value) for name, term in consequent.terms.items()}
        return max(memberships.items(), key=lambda x: x[1])[0]

    def _evaluate(self, system, inputs: Dict[str, Any], output_name: str):
        for key, value in inputs.items():
            system.input[key] = value
        system.compute()

        score = system.output[output_name]
        consequent = next(c for c in system.ctrl.consequents if c.label == output_name)
        return {
            "score": float(score),
            "category": self.get_category(score, consequent),
        }

    # -------------------------
    # TRANSPORT
    # -------------------------

    def create_transport_system(self):
        metro_distance = ctrl.Antecedent(np.arange(0, 1001, 1), "metro_distance")
        bus_distance = ctrl.Antecedent(np.arange(0, 1001, 1), "bus_distance")

        # ВАЖНО: numpy array
        parking_availability = ctrl.Antecedent(np.array([0, 1]), "parking")

        transport_access = ctrl.Consequent(np.arange(0, 11, 1), "transport_access")

        for var in [metro_distance, bus_distance]:
            var["close"] = fuzz.trimf(var.universe, [0, 0, 400])
            var["medium"] = fuzz.trimf(var.universe, [300, 500, 700])
            var["far"] = fuzz.trimf(var.universe, [600, 1000, 1000])

        # Бинарные MF
        parking_availability["no"] = fuzz.trimf(parking_availability.universe, [0, 0, 1])
        parking_availability["yes"] = fuzz.trimf(parking_availability.universe, [0, 1, 1])

        transport_access["low"] = fuzz.trimf(transport_access.universe, [0, 0, 5])
        transport_access["medium"] = fuzz.trimf(transport_access.universe, [0, 5, 10])
        transport_access["high"] = fuzz.trimf(transport_access.universe, [5, 10, 10])

        rules = [
            ctrl.Rule(metro_distance["close"] & bus_distance["close"] & parking_availability["yes"], transport_access["high"]),
            ctrl.Rule(metro_distance["close"] & bus_distance["close"] & parking_availability["no"], transport_access["high"]),
            ctrl.Rule(metro_distance["close"] & bus_distance["medium"] & parking_availability["yes"], transport_access["high"]),
            ctrl.Rule(metro_distance["close"] & bus_distance["medium"] & parking_availability["no"], transport_access["medium"]),
            ctrl.Rule(metro_distance["close"] & bus_distance["far"] & parking_availability["yes"], transport_access["medium"]),
            ctrl.Rule(metro_distance["close"] & bus_distance["far"] & parking_availability["no"], transport_access["medium"]),
            ctrl.Rule(metro_distance["medium"] & bus_distance["close"] & parking_availability["yes"], transport_access["high"]),
            ctrl.Rule(metro_distance["medium"] & bus_distance["close"] & parking_availability["no"], transport_access["medium"]),
            ctrl.Rule(metro_distance["medium"] & bus_distance["medium"] & parking_availability["yes"], transport_access["medium"]),
            ctrl.Rule(metro_distance["medium"] & bus_distance["medium"] & parking_availability["no"], transport_access["medium"]),
            ctrl.Rule(metro_distance["medium"] & bus_distance["far"] & parking_availability["yes"], transport_access["medium"]),
            ctrl.Rule(metro_distance["medium"] & bus_distance["far"] & parking_availability["no"], transport_access["low"]),
            ctrl.Rule(metro_distance["far"] & bus_distance["close"] & parking_availability["yes"], transport_access["medium"]),
            ctrl.Rule(metro_distance["far"] & bus_distance["close"] & parking_availability["no"], transport_access["medium"]),
            ctrl.Rule(metro_distance["far"] & bus_distance["medium"] & parking_availability["yes"], transport_access["medium"]),
            ctrl.Rule(metro_distance["far"] & bus_distance["medium"] & parking_availability["no"], transport_access["low"]),
            ctrl.Rule(metro_distance["far"] & bus_distance["far"] & parking_availability["yes"], transport_access["low"]),
            ctrl.Rule(metro_distance["far"] & bus_distance["far"] & parking_availability["no"], transport_access["low"]),
        ]

        return ctrl.ControlSystemSimulation(ctrl.ControlSystem(rules))

    # -------------------------
    # ELDERLY
    # -------------------------

    def create_elderly_system(self):
        hospital_distance = ctrl.Antecedent(np.arange(0, 3001, 1), "hospital_distance")
        pharmacy_distance = ctrl.Antecedent(np.arange(0, 1001, 1), "pharmacy_distance")
        floor = ctrl.Antecedent(np.arange(0, 11, 1), "floor")
        elevator_availability = ctrl.Antecedent([0, 1], "elevator")

        elderly_friendly = ctrl.Consequent(np.arange(0, 11, 1), "elderly_friendly")

        hospital_distance["close"] = fuzz.trimf(hospital_distance.universe, [0, 0, 1000])
        hospital_distance["medium"] = fuzz.trimf(hospital_distance.universe, [800, 1500, 2500])
        hospital_distance["far"] = fuzz.trimf(hospital_distance.universe, [2000, 3000, 3000])

        pharmacy_distance["close"] = fuzz.trimf(pharmacy_distance.universe, [0, 0, 300])
        pharmacy_distance["medium"] = fuzz.trimf(pharmacy_distance.universe, [200, 400, 600])
        pharmacy_distance["far"] = fuzz.trimf(pharmacy_distance.universe, [500, 1000, 1000])

        floor["low"] = fuzz.trimf(floor.universe, [0, 0, 3])
        floor["medium"] = fuzz.trimf(floor.universe, [2, 4, 7])
        floor["high"] = fuzz.trimf(floor.universe, [5, 10, 10])

        elevator_availability["no"] = fuzz.trimf(elevator_availability.universe, [0, 0, 1])
        elevator_availability["yes"] = fuzz.trimf(elevator_availability.universe, [0, 1, 1])

        elderly_friendly["low"] = fuzz.trimf(elderly_friendly.universe, [0, 0, 5])
        elderly_friendly["medium"] = fuzz.trimf(elderly_friendly.universe, [0, 5, 10])
        elderly_friendly["high"] = fuzz.trimf(elderly_friendly.universe, [5, 10, 10])

        rules = [
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["no"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["no"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
        ]

        return ctrl.ControlSystemSimulation(ctrl.ControlSystem(rules))

    # -------------------------
    # FAMILY
    # -------------------------

    def create_family_system(self):
        kindergarten_distance = ctrl.Antecedent(np.arange(0, 1501, 1), "kindergarten_distance")
        school_distance = ctrl.Antecedent(np.arange(0, 1501, 1), "school_distance")
        total_area = ctrl.Antecedent(np.arange(0, 101, 1), "total_area")
        total_rooms = ctrl.Antecedent(np.arange(0, 5, 1), "total_rooms")

        family_friendly = ctrl.Consequent(np.arange(0, 11, 1), "family_friendly")

        for var, a, b in [
            (kindergarten_distance, 600, 1300),
            (school_distance, 800, 1300),
        ]:
            var["close"] = fuzz.trimf(var.universe, [0, 0, a])
            var["medium"] = fuzz.trimf(var.universe, [a - 300, a, b])
            var["far"] = fuzz.trimf(var.universe, [b, 1500, 1500])

        total_rooms["few"] = fuzz.trimf(total_rooms.universe, [0, 0, 3])
        total_rooms["many"] = fuzz.trimf(total_rooms.universe, [2, 5, 5])

        total_area["small"] = fuzz.trimf(total_area.universe, [0, 0, 40])
        total_area["medium"] = fuzz.trimf(total_area.universe, [30, 60, 70])
        total_area["large"] = fuzz.trimf(total_area.universe, [65, 100, 100])

        family_friendly["low"] = fuzz.trimf(family_friendly.universe, [0, 0, 5])
        family_friendly["medium"] = fuzz.trimf(family_friendly.universe, [0, 5, 10])
        family_friendly["high"] = fuzz.trimf(family_friendly.universe, [5, 10, 10])

        rules = [
            # Правила для total_rooms = "few"
            ctrl.Rule(kindergarten_distance["close"] & school_distance["close"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["close"] & total_area["medium"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["close"] & total_area["large"] & total_rooms["few"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["medium"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["medium"] & total_area["medium"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["medium"] & total_area["large"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["far"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["far"] & total_area["medium"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["far"] & total_area["large"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["close"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["close"] & total_area["medium"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["close"] & total_area["large"] & total_rooms["few"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["medium"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["medium"] & total_area["medium"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["medium"] & total_area["large"] & total_rooms["few"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["far"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["far"] & total_area["medium"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["far"] & total_area["large"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["close"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["close"] & total_area["medium"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["close"] & total_area["large"] & total_rooms["few"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["medium"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["medium"] & total_area["medium"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["medium"] & total_area["large"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["far"] & total_area["small"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["far"] & total_area["medium"] & total_rooms["few"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["far"] & total_area["large"] & total_rooms["few"], family_friendly["low"]),
            # Правила для total_rooms = "many"
            ctrl.Rule(kindergarten_distance["close"] & school_distance["close"] & total_area["small"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["close"] & total_area["medium"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["close"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["medium"] & total_area["small"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["medium"] & total_area["medium"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["medium"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["far"] & total_area["small"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["far"] & total_area["medium"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["close"] & school_distance["far"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["close"] & total_area["small"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["close"] & total_area["medium"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["close"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["medium"] & total_area["small"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["medium"] & total_area["medium"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["medium"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["far"] & total_area["small"] & total_rooms["many"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["far"] & total_area["medium"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["medium"] & school_distance["far"] & total_area["large"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["close"] & total_area["small"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["close"] & total_area["medium"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["close"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["medium"] & total_area["small"] & total_rooms["many"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["medium"] & total_area["medium"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["medium"] & total_area["large"] & total_rooms["many"], family_friendly["high"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["far"] & total_area["small"] & total_rooms["many"], family_friendly["low"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["far"] & total_area["medium"] & total_rooms["many"], family_friendly["medium"]),
            ctrl.Rule(kindergarten_distance["far"] & school_distance["far"] & total_area["large"] & total_rooms["many"], family_friendly["medium"]),
        ]

        return ctrl.ControlSystemSimulation(ctrl.ControlSystem(rules))

    # -------------------------
    # PUBLIC API
    # -------------------------

    def setup_fuzzy_systems(self):
        self.transport = self.create_transport_system()
        self.elderly = self.create_elderly_system()
        self.family = self.create_family_system()

    def evaluate_all(self, data: Dict[str, Any]):
        return {
            "transport_access": self._evaluate(
                self.transport,
                {
                    "metro_distance": self.clip(data["metro_distance"], 0, 1000),
                    "bus_distance": self.clip(data["bus_distance"], 0, 1000),
                    "parking": int(bool(data["parking_availability"])),
                },
                "transport_access",
            ),
            "elderly_friendly": self._evaluate(
                self.elderly,
                {
                    "hospital_distance": self.clip(data["hospital_distance"], 0, 3000),
                    "pharmacy_distance": self.clip(data["pharmacy_distance"], 0, 1000),
                    "floor": self.clip(data["floor"], 0, 10),
                    "elevator": int(bool(data["elevator_availability"])),
                },
                "elderly_friendly",
            ),
            "family_friendly": self._evaluate(
                self.family,
                {
                    "kindergarten_distance": self.clip(data["kindergarten_distance"], 0, 1500),
                    "school_distance": self.clip(data["school_distance"], 0, 1500),
                    "total_area": self.clip(data["total_area"], 0, 150),
                    "total_rooms": self.clip(data["total_rooms"], 0, 5),
                },
                "family_friendly",
            ),
        }


fuzzy_evaluator = FuzzyEvaluator()

result = fuzzy_evaluator.evaluate_all(
    {
        "metro_distance": 9999,
        "bus_distance": 9999,
        "parking_availability": False,
        "hospital_distance": 1900,
        "pharmacy_distance": 500,
        "floor": 1,
        "elevator_availability": False,
        "school_distance": 150,
        "kindergarten_distance": 200,
        "total_area": 67,
        "total_rooms": 3,
    }
)
print(result)
