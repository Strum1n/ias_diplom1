from typing import Any, Dict

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


class FuzzyEvaluator:
    def __init__(self):
        self.setup_fuzzy_systems()

    def create_transport_system(self):
        metro_distance = ctrl.Antecedent(np.arange(0, 1001, 1), "metro_distance")
        bus_distance = ctrl.Antecedent(np.arange(0, 1001, 1), "bus_distance")
        parking_availability = ctrl.Antecedent(np.arange(0, 2, 1), "parking_availability")

        transport_access = ctrl.Consequent(np.arange(0, 11, 1), "transport_access")

        metro_distance["close"] = fuzz.trimf(metro_distance.universe, [0, 0, 500])
        metro_distance["medium"] = fuzz.trimf(metro_distance.universe, [450, 500, 700])
        metro_distance["far"] = fuzz.trimf(metro_distance.universe, [600, 1000, 1000])

        bus_distance["close"] = fuzz.trimf(bus_distance.universe, [0, 0, 400])
        bus_distance["medium"] = fuzz.trimf(bus_distance.universe, [350, 400, 500])
        bus_distance["far"] = fuzz.trimf(bus_distance.universe, [400, 1000, 1000])

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

        system = ctrl.ControlSystem(rules)
        return ctrl.ControlSystemSimulation(system)

    def create_elderly_system(self):
        hospital_distance = ctrl.Antecedent(np.arange(0, 3001, 1), "hospital_distance")
        pharmacy_distance = ctrl.Antecedent(np.arange(0, 1001, 1), "pharmacy_distance")  # Добавлена дистанция до аптеки
        floor = ctrl.Antecedent(np.arange(0, 11, 1), "floor")
        elevator_availability = ctrl.Antecedent(np.arange(0, 2, 1), "elevator_availability")

        elderly_friendly = ctrl.Consequent(np.arange(0, 11, 1), "elderly_friendly")

        hospital_distance["close"] = fuzz.trimf(hospital_distance.universe, [0, 0, 1000])
        hospital_distance["medium"] = fuzz.trimf(hospital_distance.universe, [500, 1500, 2500])
        hospital_distance["far"] = fuzz.trimf(hospital_distance.universe, [2000, 3000, 3000])

        # Функции принадлежности для дистанции до аптеки
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
            # Близкая больница и близкая аптека - высокий рейтинг
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["no"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["no"], elderly_friendly["medium"]),
            # Близкая больница, средняя аптека
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["no"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Близкая больница, далекая аптека
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["close"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Средняя больница, близкая аптека
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["yes"], elderly_friendly["high"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Средняя больница, средняя аптека
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Средняя больница, далекая аптека
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["medium"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Далекая больница, близкая аптека
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["low"] & elevator_availability["no"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["close"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Далекая больница, средняя аптека
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["yes"], elderly_friendly["medium"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["low"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["medium"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
            # Далекая больница, далекая аптека - низкий рейтинг
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["low"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["medium"] & elevator_availability["no"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["yes"], elderly_friendly["low"]),
            ctrl.Rule(hospital_distance["far"] & pharmacy_distance["far"] & floor["high"] & elevator_availability["no"], elderly_friendly["low"]),
        ]

        system = ctrl.ControlSystem(rules)
        return ctrl.ControlSystemSimulation(system)

    def create_family_system(self):
        kindergarten_distance = ctrl.Antecedent(np.arange(0, 1501, 1), "kindergarten_distance")
        school_distance = ctrl.Antecedent(np.arange(0, 1501, 1), "school_distance")
        total_area = ctrl.Antecedent(np.arange(1, 151, 1), "total_area")
        total_rooms = ctrl.Antecedent(np.arange(1, 6, 1), "total_rooms")

        family_friendly = ctrl.Consequent(np.arange(0, 11, 1), "family_friendly")

        # Существующие функции принадлежности остаются без изменений
        kindergarten_distance["close"] = fuzz.trimf(kindergarten_distance.universe, [0, 0, 650])
        kindergarten_distance["medium"] = fuzz.trimf(kindergarten_distance.universe, [300, 800, 1300])
        kindergarten_distance["far"] = fuzz.trimf(kindergarten_distance.universe, [800, 1500, 1500])

        school_distance["close"] = fuzz.trimf(school_distance.universe, [0, 0, 800])
        school_distance["medium"] = fuzz.trimf(school_distance.universe, [500, 1000, 1300])
        school_distance["far"] = fuzz.trimf(school_distance.universe, [1100, 1500, 1500])

        total_rooms["few"] = fuzz.trimf(total_rooms.universe, [0, 0, 3])
        total_rooms["enough"] = fuzz.trimf(total_rooms.universe, [2, 3, 4])
        total_rooms["many"] = fuzz.trimf(total_rooms.universe, [3, 6, 6])

        total_area["small"] = fuzz.trimf(total_area.universe, [0, 0, 50])
        total_area["medium"] = fuzz.trimf(total_area.universe, [40, 80, 110])
        total_area["large"] = fuzz.trimf(total_area.universe, [90, 150, 150])

        family_friendly["low"] = fuzz.trimf(family_friendly.universe, [0, 0, 5])
        family_friendly["medium"] = fuzz.trimf(family_friendly.universe, [0, 5, 10])
        family_friendly["high"] = fuzz.trimf(family_friendly.universe, [5, 10, 10])

        rules = [
            # Идеальные условия (оставить существующие)
            ctrl.Rule(
                ((total_rooms["many"] & total_area["large"]) | (total_rooms["enough"] & total_area["large"]) | (total_rooms["many"] & total_area["medium"]))
                & (kindergarten_distance["close"] | kindergarten_distance["medium"])
                & (school_distance["close"] | (school_distance["medium"])),
                family_friendly["high"],
            ),
            ctrl.Rule(
                ((total_rooms["many"] & total_area["large"]) | (total_rooms["enough"] & total_area["large"]) | (total_rooms["many"] & total_area["medium"]))
                & (kindergarten_distance["far"] & school_distance["far"]),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                ((total_rooms["many"] & total_area["large"]) | (total_rooms["enough"] & total_area["large"]) | (total_rooms["many"] & total_area["medium"]))
                & ((kindergarten_distance["medium"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                ((total_rooms["many"] & total_area["large"]) | (total_rooms["enough"] & total_area["large"]) | (total_rooms["many"] & total_area["medium"]))
                & ((kindergarten_distance["close"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["close"])),
                family_friendly["high"],
            ),
            # Средние условия (оставить существующие)
            ctrl.Rule(
                (total_rooms["enough"] & total_area["medium"])
                & (kindergarten_distance["close"] | kindergarten_distance["medium"])
                & (school_distance["close"] | (school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule((total_rooms["enough"] & total_area["medium"]) & (kindergarten_distance["far"] & school_distance["far"]), family_friendly["low"]),
            ctrl.Rule(
                (total_rooms["enough"] & total_area["medium"])
                & ((kindergarten_distance["medium"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                (total_rooms["enough"] & total_area["medium"])
                & ((kindergarten_distance["close"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["close"])),
                family_friendly["medium"],
            ),
            # Плохие условия (оставить существующие)
            ctrl.Rule((total_rooms["few"]) & (total_area["small"]), family_friendly["low"]),
            # Смешанные условия (оставить существующие)
            ctrl.Rule((total_rooms["few"] & total_area["large"]) & (kindergarten_distance["close"] & school_distance["close"]), family_friendly["high"]),
            ctrl.Rule(
                (total_rooms["few"] & total_area["large"])
                & ((kindergarten_distance["medium"] & school_distance["close"]) | (kindergarten_distance["close"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule((total_rooms["few"] & total_area["large"]) & (kindergarten_distance["far"] & school_distance["far"]), family_friendly["low"]),
            ctrl.Rule(
                (total_rooms["few"] & total_area["large"])
                & ((kindergarten_distance["medium"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                (total_rooms["few"] & total_area["large"])
                & ((kindergarten_distance["close"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["close"])),
                family_friendly["medium"],
            ),
            ctrl.Rule((total_rooms["many"] & total_area["small"]) & (kindergarten_distance["close"] & school_distance["close"]), family_friendly["high"]),
            ctrl.Rule(
                (total_rooms["many"] & total_area["small"])
                & ((kindergarten_distance["medium"] & school_distance["close"]) | (kindergarten_distance["close"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule((total_rooms["many"] & total_area["small"]) & (kindergarten_distance["far"] & school_distance["far"]), family_friendly["low"]),
            ctrl.Rule(
                (total_rooms["many"] & total_area["small"])
                & ((kindergarten_distance["medium"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                (total_rooms["many"] & total_area["small"])
                & ((kindergarten_distance["close"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["close"])),
                family_friendly["medium"],
            ),
            ctrl.Rule((total_rooms["few"] & total_area["medium"]) & (kindergarten_distance["close"] & school_distance["close"]), family_friendly["medium"]),
            ctrl.Rule((total_rooms["few"] & total_area["medium"]) & (kindergarten_distance["far"] & school_distance["far"]), family_friendly["low"]),
            ctrl.Rule(
                (total_rooms["few"] & total_area["medium"])
                & ((kindergarten_distance["close"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["close"])),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                (total_rooms["few"] & total_area["medium"])
                & ((kindergarten_distance["medium"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["medium"])),
                family_friendly["low"],
            ),
            ctrl.Rule(
                (total_rooms["few"] & total_area["medium"])
                & ((kindergarten_distance["medium"] & school_distance["close"]) | (kindergarten_distance["close"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            ctrl.Rule((total_rooms["enough"] & total_area["small"]) & (kindergarten_distance["close"] & school_distance["close"]), family_friendly["medium"]),
            ctrl.Rule((total_rooms["enough"] & total_area["small"]) & (kindergarten_distance["far"] & school_distance["far"]), family_friendly["low"]),
            ctrl.Rule(
                (total_rooms["enough"] & total_area["small"])
                & ((kindergarten_distance["close"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["close"])),
                family_friendly["medium"],
            ),
            ctrl.Rule(
                (total_rooms["enough"] & total_area["small"])
                & ((kindergarten_distance["medium"] & school_distance["far"]) | (kindergarten_distance["far"] & school_distance["medium"])),
                family_friendly["low"],
            ),
            ctrl.Rule(
                (total_rooms["enough"] & total_area["small"])
                & ((kindergarten_distance["medium"] & school_distance["close"]) | (kindergarten_distance["close"] & school_distance["medium"])),
                family_friendly["medium"],
            ),
            # НОВЫЕ ПРАВИЛА - компенсирующие условия
            # Компенсация площади близостью к объектам
            ctrl.Rule(
                (total_area["small"] | total_rooms["few"]) & (kindergarten_distance["close"] & school_distance["close"]),
                family_friendly["medium"],
            ),
            # Компенсация удаленности хорошей планировкой
            ctrl.Rule(
                (total_area["large"] & total_rooms["many"]) & (kindergarten_distance["far"] | school_distance["far"]),
                family_friendly["medium"],
            ),
            # Пограничные случаи с одним идеальным параметром
            ctrl.Rule(
                (total_area["large"] | total_rooms["many"])
                & (kindergarten_distance["close"] | school_distance["close"])
                & (kindergarten_distance["medium"] | school_distance["medium"]),
                family_friendly["medium"],
            ),
            # Критические случаи - когда все среднее
            ctrl.Rule(
                (total_area["medium"] & total_rooms["enough"]) & (kindergarten_distance["medium"] & school_distance["medium"]),
                family_friendly["medium"],
            ),
            # Идеальная комбинация "золотая середина"
            ctrl.Rule(
                (total_area["medium"] & total_rooms["enough"]) & (kindergarten_distance["close"] & school_distance["close"]),
                family_friendly["high"],
            ),
            # Частичная компенсация
            ctrl.Rule(
                (total_area["small"] & total_rooms["enough"]) & (kindergarten_distance["close"] | school_distance["close"]),
                family_friendly["medium"],
            ),
            # Негативные компенсации
            ctrl.Rule(
                (total_area["large"] | total_rooms["many"]) & (kindergarten_distance["far"] & school_distance["far"]),
                family_friendly["low"],
            ),
        ]

        system = ctrl.ControlSystem(rules)
        return ctrl.ControlSystemSimulation(system)

    def setup_fuzzy_systems(self):
        """Инициализация нечетких систем"""
        self.transport_system = self.create_transport_system()
        self.elderly_system = self.create_elderly_system()
        self.family_friendly = self.create_family_system()

    def get_consequent(self, system) -> ctrl.Consequent:
        """Получение консеквента из системы"""
        return next(iter(system.ctrl.consequents))

    def get_category(self, value: float, consequent: ctrl.Consequent) -> str:
        """Определение категории по значению"""
        terms = ["low", "medium", "high"]
        memberships = {term: fuzz.interp_membership(consequent.universe, consequent[term].mf, value) for term in terms}
        return max(memberships.items(), key=lambda x: x[1])[0]

    def evaluate_transport(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Оценка транспортной доступности"""
        try:
            self.transport_system.input["metro_distance"] = property_data["metro_distance"]
            self.transport_system.input["bus_distance"] = property_data["bus_distance"]
            self.transport_system.input["parking_availability"] = property_data["parking_availability"] or False

            self.transport_system.compute()

            score = self.transport_system.output["transport_access"]
            consequent = self.get_consequent(self.transport_system)
            category = self.get_category(score, consequent)

            return {"score": float(score), "category": category}
        except Exception as e:
            return {"score": None, "category": None, "message": str(e)}

    def evaluate_family(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Оценка пригодности для большой семьи"""
        try:
            self.family_friendly.input["kindergarten_distance"] = property_data["kindergarten_distance"]
            self.family_friendly.input["school_distance"] = property_data["school_distance"]
            self.family_friendly.input["total_rooms"] = property_data["total_rooms"]
            self.family_friendly.input["total_area"] = property_data["total_area"]
            self.family_friendly.compute()

            score = self.family_friendly.output["family_friendly"]
            consequent = self.get_consequent(self.family_friendly)
            category = self.get_category(score, consequent)

            return {"score": float(score), "category": category}
        except Exception as e:
            return {"score": None, "category": None, "message": str(e)}

    def evaluate_elderly(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Оценка пригодности для пожилых"""
        try:
            self.elderly_system.input["hospital_distance"] = property_data["hospital_distance"]
            self.elderly_system.input["pharmacy_distance"] = property_data["pharmacy_distance"]  # Добавлен ввод дистанции до аптеки
            self.elderly_system.input["floor"] = property_data["floor"]
            self.elderly_system.input["elevator_availability"] = property_data["elevator_availability"] or False

            self.elderly_system.compute()

            score = self.elderly_system.output["elderly_friendly"]
            consequent = self.get_consequent(self.elderly_system)
            category = self.get_category(score, consequent)

            return {"score": float(score), "category": category}
        except Exception as e:
            return {"score": None, "category": None, "message": str(e)}
        # TODO Сделать асинхронны

    def evaluate_all(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Оценка всех параметров объекта"""
        return {
            "transport_access": self.evaluate_transport(property_data),
            "elderly_friendly": self.evaluate_elderly(property_data),
            "family_friendly": self.evaluate_family(property_data),
        }


# Тестирование обновленной системы
fuzzy_evaluator = FuzzyEvaluator()

result = fuzzy_evaluator.evaluate_all(
    {
        "metro_distance": 350,
        "bus_distance": 250,
        "parking_availability": False,
        "hospital_distance": 48,
        "pharmacy_distance": 50,  # Добавлена дистанция до аптеки
        "floor": 1,
        "elevator_availability": True,
        "school_distance": 9999,
        "kindergarten_distance": 9999,
        "total_area": 150,
        "total_rooms": 5,
    }
)
print(result)
