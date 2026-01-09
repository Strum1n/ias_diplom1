import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt
from ckmeans_1d_dp import ckmeans

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
metro_distances = np.array([100, 150, 400, 700, 900, 200, 1500, 100, 1400, 1200])  # в метрах
bus_distances = np.array([50, 200, 300, 100, 600, 150, 800, 70, 1000, 500])       # в метрах
parking = np.array([True, False, True, True, False, True, False, True, False, True])  # наличие парковки


# Создание антецедентов (входных переменных)
metro = ctrl.Antecedent(np.arange(0, 1500, 1), 'metro')
bus = ctrl.Antecedent(np.arange(0, 1000, 1), 'bus')
parking_available = ctrl.Antecedent(np.arange(0, 2, 1), 'parking')  # 0 - False, 1 - True

# Создание консеквента (выходной переменной)
transport_access = ctrl.Consequent(np.arange(0, 11, 1), 'transport_access')

# Задаем функции принадлежности для метро
metro['close'] = fuzz.trimf(metro.universe, [0, 0, 300])  # близко: 0–300 м
metro['medium'] = fuzz.trimf(metro.universe, [150, 600, 1000])  # средне: 300–800 м
metro['far'] = fuzz.trimf(metro.universe, [500, 1500, 1500])  # далеко: 800+ м

# Задаем функции принадлежности для автобусных остановок
bus['close'] = fuzz.trimf(bus.universe, [0, 0, 150])  # близко: 0–150 м
bus['medium'] = fuzz.trimf(bus.universe, [0, 150, 400])  # средне: 150–400 м
bus['far'] = fuzz.trimf(bus.universe, [150, 400, 1000])  # далеко: 400+ м

# Задаем функции принадлежности для парковки (четкое множество)
parking_available['no'] = fuzz.trimf(parking_available.universe, [0, 0, 0.5])
parking_available['yes'] = fuzz.trimf(parking_available.universe, [0.5, 1, 1])

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

# Пример вычисления транспортной доступности для конкретного случая
transport_access_sim.input['metro'] = 50   # расстояние до метро в метрах
transport_access_sim.input['bus'] = 50     # расстояние до автобусной остановки в метрах
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
