import cv2
import numpy as np


def find_dark_holes_any_shape(image_path_or_array, region=None, expected_size=60, size_tolerance=20, debug=False):
    """
    Находит темные отверстия любой формы на изображении.

    :param image_path_or_array: путь к изображению или numpy array
    :param region: (x, y, w, h) — если известно, где примерно находится отверстие
    :param expected_size: примерный размер отверстия (в пикселях)
    :param size_tolerance: допустимое отклонение размера
    :param debug: если True — показываем изображение с контурами
    :return: список кортежей (x, y, w, h) для каждого найденного отверстия
    """
    # Загружаем изображение
    if isinstance(image_path_or_array, str):
        img = cv2.imread(image_path_or_array)
    else:
        img = image_path_or_array.copy()

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Опционально вырезаем интересующий регион
    if region is not None:
        x, y, w, h = region
        gray_region = blur[y : y + h, x : x + w]
    else:
        gray_region = blur
        x = y = 0  # чтобы потом координаты были относительно оригинала

    # Порог для темных областей
    _, thresh = cv2.threshold(gray_region, 50, 255, cv2.THRESH_BINARY_INV)

    # Находим контуры
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    results = []
    for cnt in contours:
        x1, y1, w1, h1 = cv2.boundingRect(cnt)
        # фильтр по размеру (ориентируемся на expected_size)
        if expected_size - size_tolerance <= w1 <= expected_size + size_tolerance and expected_size - size_tolerance <= h1 <= expected_size + size_tolerance:
            # смещаем координаты, если была обрезка региона
            results.append((x + x1, y + y1, w1, h1))
            if debug:
                cv2.rectangle(img, (x + x1, y + y1), (x + x1 + w1, y + y1 + h1), (0, 255, 0), 2)

    if debug:
        cv2.imshow("Detected Holes", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    return results


# Пример использования
region = (100, 100, 200, 200)  # примерный квадрат, где находится отверстие
holes = find_dark_holes_any_shape("background.png", region=region, debug=True)
print("Найденные отверстия:", holes)
