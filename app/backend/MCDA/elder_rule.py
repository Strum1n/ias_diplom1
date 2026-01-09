import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt
from ckmeans_1d_dp import ckmeans

# Создание антецедентов (входных переменных)
hospital_distance = ctrl.Antecedent(np.arange(0, 3000, 1), 'hospital_distance')  # в метрах
floor = ctrl.Antecedent(np.arange(1, 21, 1), 'floor')  # этаж (1-20)
elevator = ctrl.Antecedent(np.arange(0, 2, 1), 'elevator')  # 0 - нет лифта, 1 - есть лифт

# Создание консеквента (выходной переменной)
elderly_friendly = ctrl.Consequent(np.arange(0, 11, 1), 'elderly_friendly')

# Задаем функции принадлежности для расстояния до больницы
hospital_distance['close'] = fuzz.trimf(hospital_distance.universe, [0, 0, 1000])  # близко: 0-1000 м
hospital_distance['medium'] = fuzz.trimf(hospital_distance.universe, [500, 1500, 2500])  # средне: 1000-2000 м
hospital_distance['far'] = fuzz.trimf(hospital_distance.universe, [2000, 3000, 3000])  # далеко: 2000+ м

# Задаем функции принадлежности для этажа
floor['low'] = fuzz.trimf(floor.universe, [1, 1, 3])  # низкий: 1-3 этаж
floor['medium'] = fuzz.trimf(floor.universe, [2, 5, 8])  # средний: 3-7 этаж
floor['high'] = fuzz.trimf(floor.universe, [5, 20, 20])  # высокий: 5+ этаж

# Задаем функции принадлежности для лифта (четкое множество)
elevator['no'] = fuzz.trimf(elevator.universe, [0, 0, 0.5])
elevator['yes'] = fuzz.trimf(elevator.universe, [0.5, 1, 1])

# Задаем функции принадлежности для подходящести для пожилых
elderly_friendly['poor'] = fuzz.trimf(elderly_friendly.universe, [0, 0, 5])
elderly_friendly['average'] = fuzz.trimf(elderly_friendly.universe, [0, 5, 10])
elderly_friendly['good'] = fuzz.trimf(elderly_friendly.universe, [5, 10, 10])

# Визуализация функций принадлежности
hospital_distance.view()
floor.view()
elevator.view()
elderly_friendly.view()
plt.show()

# Создание правил для подходящести для пожилых
elderly_rules = [
    # Близко к больнице, низкий этаж, есть лифт - идеально
    ctrl.Rule(hospital_distance['close'] & floor['low'] & elevator['yes'], elderly_friendly['good']),
    
    # Близко к больнице, низкий этаж, нет лифта - все равно хорошо (лифт не нужен)
    ctrl.Rule(hospital_distance['close'] & floor['low'] & elevator['no'], elderly_friendly['good']),
    
    # Близко к больнице, средний этаж, есть лифт - хорошо
    ctrl.Rule(hospital_distance['close'] & floor['medium'] & elevator['yes'], elderly_friendly['good']),
    
    # Близко к больнице, средний этаж, нет лифта - средне
    ctrl.Rule(hospital_distance['close'] & floor['medium'] & elevator['no'], elderly_friendly['average']),
    
    # Близко к больнице, высокий этаж, есть лифт - средне (корректировка: было average, оставляем)
    ctrl.Rule(hospital_distance['close'] & floor['high'] & elevator['yes'], elderly_friendly['average']),
    
    # Близко к больнице, высокий этаж, нет лифта - плохо
    ctrl.Rule(hospital_distance['close'] & floor['high'] & elevator['no'], elderly_friendly['poor']),
    
    # Среднее расстояние до больницы, низкий этаж, есть лифт - хорошо
    ctrl.Rule(hospital_distance['medium'] & floor['low'] & elevator['yes'], elderly_friendly['good']),
    
    # Среднее расстояние до больницы, низкий этаж, нет лифта - средне (лифт не нужен, но больница не близко)
    ctrl.Rule(hospital_distance['medium'] & floor['low'] & elevator['no'], elderly_friendly['average']),
    
    # Среднее расстояние до больницы, средний этаж, есть лифт - средне
    ctrl.Rule(hospital_distance['medium'] & floor['medium'] & elevator['yes'], elderly_friendly['average']),
    
    # Среднее расстояние до больницы, средний этаж, нет лифта - плохо
    ctrl.Rule(hospital_distance['medium'] & floor['medium'] & elevator['no'], elderly_friendly['poor']),
    
    # Среднее расстояние до больницы, высокий этаж, есть лифт - средне (корректировка: было poor, меняем на average)
    ctrl.Rule(hospital_distance['medium'] & floor['high'] & elevator['yes'], elderly_friendly['average']),
    
    # Среднее расстояние до больницы, высокий этаж, нет лифта - очень плохо
    ctrl.Rule(hospital_distance['medium'] & floor['high'] & elevator['no'], elderly_friendly['poor']),
    
    # Далеко от больницы, низкий этаж, есть лифт - средне
    ctrl.Rule(hospital_distance['far'] & floor['low'] & elevator['yes'], elderly_friendly['average']),
    
    # Далеко от больницы, низкий этаж, нет лифта - средне (лифт не нужен, но больница далеко)
    ctrl.Rule(hospital_distance['far'] & floor['low'] & elevator['no'], elderly_friendly['average']),
    
    # Далеко от больницы, средний этаж, есть лифт - плохо
    ctrl.Rule(hospital_distance['far'] & floor['medium'] & elevator['yes'], elderly_friendly['poor']),
    
    # Далеко от больницы, средний этаж, нет лифта - очень плохо
    ctrl.Rule(hospital_distance['far'] & floor['medium'] & elevator['no'], elderly_friendly['poor']),
    
    # Далеко от больницы, высокий этаж, есть лифт - плохо (корректировка: было poor, оставляем)
    ctrl.Rule(hospital_distance['far'] & floor['high'] & elevator['yes'], elderly_friendly['poor']),
    
    # Далеко от больницы, высокий этаж, нет лифта - худший вариант
    ctrl.Rule(hospital_distance['far'] & floor['high'] & elevator['no'], elderly_friendly['poor'])
]

# Создание и запуск системы управления
elderly_ctrl = ctrl.ControlSystem(elderly_rules)
elderly_sim = ctrl.ControlSystemSimulation(elderly_ctrl)

# Функция для определения категории подходящести
def get_elderly_friendly_category(value, consequent):
    poor_membership = fuzz.interp_membership(consequent.universe, consequent['poor'].mf, value)
    average_membership = fuzz.interp_membership(consequent.universe, consequent['average'].mf, value)
    good_membership = fuzz.interp_membership(consequent.universe, consequent['good'].mf, value)
    
    memberships = {
        'poor': poor_membership,
        'average': average_membership,
        'good': good_membership
    }
    return max(memberships.items(), key=lambda x: x[1])[0]

# Пример вычисления подходящести для конкретного случая
elderly_sim.input['hospital_distance'] = 800   # расстояние до больницы в метрах
elderly_sim.input['floor'] = 2                 # этаж
elderly_sim.input['elevator'] = 1              # наличие лифта (0 - нет, 1 - есть)

# Вычисление результата
elderly_sim.compute()

# Вывод результата
numeric_value = elderly_sim.output['elderly_friendly']
print("Численное значение подходящести для пожилых:", numeric_value)
elderly_friendly.view(sim=elderly_sim)
plt.show()
category = get_elderly_friendly_category(numeric_value, elderly_friendly)
print("Категория подходящести для пожилых:", category)