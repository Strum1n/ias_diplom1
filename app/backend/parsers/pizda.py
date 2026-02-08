import numpy as np
import skfuzzy as fuzz
import matplotlib.pyplot as plt

# Универсум значений: количество комнат
rooms = np.arange(0, 6, 1)

# Функции принадлежности
rooms_few = fuzz.trimf(rooms, [0, 0, 4])
rooms_many = fuzz.trimf(rooms, [1, 5, 5])

mask_few = rooms <= 4  # исключаем 3-4
mask_many = rooms >= 1  # исключаем 0-3

# Визуализация
plt.figure(figsize=(8, 4))
plt.plot(rooms[mask_few], rooms_few[mask_few], label="few", linewidth=2)
plt.plot(rooms[mask_many], rooms_many[mask_many], label="many", linewidth=2)

plt.xlabel("total_rooms")
plt.ylabel("Membership")
plt.legend()

plt.show()
