import httpx
import numpy as np
from ckmeans_1d_dp import ckmeans
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt

API_URL = "http://localhost:8000/properties/fuzzy_logic-stats"

with httpx.Client() as client:
    resp = client.get(API_URL)
    resp.raise_for_status()
    sas= resp.json()

def get_transport_access_category(value, consequent):
    """
    Определяет строковую категорию транспортной доступности.
    
    Parameters:
        value (float): Численное значение доступности (0-10).
        consequent (skfuzzy.Consequent): Объект консеквента.
    
    Returns:
        str: Название категории ('poor', 'average', 'good').
    """
    # Получаем степени принадлежности к каждой категории
    poor_membership = fuzz.interp_membership(consequent.universe, consequent['poor'].mf, value)
    average_membership = fuzz.interp_membership(consequent.universe, consequent['average'].mf, value)
    good_membership = fuzz.interp_membership(consequent.universe, consequent['good'].mf, value)
    
    # Выбираем категорию с наибольшей степенью принадлежности
    memberships = {
        'poor': poor_membership,
        'average': average_membership,
        'good': good_membership
    }
    return max(memberships.items(), key=lambda x: x[1])[0]

# Пример данных
metro_distances = np.array(sas['metro_distance'])  # в метрах
bus_distances = np.array(sas['bus_distance'])       # в метрах
parking = np.array([True, False, True, True, False, True, False, True, False, True])  # наличие парковки

# Кластеризация расстояния до метро с помощью ckmeans_1d_dp
k_metro = 3  # количество кластеров
result_metro = ckmeans(metro_distances, k_metro)
centers_metro = np.array([np.mean(cluster) for cluster in result_metro.centers])
centers_metro = np.sort(centers_metro)

# Кластеризация расстояния до автобусных остановок с помощью ckmeans_1d_dp
k_bus = 3  # количество кластеров
result_bus = ckmeans(bus_distances, k_bus)
centers_bus = np.array([np.mean(cluster) for cluster in result_bus.centers])
centers_bus = np.sort(centers_bus)

print("1-d")
print("Центры кластеров для метро:", centers_metro)
print("Центры кластеров для автобусов:", centers_bus)

# Создание антецедентов (входных переменных)
metro = ctrl.Antecedent(np.arange(0, metro_distances.max(), 1), 'metro')
bus = ctrl.Antecedent(np.arange(0, 1000, 1), 'bus')
parking_available = ctrl.Antecedent(np.arange(0, 2, 1), 'parking')  # 0 - False, 1 - True

# Создание консеквента (выходной переменной)
transport_access = ctrl.Consequent(np.arange(0, 11, 1), 'transport_access')

# Задаем функции принадлежности для метро
metro['close'] = fuzz.trimf(metro.universe, [0, 0, (centers_metro[0] + centers_metro[1])/2])
metro['medium'] = fuzz.trimf(metro.universe, [centers_metro[0], centers_metro[1], centers_metro[2]])
metro['far'] = fuzz.trimf(metro.universe, [(centers_metro[1] + centers_metro[2])/2, metro_distances.max(), metro_distances.max()])

# Задаем функции принадлежности для автобусных остановок
bus['close'] = fuzz.trimf(bus.universe, [0, 0, (centers_bus[0] + centers_bus[1])/2])
bus['medium'] = fuzz.trimf(bus.universe, [centers_bus[0], centers_bus[1], centers_bus[2]])
bus['far'] = fuzz.trimf(bus.universe, [(centers_bus[1] + centers_bus[2])/2, bus_distances.max(), bus_distances.max()])

# Задаем функции принадлежности для парковки (четкое множество)
parking_available['no'] = fuzz.trimf(parking_available.universe, [0, 0, 1])
parking_available['yes'] = fuzz.trimf(parking_available.universe, [0, 1, 1])

# Задаем функции принадлежности для транспортной доступности
transport_access['poor'] = fuzz.trimf(transport_access.universe, [0, 0, 5])
transport_access['average'] = fuzz.trimf(transport_access.universe, [0, 5, 10])
transport_access['good'] = fuzz.trimf(transport_access.universe, [5, 10, 10])

# Визуализация функций принадлежности
metro.view()
bus.view()
# parking_available.view()
# transport_access.view()
# plt.show()

# Создание правил
rules = [
    ctrl.Rule(metro['close'] & bus['close'] & parking_available['yes'], transport_access['good']),
    ctrl.Rule(metro['close'] & bus['close'] & parking_available['no'], transport_access['good']),
    ctrl.Rule(metro['close'] & bus['medium'] & parking_available['yes'], transport_access['good']),
    ctrl.Rule(metro['close'] & bus['medium'] & parking_available['no'], transport_access['average']),
    ctrl.Rule(metro['close'] & bus['far'] & parking_available['yes'], transport_access['average']),
    ctrl.Rule(metro['close'] & bus['far'] & parking_available['no'], transport_access['average']),
    ctrl.Rule(metro['medium'] & bus['close'] & parking_available['yes'], transport_access['good']),
    ctrl.Rule(metro['medium'] & bus['close'] & parking_available['no'], transport_access['average']),
    ctrl.Rule(metro['medium'] & bus['medium'] & parking_available['yes'], transport_access['average']),
    ctrl.Rule(metro['medium'] & bus['medium'] & parking_available['no'], transport_access['average']),
    ctrl.Rule(metro['medium'] & bus['far'] & parking_available['yes'], transport_access['average']),
    ctrl.Rule(metro['medium'] & bus['far'] & parking_available['no'], transport_access['poor']),
    ctrl.Rule(metro['far'] & bus['close'] & parking_available['yes'], transport_access['average']),
    ctrl.Rule(metro['far'] & bus['close'] & parking_available['no'], transport_access['average']),
    ctrl.Rule(metro['far'] & bus['medium'] & parking_available['yes'], transport_access['average']),
    ctrl.Rule(metro['far'] & bus['medium'] & parking_available['no'], transport_access['poor']),
    ctrl.Rule(metro['far'] & bus['far'] & parking_available['yes'], transport_access['poor']),
    ctrl.Rule(metro['far'] & bus['far'] & parking_available['no'], transport_access['poor'])
    
]

# Создание и запуск системы управления
transport_ctrl = ctrl.ControlSystem(rules)
transport_access_sim = ctrl.ControlSystemSimulation(transport_ctrl)

# Пример вычисления транспортной доступности
transport_access_sim.input['metro'] = 180   # расстояние до метро в метрах
transport_access_sim.input['bus'] = 900     # расстояние до автобусной остановки в метрах
transport_access_sim.input['parking'] = 1   # наличие парковки (1 - True, 0 - False)

# Вычисление результата
transport_access_sim.compute()

# Вывод результата
numeric_value = transport_access_sim.output['transport_access']
print("Численное значение:", numeric_value)
transport_access.view(sim=transport_access_sim)
plt.show()
category = get_transport_access_category(numeric_value, transport_access)
print("Категория транспортной доступности:", category)