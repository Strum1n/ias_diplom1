import numpy as np


def electre(evaluations, weights, is_min, alpha_init=0.8, beta_init=0.4, step=0.05):
    m, n = evaluations.shape
    evaluations = evaluations.copy()

    # Нормализация (формулы 3.1 и 3.2)
    normalized = np.zeros_like(evaluations, dtype=float)
    for j in range(n):
        norm = np.sqrt(np.sum(evaluations[:, j] ** 2))
        if is_min[j]:
            min_val = np.min(evaluations[:, j])
            normalized[:, j] = min_val / (evaluations[:, j] * norm)
        else:
            normalized[:, j] = evaluations[:, j] / norm

    # Взвешивание (формула 3.3)
    weighted = normalized * weights

    # Диапазон для несогласия (для формулы 3.5)
    L = np.max(weighted, axis=0) - np.min(weighted, axis=0)
    total_weight = np.sum(weights)

    c = np.zeros((m, m))
    d = np.zeros((m, m))
    dominance_info = {}

    # Матрицы согласия и несогласия (формулы 3.4 и 3.5)
    for i in range(m):
        dominance_info[i] = {}
        for k in range(m):
            if i == k:
                continue

            superior = []
            equal = []
            inferior = []

            for j in range(n):
                if weighted[i, j] > weighted[k, j]:
                    superior.append(j)
                elif weighted[i, j] == weighted[k, j]:
                    equal.append(j)
                else:
                    inferior.append(j)

            c[i, k] = sum(weights[j] for j in superior + equal) / total_weight
            d[i, k] = max((weighted[k, j] - weighted[i, j]) / L[j] for j in inferior) if inferior else 0

            dominance_info[i][k] = {"superior": superior, "equal": equal, "inferior": inferior}

    # Поиск ядра
    kernel = []
    alternative_count = 0
    final_outranking = None

    while len(kernel) == 0:
        alternative_count += 1
        alpha = alpha_init
        beta = beta_init

        while True:
            outranking = (c >= alpha) & (d <= beta)
            kernel = [i for i in range(m) if not any(outranking[k, i] for k in range(m) if k != i)]

            if len(kernel) == alternative_count:
                final_outranking = outranking
                break

            alpha -= step
            beta += step

            if alpha < 0 or beta > 1:
                break

    return kernel, dominance_info, final_outranking


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

    kernel, dominance, outranking = electre(evaluations, weights, is_min)

    print("Ядро оптимальных альтернатив:", kernel)

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
                print(f"    - Уступает по: {dominance[k][i]['inferior']}")
