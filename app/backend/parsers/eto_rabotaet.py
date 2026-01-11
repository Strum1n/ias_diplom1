import cv2
import numpy as np
from matplotlib import pyplot as plt
import math


def find_similar_dark_gray_object(img1_path, img2_path, threshold=25, search_distance=200):
    """
    Находит добавленный объект на img1, затем ищет на img2
    темно-серый объект справа от его позиции

    Параметры:
    img1_path: путь к изображению с новым объектом
    img2_path: путь к изображению без нового объекта
    search_distance: максимальное расстояние для поиска справа (в пикселях)
    """

    # Загрузка изображений
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)

    if img1 is None or img2 is None:
        print("Ошибка: не удалось загрузить изображения")
        return

    # Приведение к одинаковому размеру
    if img1.shape != img2.shape:
        height = min(img1.shape[0], img2.shape[0])
        width = min(img1.shape[1], img2.shape[1])
        img1 = cv2.resize(img1, (width, height))
        img2 = cv2.resize(img2, (width, height))

    # Сохраняем копии для отображения
    img1_display = img1.copy()
    img2_display = img2.copy()

    # Шаг 1: Находим добавленный объект на img1
    print("Шаг 1: Поиск добавленного объекта...")

    # Конвертация в оттенки серого
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # Находим разницу
    diff = cv2.absdiff(gray1, gray2)

    # Бинаризация
    _, thresh = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)

    # Морфологические операции для улучшения
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Находим контуры
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        print("Не найдено различий между изображениями")
        return

    # Находим самый большой контур (предполагаем, что это добавленный объект)
    added_contour = max(contours, key=cv2.contourArea)
    x_add, y_add, w_add, h_add = cv2.boundingRect(added_contour)

    print(f"Добавленный объект найден: x={x_add}, y={y_add}, w={w_add}, h={h_add}")

    # Шаг 2: Определяем область поиска на img2 (справа от найденного объекта)
    print("\nШаг 2: Определение области поиска...")

    # Координаты для поиска на img2
    search_x_start = x_add + w_add  # Начинаем поиск сразу справа от объекта
    search_x_end = min(search_x_start + search_distance, img2.shape[1])
    search_y_start = max(0, y_add - 50)  # Расширяем область поиска по вертикали
    search_y_end = min(img2.shape[0], y_add + h_add + 50)

    print(f"Область поиска: x=[{search_x_start}:{search_x_end}], y=[{search_y_start}:{search_y_end}]")

    # Шаг 3: Ищем темно-серые объекты в области поиска
    print("\nШаг 3: Поиск темно-серых объектов...")

    # Извлекаем область поиска из img2
    search_region = img2[search_y_start:search_y_end, search_x_start:search_x_end]

    if search_region.size == 0:
        print("Область поиска пуста")
        return

    # Конвертируем область поиска в различные цветовые пространства
    search_gray = cv2.cvtColor(search_region, cv2.COLOR_BGR2GRAY)
    search_hsv = cv2.cvtColor(search_region, cv2.COLOR_BGR2HSV)

    # Шаг 3.1: Определяем темно-серые области
    # Темно-серый в HSV: низкая насыщенность, средняя/низкая яркость
    # Темно-серый в Grayscale: низкие значения (0-100 из 255)

    # Метод 1: Поиск по яркости в grayscale
    _, dark_gray_mask_gray = cv2.threshold(search_gray, 100, 255, cv2.THRESH_BINARY_INV)

    # Метод 2: Поиск в HSV пространстве (низкая насыщенность = серые тона)
    # Низкая насыщенность (S < 50), средняя/низкая яркость (V < 180)
    lower_gray = np.array([0, 0, 0])
    upper_gray = np.array([180, 50, 180])
    dark_gray_mask_hsv = cv2.inRange(search_hsv, lower_gray, upper_gray)

    # Объединяем маски
    dark_gray_mask = cv2.bitwise_and(dark_gray_mask_gray, dark_gray_mask_hsv)

    # Улучшаем маску
    dark_gray_mask = cv2.morphologyEx(dark_gray_mask, cv2.MORPH_OPEN, kernel)
    dark_gray_mask = cv2.morphologyEx(dark_gray_mask, cv2.MORPH_CLOSE, kernel)

    # Шаг 4: Находим контуры темно-серых объектов
    dark_contours, _ = cv2.findContours(dark_gray_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not dark_contours:
        print("Не найдено темно-серых объектов в области поиска")

        # Пробуем более широкий поиск темно-серых объектов
        print("Попытка расширенного поиска...")

        # Ищем темно-серые объекты по всему изображению 2
        img2_gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
        img2_hsv = cv2.cvtColor(img2, cv2.COLOR_BGR2HSV)

        # Создаем маску для темно-серых областей по всему изображению
        _, dark_mask_full_gray = cv2.threshold(img2_gray, 100, 255, cv2.THRESH_BINARY_INV)
        dark_mask_full_hsv = cv2.inRange(img2_hsv, lower_gray, upper_gray)
        dark_mask_full = cv2.bitwise_and(dark_mask_full_gray, dark_mask_full_hsv)

        # Находим контуры
        dark_contours_full, _ = cv2.findContours(dark_mask_full, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if dark_contours_full:
            # Фильтруем контуры, которые находятся справа от добавленного объекта
            right_contours = []
            for cnt in dark_contours_full:
                x_cnt, y_cnt, w_cnt, h_cnt = cv2.boundingRect(cnt)
                # Проверяем, что объект справа и не слишком далеко
                if (
                    x_cnt > x_add
                    and abs(y_cnt - y_add) < 100  # Примерно на той же высоте
                    and cv2.contourArea(cnt) > 50
                ):  # Не слишком маленький
                    right_contours.append((cnt, x_cnt, y_cnt, w_cnt, h_cnt))

            if right_contours:
                # Выбираем ближайший объект справа
                right_contours.sort(key=lambda c: c[1])  # Сортируем по X координате
                best_cnt, x_cnt, y_cnt, w_cnt, h_cnt = right_contours[0]
                dark_contours = [best_cnt]
                # Корректируем координаты области поиска
                search_x_start = x_cnt - 50
                search_x_end = x_cnt + w_cnt + 50
                search_y_start = y_cnt - 50
                search_y_end = y_cnt + h_cnt + 50

    if not dark_contours:
        print("Не удалось найти темно-серые объекты")
        return

    # Шаг 5: Выбираем наиболее похожий темно-серый объект
    print(f"\nШаг 4: Найдено {len(dark_contours)} темно-серых объектов")

    # Извлекаем добавленный объект для сравнения
    added_object = img1[y_add : y_add + h_add, x_add : x_add + w_add]
    added_gray = cv2.cvtColor(added_object, cv2.COLOR_BGR2GRAY)

    # Анализируем каждый темно-серый объект
    best_object = None
    best_similarity = 0
    best_x, best_y, best_w, best_h = 0, 0, 0, 0

    for i, contour in enumerate(dark_contours):
        area = cv2.contourArea(contour)
        if area < 50:  # Пропускаем слишком маленькие объекты
            continue

        # Получаем bounding box (в координатах области поиска)
        x_rel, y_rel, w_rel, h_rel = cv2.boundingRect(contour)

        # Преобразуем в абсолютные координаты всего изображения
        x_abs = search_x_start + x_rel
        y_abs = search_y_start + y_rel

        # Извлекаем объект из img2
        dark_object = img2[y_abs : y_abs + h_rel, x_abs : x_abs + w_rel]

        if dark_object.size == 0:
            continue

        # Конвертируем в grayscale
        dark_gray = cv2.cvtColor(dark_object, cv2.COLOR_BGR2GRAY)

        # Вычисляем сходство по нескольким критериям
        similarity = 0

        # Критерий 1: Сходство формы (соотношение сторон)
        aspect_ratio_added = w_add / h_add if h_add > 0 else 1
        aspect_ratio_dark = w_rel / h_rel if h_rel > 0 else 1
        aspect_similarity = 1 - min(abs(aspect_ratio_added - aspect_ratio_dark) / max(aspect_ratio_added, aspect_ratio_dark), 1)

        # Критерий 2: Сходство размера (масштабируем объект для сравнения)
        size_similarity = 0
        try:
            # Масштабируем темно-серый объект к размеру добавленного
            dark_resized = cv2.resize(dark_gray, (w_add, h_add))

            # Вычисляем гистограммы
            hist_added = cv2.calcHist([added_gray], [0], None, [64], [0, 256])
            hist_dark = cv2.calcHist([dark_resized], [0], None, [64], [0, 256])

            # Нормализуем гистограммы
            hist_added = cv2.normalize(hist_added, hist_added).flatten()
            hist_dark = cv2.normalize(hist_dark, hist_dark).flatten()

            # Вычисляем сходство гистограмм (корреляция)
            hist_similarity = cv2.compareHist(hist_added, hist_dark, cv2.HISTCMP_CORREL)
            hist_similarity = max(0, hist_similarity)  # Отрицательные значения = 0

            # Сходство размера
            size_ratio = min(w_add / w_rel, h_add / h_rel) if w_rel > 0 and h_rel > 0 else 0
            size_ratio = min(size_ratio, w_rel / w_add, h_rel / h_add) if w_add > 0 and h_add > 0 else 0
            size_similarity = max(0, 1 - abs(1 - size_ratio))

            # Общая оценка сходства
            similarity = 0.3 * aspect_similarity + 0.4 * hist_similarity + 0.3 * size_similarity

        except:
            similarity = aspect_similarity * 0.5

        print(f"  Объект {i + 1}: x={x_abs}, y={y_abs}, размер={w_rel}x{h_rel}, сходство={similarity:.3f}")

        if similarity > best_similarity:
            best_similarity = similarity
            best_object = dark_object
            best_x, best_y, best_w, best_h = x_abs, y_abs, w_rel, h_rel

    if best_object is None:
        print("Не найден подходящий темно-серый объект")
        return

    print(f"\nЛучший объект найден: x={best_x}, y={best_y}, сходство={best_similarity:.3f}")

    # Шаг 6: Визуализация результатов
    print("\nШаг 5: Визуализация результатов...")

    fig, axes = plt.subplots(2, 3, figsize=(15, 10))

    # 1. Добавленный объект на img1
    cv2.rectangle(img1_display, (x_add, y_add), (x_add + w_add, y_add + h_add), (0, 255, 0), 3)
    cv2.putText(img1_display, "Added Object", (x_add, y_add - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    axes[0, 0].imshow(cv2.cvtColor(img1_display, cv2.COLOR_BGR2RGB))
    axes[0, 0].set_title("Изображение 1\n(с добавленным объектом)")
    axes[0, 0].axis("off")

    # 2. Область поиска на img2
    search_region_display = img2_display.copy()
    cv2.rectangle(search_region_display, (search_x_start, search_y_start), (search_x_end, search_y_end), (255, 0, 0), 2)
    cv2.putText(search_region_display, "Search Area", (search_x_start, search_y_start - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
    axes[0, 1].imshow(cv2.cvtColor(search_region_display, cv2.COLOR_BGR2RGB))
    axes[0, 1].set_title("Изображение 2\n(область поиска)")
    axes[0, 1].axis("off")

    # 3. Маска темно-серых объектов
    axes[0, 2].imshow(dark_gray_mask, cmap="gray")
    axes[0, 2].set_title("Маска темно-серых объектов\nв области поиска")
    axes[0, 2].axis("off")

    # 4. Добавленный объект (увеличенно)
    axes[1, 0].imshow(cv2.cvtColor(added_object, cv2.COLOR_BGR2RGB))
    axes[1, 0].set_title(f"Добавленный объект\n{w_add}x{h_add}")
    axes[1, 0].axis("off")

    # 5. Найденный темно-серый объект (увеличенно)
    axes[1, 1].imshow(cv2.cvtColor(best_object, cv2.COLOR_BGR2RGB))
    axes[1, 1].set_title(f"Найденный темно-серый объект\n{best_w}x{best_h}")
    axes[1, 1].axis("off")

    # 6. Финальный результат с выделением
    final_display = img2_display.copy()

    # Отмечаем найденный объект
    cv2.rectangle(final_display, (best_x, best_y), (best_x + best_w, best_y + best_h), (0, 165, 255), 3)  # Оранжевый
    cv2.putText(final_display, f"Dark Gray Object ({best_similarity:.2f})", (best_x, best_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)

    # Показываем стрелку от добавленного к найденному
    center_added = (x_add + w_add // 2, y_add + h_add // 2)
    center_found = (best_x + best_w // 2, best_y + best_h // 2)

    # Рисуем стрелку
    cv2.arrowedLine(final_display, center_added, center_found, (255, 0, 255), 2, tipLength=0.03)

    axes[1, 2].imshow(cv2.cvtColor(final_display, cv2.COLOR_BGR2RGB))
    axes[1, 2].set_title("Финальный результат\n(объект найден справа)")
    axes[1, 2].axis("off")

    plt.tight_layout()
    plt.show()

    # Дополнительная консольная информация
    print("\n" + "=" * 60)
    print("ИТОГИ ПОИСКА:")
    print("=" * 60)
    print(f"Добавленный объект:")
    print(f"  Позиция: ({x_add}, {y_add})")
    print(f"  Размер: {w_add} x {h_add}")
    print(f"  Площадь: {w_add * h_add} пикселей")

    print(f"\nНайденный темно-серый объект (справа):")
    print(f"  Позиция: ({best_x}, {best_y})")
    print(f"  Размер: {best_w} x {best_h}")
    print(f"  Площадь: {best_w * best_h} пикселей")
    print(f"  Оценка сходства: {best_similarity:.3f}")
    print(f"  Расстояние по X: {best_x - x_add} пикселей")

    # Анализ цветовых характеристик
    print(f"\nАнализ цветов:")

    # Анализ добавленного объекта
    added_hsv = cv2.cvtColor(added_object, cv2.COLOR_BGR2HSV)
    added_mean_gray = np.mean(cv2.cvtColor(added_object, cv2.COLOR_BGR2GRAY))
    added_mean_saturation = np.mean(added_hsv[:, :, 1])

    # Анализ найденного объекта
    best_hsv = cv2.cvtColor(best_object, cv2.COLOR_BGR2HSV)
    best_mean_gray = np.mean(cv2.cvtColor(best_object, cv2.COLOR_BGR2GRAY))
    best_mean_saturation = np.mean(best_hsv[:, :, 1])

    print(f"  Добавленный объект:")
    print(f"    Средняя яркость: {added_mean_gray:.1f}")
    print(f"    Средняя насыщенность: {added_mean_saturation:.1f}")

    print(f"  Найденный объект:")
    print(f"    Средняя яркость: {best_mean_gray:.1f}")
    print(f"    Средняя насыщенность: {best_mean_saturation:.1f}")

    if best_mean_gray < 100:
        print(f"    ✅ Объект действительно темно-серый (яркость < 100)")
    else:
        print(f"    ⚠️  Объект светлее ожидаемого")

    return {
        "added_object": added_object,
        "added_coords": (x_add, y_add, w_add, h_add),
        "found_object": best_object,
        "found_coords": (best_x, best_y, best_w, best_h),
        "similarity_score": best_similarity,
        "search_region": (search_x_start, search_y_start, search_x_end, search_y_end),
        "color_analysis": {
            "added_brightness": added_mean_gray,
            "added_saturation": added_mean_saturation,
            "found_brightness": best_mean_gray,
            "found_saturation": best_mean_saturation,
        },
    }


# Упрощенная версия для поиска только темно-серых объектов
def find_dark_gray_objects_only(img_path, brightness_threshold=100, saturation_threshold=50):
    """
    Находит все темно-серые объекты на изображении
    """
    img = cv2.imread(img_path)
    if img is None:
        return None

    # Конвертация в HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Создаем маску для темно-серых областей
    # Низкая насыщенность + низкая яркость = темно-серый
    mask_saturation = cv2.inRange(hsv[:, :, 1], 0, saturation_threshold)
    mask_brightness = cv2.inRange(gray, 0, brightness_threshold)

    # Объединяем маски
    mask = cv2.bitwise_and(mask_saturation, mask_brightness)

    # Находим контуры
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Фильтруем маленькие контуры
    filtered_contours = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 50:  # Минимальная площадь
            filtered_contours.append(cnt)

    # Визуализация
    result = img.copy()
    for cnt in filtered_contours:
        x, y, w, h = cv2.boundingRect(cnt)
        cv2.rectangle(result, (x, y), (x + w, y + h), (0, 255, 255), 2)

    cv2.imshow("Dark Gray Objects", result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return filtered_contours


# Пример использования
if __name__ == "__main__":
    # Укажите пути к вашим изображениям
    img1_path = "background_with_puzzle1.png"
    img2_path = "background1.png"

    # Основной поиск
    result = find_similar_dark_gray_object(
        img1_path,
        img2_path,
        threshold=30,  # Порог для обнаружения различий
        search_distance=300,  # Максимальное расстояние для поиска справа
    )
    dark_gray_objects = find_dark_gray_objects_only(img2_path)
    if dark_gray_objects:
        print(f"Найдено {len(dark_gray_objects)} темно-серых объектов на изображении 2")
