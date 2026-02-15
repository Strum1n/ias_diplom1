import numpy as np


def electre(evaluations, weights, is_min, alpha_init=0.9, beta_init=0.1, verbose=True):
    """
    Реализация метода ELECTRE I с фиксированными порогами alpha и beta.

    Параметры:
    - evaluations: матрица оценок альтернатив по критериям (m x n)
    - weights: веса критериев (длина n)
    - is_min: булев массив, True если критерий минимизируется
    - alpha: порог согласия (по умолчанию 0.9)
    - beta: порог несогласия (по умолчанию 0.1)
    - verbose: печатать ли результат

    Возвращает:
    - kernel: список индексов альтернатив, образующих ядро
    - dominance_info: словарь с деталями сравнения для каждой пары
    - outranking: булева матрица превосходства (m x m)
    """
    m, n = evaluations.shape
    evaluations = evaluations.astype(float).copy()
    weights = np.array(weights, dtype=float)

    # Инверсия минимизируемых критериев (чтобы везде "больше = лучше")
    for j in range(n):
        if is_min[j]:
            evaluations[:, j] = -evaluations[:, j]

    # Нормализация (евклидова)
    normalized = np.zeros_like(evaluations, dtype=float)
    for j in range(n):
        norm = np.sqrt(np.sum(evaluations[:, j] ** 2))
        if norm != 0:
            normalized[:, j] = evaluations[:, j] / norm

    weighted = normalized * weights
    total_weight = np.sum(weights)

    # Диапазон для формулы несогласия
    L = np.max(evaluations, axis=0) - np.min(evaluations, axis=0)

    # Матрицы согласия (c) и несогласия (d)
    c = np.zeros((m, m))
    d = np.zeros((m, m))
    dominance_info = {}

    for i in range(m):
        dominance_info[i] = {}
        for k in range(m):
            if i == k:
                continue

            superior = []
            equal = []
            inferior = []

            for j in range(n):
                if evaluations[i, j] > evaluations[k, j]:
                    superior.append(j)
                elif evaluations[i, j] == evaluations[k, j]:
                    equal.append(j)
                else:
                    inferior.append(j)

            c[i, k] = np.round(sum(weights[j] for j in superior + equal) / total_weight, 2)

            if inferior:
                # максимум относительной разницы по критериям, где i уступает k
                d[i, k] = np.round(max((evaluations[k, j] - evaluations[i, j]) / L[j] for j in inferior if L[j] != 0), 2)
            else:
                d[i, k] = 0.0

            dominance_info[i][k] = {
                "superior": superior,
                "equal": equal,
                "inferior": inferior,
            }

    # Построение отношения превосходства при заданных порогах
    outranking = (c >= alpha_init) & (d <= beta_init)

    # Поиск ядра: альтернативы, которые не превосходятся никакой другой
    kernel = [i for i in range(m) if not any(outranking[k, i] for k in range(m) if k != i)]

    if verbose:
        print(f"Пороги: α = {alpha_init}, β = {beta_init}")
        print(f"Ядро: {kernel} (размер {len(kernel)})")

    # Фильтруем dominance_info только для альтернатив из ядра (опционально)
    filtered_dominance = {}
    for i in kernel:
        filtered_dominance[i] = {k: dominance_info[i][k] for k in range(m) if k != i}
    print(f"Равны: {filtered_dominance}")
    return kernel, filtered_dominance, outranking


if __name__ == "__main__":
    evaluations = np.array(
        [
            [1.8, 70, 5],
            [1.7, 40, 10],
            [1.6, 90, 20],
            [1.5, 50, 35],
            [1.3, 60, 50],
        ]
    )

    weights = [3, 2, 1]
    is_min = [True, True, True]

    kernel, dominance, outranking = electre(
        evaluations,
        weights,
        is_min,
        alpha_init=0.8,
        beta_init=0.15,
        verbose=True,
    )

    print("\nИтоговое ядро:", kernel)
    for k in kernel:
        print(f"\nАнализ альтернативы {k} (ядро):")
        for i in range(len(evaluations)):
            if i == k:
                continue
            if outranking[k, i]:
                print(f"  Превосходит {i}:")
                print(f"    - По критериям: {dominance[k][i]['superior']}")
                print(f"    - Равны по критериям: {dominance[k][i]['equal']}")
                print(f"    - Уступает по: {dominance[k][i]['inferior']}")
            else:
                print(f"  Не превосходит {i}:")
                print(f"    - По критериям: {dominance[k][i]['superior']}")
