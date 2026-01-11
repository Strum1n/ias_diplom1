import cv2
import numpy as np
import math


def find_distance_puzzle_to_hole(img_with_puzzle_path, img_with_hole_path):
    """
    Находит расстояние от пазла до отверстия, где пазл всегда слева от отверстия на одной высоте
    """

    # 1. Загружаем изображения
    img_puzzle = cv2.imread(img_with_puzzle_path)  # С пазлом и отверстием
    img_hole = cv2.imread(img_with_hole_path)  # Только с отверстием

    if img_puzzle is None or img_hole is None:
        print("Ошибка загрузки изображений!")
        return None, None, None

    # 2. Находим отверстие на изображении только с отверстием
    gray_hole = cv2.cvtColor(img_hole, cv2.COLOR_BGR2GRAY)

    # Пороговая обработка - отверстие обычно темнее фона
    _, thresh_hole = cv2.threshold(gray_hole, 200, 255, cv2.THRESH_BINARY_INV)

    # Убираем шумы
    kernel = np.ones((3, 3), np.uint8)
    thresh_hole = cv2.morphologyEx(thresh_hole, cv2.MORPH_CLOSE, kernel)
    thresh_hole = cv2.morphologyEx(thresh_hole, cv2.MORPH_OPEN, kernel)

    # Находим контуры отверстия
    contours_hole, _ = cv2.findContours(thresh_hole, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours_hole:
        print("Отверстие не найдено!")
        return None, None, None

    # Берем самый большой контур (это должно быть отверстие)
    hole_contour = max(contours_hole, key=cv2.contourArea)

    # Получаем bounding box отверстия
    x_hole, y_hole, w_hole, h_hole = cv2.boundingRect(hole_contour)

    # Вычисляем центр отверстия
    center_hole_x = x_hole + w_hole // 2
    center_hole_y = y_hole + h_hole // 2
    center_hole = (center_hole_x, center_hole_y)

    # 3. На изображении с пазлом и отверстием находим оба объекта
    gray_puzzle = cv2.cvtColor(img_puzzle, cv2.COLOR_BGR2GRAY)

    # Пороговая обработка
    _, thresh_puzzle = cv2.threshold(gray_puzzle, 127, 255, cv2.THRESH_BINARY_INV)

    # Убираем шумы
    thresh_puzzle = cv2.morphologyEx(thresh_puzzle, cv2.MORPH_CLOSE, kernel)
    thresh_puzzle = cv2.morphologyEx(thresh_puzzle, cv2.MORPH_OPEN, kernel)

    # Находим все контуры
    contours_all, _ = cv2.findContours(thresh_puzzle, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if len(contours_all) < 2:
        print("Не найдено два объекта (пазл и отверстие)!")
        return None, None, None

    # 4. Фильтруем контуры по размеру (примерно как отверстие)
    hole_area = cv2.contourArea(hole_contour)
    similar_contours = []

    for contour in contours_all:
        area = cv2.contourArea(contour)
        # Если площадь похожа на площадь отверстия (в пределах 30%)
        if 0.7 * hole_area < area < 1.3 * hole_area:
            similar_contours.append(contour)

    if len(similar_contours) != 2:
        print(f"Найдено {len(similar_contours)} похожих объектов, ожидалось 2")
        # Возьмем все контуры, отсортированные по площади
        similar_contours = sorted(contours_all, key=cv2.contourArea, reverse=True)[:2]

    # 5. Определяем, какой контур слева (пазл), а какой справа (отверстие)
    # Вычисляем центры bounding box для каждого контура
    contours_with_centers = []

    for contour in similar_contours:
        x, y, w, h = cv2.boundingRect(contour)
        center_x = x + w // 2
        center_y = y + h // 2
        contours_with_centers.append((contour, center_x, center_y))

    # Сортируем по координате X (слева направо)
    contours_with_centers.sort(key=lambda c: c[1])

    # Левый контур - пазл, правый - отверстие
    puzzle_contour, puzzle_center_x, puzzle_center_y = contours_with_centers[0]
    hole_contour_img2, hole_center_x, hole_center_y = contours_with_centers[1]

    center_puzzle = (puzzle_center_x, puzzle_center_y)
    center_hole_img2 = (hole_center_x, hole_center_y)

    # 6. Вычисляем расстояние (горизонтальное, так как они на одной высоте)
    horizontal_distance = hole_center_x - puzzle_center_x

    # 7. Визуализация
    debug_img = img_puzzle.copy()

    # Рисуем контуры
    cv2.drawContours(debug_img, [puzzle_contour], -1, (0, 255, 0), 2)  # Зеленый - пазл
    cv2.drawContours(debug_img, [hole_contour_img2], -1, (0, 0, 255), 2)  # Красный - отверстие

    # Рисуем центры
    cv2.circle(debug_img, center_puzzle, 5, (0, 255, 0), -1)
    cv2.circle(debug_img, center_hole_img2, 5, (0, 0, 255), -1)

    # Рисуем горизонтальную линию на уровне центров
    y_line = (puzzle_center_y + hole_center_y) // 2
    cv2.line(debug_img, (0, y_line), (debug_img.shape[1], y_line), (255, 255, 0), 1)

    # Рисуем линию между центрами
    cv2.line(debug_img, center_puzzle, center_hole_img2, (255, 0, 0), 2)

    # Добавляем текст
    cv2.putText(debug_img, f"Puzzle", (center_puzzle[0] - 30, center_puzzle[1] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    cv2.putText(debug_img, f"Hole", (center_hole_img2[0] - 20, center_hole_img2[1] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv2.putText(debug_img, f"Distance: {horizontal_distance} px", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Показать изображения
    cv2.imshow("Hole Only", img_hole)
    cv2.imshow("Puzzle and Hole", img_puzzle)
    cv2.imshow("Detection Result", debug_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return horizontal_distance, center_puzzle, center_hole_img2


# Альтернативный, более простой метод, если объекты хорошо различимы
def simple_horizontal_distance(img_with_puzzle_path, img_with_hole_path):
    """
    Простой метод для идеальных условий
    """
    # Загружаем изображения
    img_puzzle = cv2.imread(img_with_puzzle_path)
    img_hole = cv2.imread(img_with_hole_path)

    # Преобразуем в градации серого
    gray_puzzle = cv2.cvtColor(img_puzzle, cv2.COLOR_BGR2GRAY)
    gray_hole = cv2.cvtColor(img_hole, cv2.COLOR_BGR2GRAY)

    # Бинаризация
    _, bin_puzzle = cv2.threshold(gray_puzzle, 127, 255, cv2.THRESH_BINARY_INV)
    _, bin_hole = cv2.threshold(gray_hole, 127, 255, cv2.THRESH_BINARY_INV)

    # Находим ненулевые пиксели (объекты)
    puzzle_pixels = cv2.findNonZero(bin_puzzle)
    hole_pixels = cv2.findNonZero(bin_hole)

    if puzzle_pixels is None or hole_pixels is None:
        print("Объекты не найдены!")
        return None, None, None

    # Находим крайние точки
    puzzle_left = np.min(puzzle_pixels[:, 0, 0])
    puzzle_right = np.max(puzzle_pixels[:, 0, 0])
    hole_left = np.min(hole_pixels[:, 0, 0])
    hole_right = np.max(hole_pixels[:, 0, 0])

    # Вычисляем центры по X
    puzzle_center_x = (puzzle_left + puzzle_right) // 2
    hole_center_x = (hole_left + hole_right) // 2

    # Находим среднюю Y-координату для обоих объектов
    puzzle_y = np.mean(puzzle_pixels[:, 0, 1])
    hole_y = np.mean(hole_pixels[:, 0, 1])
    avg_y = int((puzzle_y + hole_y) // 2)

    center_puzzle = (puzzle_center_x, avg_y)
    center_hole = (hole_center_x, avg_y)

    distance = hole_center_x - puzzle_center_x

    # Визуализация
    debug_img = img_puzzle.copy()
    cv2.line(debug_img, (puzzle_center_x, avg_y - 20), (puzzle_center_x, avg_y + 20), (0, 255, 0), 2)
    cv2.line(debug_img, (hole_center_x, avg_y - 20), (hole_center_x, avg_y + 20), (0, 0, 255), 2)
    cv2.line(debug_img, (puzzle_center_x, avg_y), (hole_center_x, avg_y), (255, 0, 0), 2)
    cv2.putText(debug_img, f"Distance: {distance} px", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    cv2.imshow("Simple Method", debug_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return distance, center_puzzle, center_hole


# Метод с использованием горизонтальной проекции (самый надежный для одинаковых объектов на одной линии)
def horizontal_projection_method(img_with_puzzle_path, img_with_hole_path):
    """
    Метод горизонтальной проекции - находит объекты по сумме пикселей по строкам
    """
    # Загружаем изображение с пазлом и отверстием
    img = cv2.imread(img_with_puzzle_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Бинаризация
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

    # Сумма пикселей по столбцам (проекция на горизонтальную ось)
    col_sum = np.sum(binary // 255, axis=0)

    # Находим области, где сумма больше порога (там есть объекты)
    threshold = np.max(col_sum) * 0.3  # Порог 30% от максимума
    object_regions = col_sum > threshold

    # Находим границы объектов
    edges = np.where(np.diff(object_regions.astype(int)) != 0)[0]

    if len(edges) < 4:
        print("Не удалось найти два объекта!")
        return None, None, None

    # Должно быть 4 границы: начало 1 объекта, конец 1 объекта, начало 2 объекта, конец 2 объекта
    # Так как пазл слева, отверстие справа
    puzzle_start = edges[0]
    puzzle_end = edges[1]
    hole_start = edges[2]
    hole_end = edges[3]

    # Вычисляем центры
    puzzle_center_x = (puzzle_start + puzzle_end) // 2
    hole_center_x = (hole_start + hole_end) // 2

    # Находим среднюю высоту объектов (по вертикальной проекции в области объектов)
    puzzle_region = binary[:, puzzle_start:puzzle_end]
    hole_region = binary[:, hole_start:hole_end]

    row_sum_puzzle = np.sum(puzzle_region // 255, axis=1)
    row_sum_hole = np.sum(hole_region // 255, axis=1)

    puzzle_center_y = np.argmax(row_sum_puzzle)
    hole_center_y = np.argmax(row_sum_hole)
    avg_y = (puzzle_center_y + hole_center_y) // 2

    center_puzzle = (puzzle_center_x, avg_y)
    center_hole = (hole_center_x, avg_y)
    distance = hole_center_x - puzzle_center_x

    # Визуализация
    debug_img = img.copy()
    cv2.line(debug_img, (puzzle_center_x, 0), (puzzle_center_x, img.shape[0]), (0, 255, 0), 1)
    cv2.line(debug_img, (hole_center_x, 0), (hole_center_x, img.shape[0]), (0, 0, 255), 1)
    cv2.line(debug_img, (puzzle_center_x, avg_y), (hole_center_x, avg_y), (255, 0, 0), 2)

    # Рисуем график проекции
    projection_img = np.zeros((200, img.shape[1], 3), dtype=np.uint8)
    normalized_col_sum = (col_sum / np.max(col_sum) * 180).astype(int)
    for i in range(len(normalized_col_sum)):
        cv2.line(projection_img, (i, 200), (i, 200 - normalized_col_sum[i]), (255, 255, 255), 1)

    cv2.imshow("Horizontal Projection", projection_img)
    cv2.putText(debug_img, f"Distance: {distance} px", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.imshow("Projection Method", debug_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return distance, center_puzzle, center_hole


# Пример использования
if __name__ == "__main__":
    # Укажите пути к вашим изображениям
    img_puzzle_path = "background_with_puzzle1.png"  # Изображение с пазлом и отверстием
    img_hole_path = "background1.png"  # Изображение только с отверстием

    print("=== Метод 1: Контуры и сортировка по X ===")
    distance1, puzzle1, hole1 = find_distance_puzzle_to_hole(img_puzzle_path, img_hole_path)
    if distance1 is not None:
        print(f"Горизонтальное расстояние: {distance1} пикселей")
        print(f"Центр пазла: {puzzle1}")
        print(f"Центр отверстия: {hole1}")

    print("\n=== Метод 2: Простой метод (для идеальных условий) ===")
    distance2, puzzle2, hole2 = simple_horizontal_distance(img_puzzle_path, img_hole_path)
    if distance2 is not None:
        print(f"Горизонтальное расстояние: {distance2} пикселей")
        print(f"Центр пазла: {puzzle2}")
        print(f"Центр отверстия: {hole2}")

    print("\n=== Метод 3: Горизонтальная проекция (самый надежный) ===")
    distance3, puzzle3, hole3 = horizontal_projection_method(img_puzzle_path, img_hole_path)
    if distance3 is not None:
        print(f"Горизонтальное расстояние: {distance3} пикселей")
        print(f"Центр пазла: {puzzle3}")
        print(f"Центр отверстия: {hole3}")

    # Выбор наилучшего результата
    distances = [d for d in [distance1, distance2, distance3] if d is not None]
    if distances:
        print(f"\nСреднее расстояние: {np.mean(distances):.2f} пикселей")
