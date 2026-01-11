import cv2
import numpy as np


def get_simple_distance(img1_path, img2_path, debug=False):
    """Минимальная функция - возвращает только расстояние, с опцией дебага"""
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)

    if img1 is None or img2 is None:
        print("Ошибка загрузки изображений")
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
    _, thresh = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Находим контуры
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        print("Не найдено различий между изображениями")
        return None

    # Самый большой контур - добавленный объект
    cnt = max(contours, key=cv2.contourArea)
    x1, y1, w1, h1 = cv2.boundingRect(cnt)
    right1 = x1 + w1  # Правая граница добавленного объекта

    # Сужаем область поиска до узкого прямоугольника, начинающегося из правого верхнего угла найденного объекта
    search_start_x = right1
    search_end_x = min(right1 + 300, img2.shape[1])  # 300px справа

    # Область поиска по высоте равна высоте найденного объекта
    search_start_y = y1
    search_end_y = y1 + h1

    search_area = img2[search_start_y:search_end_y, search_start_x:search_end_x]

    if search_area.size == 0:
        print("Область поиска пуста")
        return None

    # Ищем темные области - динамический порог на основе статистики
    gray_area = cv2.cvtColor(search_area, cv2.COLOR_BGR2GRAY)

    # Вычисляем статистику изображения
    mean_val = np.mean(gray_area)
    std_val = np.std(gray_area)
    median_val = np.median(gray_area)

    # Динамически вычисляем порог на основе статистики
    # Ищем темные области, поэтому порог должен быть ниже среднего/медианы
    # Можно использовать разные стратегии:

    # Стратегия 1: Порог на 1 стандартное отклонение ниже среднего
    # threshold_value = max(0, min(255, int(mean_val - std_val)))

    # Стратегия 2: Порог на 30% ниже медианы (более устойчив к выбросам)
    threshold_value = max(0, min(255, int(median_val * 0.7)))

    # Стратегия 3: Адаптивная бинаризация (лучше для неравномерного освещения)
    # dark_mask = cv2.adaptiveThreshold(gray_area, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    #                                   cv2.THRESH_BINARY_INV, 11, 2)

    # Применяем порог
    _, dark_mask = cv2.threshold(gray_area, threshold_value, 255, cv2.THRESH_BINARY_INV)

    dark_contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not dark_contours:
        # Если не нашли темных объектов, пробуем с более низким порогом
        threshold_value = max(0, min(255, int(median_val * 0.5)))
        _, dark_mask = cv2.threshold(gray_area, threshold_value, 255, cv2.THRESH_BINARY_INV)
        dark_contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not dark_contours:
            print("Не найдено темно-серых объектов в области поиска")
            return None

    # Самый большой темный контур
    dark_cnt = max(dark_contours, key=cv2.contourArea)
    x2_rel, y2_rel, w2, h2 = cv2.boundingRect(dark_cnt)

    # Абсолютные координаты
    x2 = search_start_x + x2_rel
    y2 = search_start_y + y2_rel
    left2 = x2  # Левая граница темного объекта

    # Вычисляем расстояние
    distance = left2 - right1 + 57

    # ДЕБАГ-РЕЖИМ: создаем изображения с разметкой
    if debug:
        # 1. Изображение с добавленным объектом (img1)
        debug_img1 = img1.copy()
        cv2.rectangle(debug_img1, (x1, y1), (x1 + w1, y1 + h1), (0, 255, 0), 3)
        cv2.putText(debug_img1, "Added Object", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # 2. Изображение с областью поиска и найденным отверстием (img2)
        debug_img2 = img2.copy()
        cv2.rectangle(debug_img2, (x1, y1), (x1 + w1, y1 + h1), (255, 255, 0), 2)
        cv2.rectangle(debug_img2, (search_start_x, search_start_y), (search_end_x, search_end_y), (0, 255, 255), 2)
        cv2.rectangle(debug_img2, (x2, y2), (x2 + w2, y2 + h2), (0, 0, 255), 3)

        # Добавляем информацию о динамическом пороге
        stats_text = f"Threshold: {threshold_value} (mean: {mean_val:.1f}, median: {median_val:.1f})"
        cv2.putText(debug_img2, stats_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Рисуем найденное отверстие
        cv2.rectangle(debug_img2, (x2, y2), (x2 + w2, y2 + h2), (0, 0, 255), 3)  # Красный
        cv2.putText(debug_img2, "Hole", (x2, y2 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Рисуем линию между объектами
        mid_y1 = y1 + h1 // 2
        mid_y2 = y2 + h2 // 2
        cv2.line(debug_img2, (right1, mid_y1), (left2, mid_y2), (255, 0, 255), 2)  # Розовая линия

        # Добавляем текст с расстоянием
        distance_text = f"Distance: {distance}px"
        cv2.putText(debug_img2, distance_text, (x1, y1 - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # 3. Изображение с маской разницы
        debug_diff = cv2.cvtColor(diff, cv2.COLOR_GRAY2BGR)
        cv2.rectangle(debug_diff, (x1, y1), (x1 + w1, y1 + h1), (0, 255, 0), 2)

        # 4. Изображение с маской темного объекта
        debug_dark_mask = cv2.cvtColor(dark_mask, cv2.COLOR_GRAY2BGR)
        cv2.rectangle(debug_dark_mask, (x2_rel, y2_rel), (x2_rel + w2, y2_rel + h2), (0, 0, 255), 2)

        # Сохраняем все дебаг-изображения
        cv2.imwrite("debug_added_object.jpg", debug_img1)
        cv2.imwrite("debug_search_result.jpg", debug_img2)
        cv2.imwrite("debug_difference.jpg", debug_diff)
        cv2.imwrite("debug_dark_mask.jpg", debug_dark_mask)

        print("Дебаг-изображения сохранены:")
        print("  - debug_added_object.jpg: зеленый прямоугольник - добавленный объект")
        print("  - debug_search_result.jpg: голубой - добавленный объект, желтый - область поиска, красный - отверстие")
        print("  - debug_difference.jpg: разница между изображениями")
        print("  - debug_dark_mask.jpg: маска для поиска темных объектов")

        # Также показываем изображения (если есть дисплей)
        try:
            cv2.imshow("Added Object", debug_img1)
            cv2.imshow("Search Result", debug_img2)
            cv2.waitKey(999999)  # Показываем 0.5 секунды
            cv2.destroyAllWindows()
        except:
            pass  # Если нет дисплея, просто пропускаем

    print(f"Расстояние между границами: {distance}px")
    return distance


# Пример использования с дебагом
if __name__ == "__main__":
    img1_path = "background_with_puzzle1.png"
    img2_path = "background1.png"

    # Простой вариант без дебага
    distance = get_simple_distance(img1_path, img2_path, debug=False)

    if distance is not None:
        print(f"\nИтоговое расстояние: {distance} пикселей")

        # Интерпретация результата
        if distance > 0:
            print(f"Объекты разделены {distance} пикселями")
        elif distance < 0:
            print(f"Объекты перекрываются на {abs(distance)} пикселей")
        else:
            print("Объекты касаются друг друга")

    # Для отладки можно запустить с параметром debug=True
    print("\n" + "=" * 50)
    print("Запуск в режиме отладки:")
    print("=" * 50)
    distance_debug = get_simple_distance(img1_path, img2_path, debug=True)
    print()
