import numpy as np
import skfuzzy as fuzz
import matplotlib.pyplot as plt

# Универсум значений: количество комнат
rooms = np.arange(0, 100, 1)

# Функции принадлежности
rooms_few = fuzz.trimf(rooms, [0, 0, 40])
rooms_many = fuzz.trimf(rooms, [30, 60, 75])
rooms_medium = fuzz.trimf(rooms, [60, 100, 100])

mask_few = rooms <= 40
mask_many = (rooms >= 30) & (rooms <= 75)
mask_medium = rooms >= 60

# Визуализация
plt.figure(figsize=(8, 4))
plt.plot(rooms[mask_few], rooms_few[mask_few], label="small", linewidth=2)
plt.plot(rooms[mask_many], rooms_many[mask_many], label="medium", linewidth=2)
plt.plot(rooms[mask_medium], rooms_medium[mask_medium], label="large", linewidth=2)
plt.xlabel("total_area")
plt.ylabel("Membership")
plt.legend()

plt.show()
