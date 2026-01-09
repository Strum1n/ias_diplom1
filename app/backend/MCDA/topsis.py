import numpy as np


def topsis(X: np.ndarray, weights: np.ndarray, criteria: np.ndarray):
    """
    :param X: Матрица решений (альтернативы × критерии)
    :param weights: Веса критериев (сумма должна быть 1)
    :param criteria: Булев массив: True — максимум (benefit), False — минимум (cost)
    """
    # Шаг 1: нормировка
    norm_den = np.sqrt((X**2).sum(axis=0))
    R = X / norm_den

    # Шаг 2: взвешивание
    V = R * weights

    # Шаг 3: идеальное и антиидеальное решения
    ideal = np.where(~criteria, V.min(axis=0), V.max(axis=0))
    anti_ideal = np.where(~criteria, V.max(axis=0), V.min(axis=0))

    # Шаг 4: расстояния
    dist_to_ideal = np.sqrt(((V - ideal) ** 2).sum(axis=1))
    dist_to_anti = np.sqrt(((V - anti_ideal) ** 2).sum(axis=1))

    # Шаг 5: итоговые оценки
    scores = dist_to_anti / (dist_to_ideal + dist_to_anti)
    ranked_indices = np.argsort(-scores)

    return scores, ranked_indices


# ====== Пример использования ======

if __name__ == "__main__":
    # Матрица решений (альтернативы × критерии)
    X = np.array(
        [
            [1.8, 70, 5],
            [1.7, 40, 10],
            [1.6, 90, 20],
            [1.5, 50, 35],
            [1.3, 60, 50],
        ],
        dtype=float,
    )

    # Веса критериев: цена (0.4), расход (0.3), мощность (0.3)
    w = np.array([3, 2, 1])

    # Критерии: цена (cost), расход (cost), мощность (benefit)
    is_min = np.array([False, False, False])

    scores, ranking = topsis(X, w, is_min)

    # Выведем результат
    print("Близости к идеалу:", np.round(scores, 4))
    print("Порядок альтернатив:", ranking)
    # ranking = [2, 0, 1] означает: C, A, B
