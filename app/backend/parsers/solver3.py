import cv2
import numpy as np


def find_objects_and_distance(img1_path, img2_path, threshold=25, search_distance=200):
    """
    Простая функция для поиска объектов и вычисления расстояния между границами
    Возвращает только расстояние по оси X между объектами
    """

    # Загрузка изображений
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)

    if img1 is None or img2 is None:
        print("Ошибка загрузки изображений")
        return None

    # Приведение к одинаковому размеру
    if img1.shape != img2.shape:
        height = min(img1.shape[0], img2.shape[0])
        width = min(img1.shape[1], img2.shape[1])
        img1 = cv2.resize(img1, (width, height))
        img2 = cv2.resize(img2, (width, height))

    # Находим добавленный объект на img1
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    diff = cv2.absdiff(gray1, gray2)
    _, thresh = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)

    # Улучшаем маску
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Находим контуры
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        print("Не найдено различий")
        return None

    # Берем самый большой контур
    added_contour = max(contours, key=cv2.contourArea)
    x_add, y_add, w_add, h_add = cv2.boundingRect(added_contour)

    # Область поиска темно-серого объекта справа
    search_x_start = x_add + w_add
    search_x_end = min(search_x_start + search_distance, img2.shape[1])
    search_y_start = max(0, y_add - 50)
    search_y_end = min(img2.shape[0], y_add + h_add + 50)

    # Извлекаем область поиска
    search_region = img2[search_y_start:search_y_end, search_x_start:search_x_end]

    if search_region.size == 0:
        print("Область поиска пуста")
        return None

    # Ищем темно-серые объекты
    search_gray = cv2.cvtColor(search_region, cv2.COLOR_BGR2GRAY)
    search_hsv = cv2.cvtColor(search_region, cv2.COLOR_BGR2HSV)

    # Создаем маску для темно-серых объектов
    _, dark_mask_gray = cv2.threshold(search_gray, 100, 255, cv2.THRESH_BINARY_INV)
    dark_mask_hsv = cv2.inRange(search_hsv, np.array([0, 0, 0]), np.array([180, 50, 180]))
    dark_mask = cv2.bitwise_and(dark_mask_gray, dark_mask_hsv)

    # Находим контуры темно-серых объектов
    dark_contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not dark_contours:
        print("Не найдено темно-серых объектов")
        return None

    # Берем самый большой темно-серый объект
    dark_contour = max(dark_contours, key=cv2.contourArea)
    x_rel, y_rel, w_rel, h_rel = cv2.boundingRect(dark_contour)

    # Абсолютные координаты
    x_dark = search_x_start + x_rel
    y_dark = search_y_start + y_rel

    # ВЫЧИСЛЯЕМ РАССТОЯНИЕ МЕЖДУ ГРАНИЦАМИ
    right_added = x_add + w_add  # Правая граница добавленного объекта
    left_dark = x_dark  # Левая граница темно-серого объекта

    distance = left_dark - right_added  # Расстояние между границами

    # Простой вывод результата
    print("\n" + "=" * 40)
    print("РАССТОЯНИЕ МЕЖДУ ОБЪЕКТАМИ:")
    print("=" * 40)
    print(f"Добавленный объект:")
    print(f"  Позиция: ({x_add}, {y_add})")
    print(f"  Размер: {w_add} x {h_add}")
    print(f"  Правая граница: {right_added}")

    print(f"\nТемно-серый объект:")
    print(f"  Позиция: ({x_dark}, {y_dark})")
    print(f"  Размер: {w_rel} x {h_rel}")
    print(f"  Левая граница: {left_dark}")

    print(f"\nРАССТОЯНИЕ ПО ОСИ X:")
    print(f"  От правой границы добавленного")
    print(f"  до левой границы темно-серого:")

    if distance > 0:
        print(f"  → {distance} пикселей (разделены)")
    elif distance < 0:
        print(f"  → {abs(distance)} пикселей (перекрываются)")
    else:
        print(f"  → 0 пикселей (касаются)")

    print("=" * 40)

    return distance


# САМАЯ ПРОСТАЯ ВЕРСИЯ - только расстояние
def get_simple_distance(img1_path, img2_path):
    """Минимальная функция - возвращает только расстояние"""
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)

    if img1 is None or img2 is None:
        return None

    # Приводим к одному размеру
    if img1.shape != img2.shape:
        h = min(img1.shape[0], img2.shape[0])
        w = min(img1.shape[1], img2.shape[1])
        img1 = cv2.resize(img1, (w, h))
        img2 = cv2.resize(img2, (w, h))

    # Находим разницу
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(gray1, gray2)

    # Бинаризация
    _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)

    # Находим контуры
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        # Самый большой контур - добавленный объект
        cnt = max(contours, key=cv2.contourArea)
        x1, y1, w1, h1 = cv2.boundingRect(cnt)

        # Ищем темно-серый объект справа
        search_area = img2[y1 : y1 + h1, x1 + w1 : x1 + w1 + 300]  # 300px справа

        if search_area.size > 0:
            # Ищем темные области
            gray_area = cv2.cvtColor(search_area, cv2.COLOR_BGR2GRAY)
            _, dark_mask = cv2.threshold(gray_area, 100, 255, cv2.THRESH_BINARY_INV)

            dark_contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            if dark_contours:
                # Самый большой темный контур
                dark_cnt = max(dark_contours, key=cv2.contourArea)
                x2_rel, y2_rel, w2, h2 = cv2.boundingRect(dark_cnt)

                # Вычисляем расстояние
                right1 = x1 + w1  # Правая граница первого
                left2 = x1 + w1 + x2_rel  # Левая граница второго

                distance = left2 - right1 + 58

                print(f"Расстояние между границами: {distance}px")
                return distance

    return None


# Пример использования
if __name__ == "__main__":
    img1_path = "background_with_puzzle1.png"
    img2_path = "background1.png"

    sas = find_objects_and_distance(img1_path, img2_path)

    # Простой вариант
    distance = get_simple_distance(img1_path, img2_path)

    if distance is not None:
        print(f"\nИтоговое расстояние: {distance} пикселей")

        # Интерпретация результата
        if distance > 0:
            print(f"Объекты разделены {distance} пикселями")
        elif distance < 0:
            print(f"Объекты перекрываются на {abs(distance)} пикселей")
        else:
            print("Объекты касаются друг друга")
