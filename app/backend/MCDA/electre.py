import numpy as np


def electre(evaluations, weights, is_min, alpha_init=0.9, beta_init=0.1, step=0.01, verbose=True):
    m, n = evaluations.shape
    evaluations = evaluations.astype(float).copy()
    weights = np.array(weights, dtype=float)

    # Инверсия минимизируемых критериев
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

    c = np.zeros((m, m))
    d = np.zeros((m, m))
    dominance_info = {}

    # Вычисляем матрицы c и d и подробную информацию о сравнении всех альтернатив
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
                d[i, k] = np.round(max((evaluations[k, j] - evaluations[i, j]) / L[j] for j in inferior if L[j] != 0), 2)
            else:
                d[i, k] = 0.0

            dominance_info[i][k] = {
                "superior": superior,
                "equal": equal,
                "inferior": inferior,
            }

    alpha = alpha_init
    beta = beta_init

    best_kernel = None
    final_outranking = None
    log = []
    step_id = 0

    # Основной цикл поиска ядра
    while alpha <= 1.0 and beta >= 0.0:
        step_id += 1
        outranking = (c >= alpha) & (d <= beta)

        kernel = [i for i in range(m) if not any(outranking[k, i] for k in range(m) if k != i)]

        log_entry = {
            "step": step_id,
            "alpha": round(alpha, 3),
            "beta": round(beta, 3),
            "kernel_size": len(kernel),
            "kernel": kernel,
        }
        log.append(log_entry)

        if verbose:
            print(f"[Шаг {step_id:02d}] α = {log_entry['alpha']:.2f}, β = {log_entry['beta']:.2f} → |ядро| = {log_entry['kernel_size']} {kernel}")

        if len(kernel) == 1:
            if verbose:
                print("Найдено одноэлементное ядро")
            best_kernel = kernel
            final_outranking = outranking
            break

        if best_kernel is None or len(kernel) < len(best_kernel):
            best_kernel = kernel
            final_outranking = outranking

        alpha += step
        beta -= step

    if verbose and len(best_kernel) != 1:
        print("Одноэлементное ядро не найдено")

    # Фильтруем dominance_info только по альтернативам из ядра
    filtered_dominance = {}
    if best_kernel is not None:
        for i in best_kernel:
            filtered_dominance[i] = {k: dominance_info[i][k] for k in range(m) if k != i}

    return best_kernel, filtered_dominance, final_outranking


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

    weights = [1, 2, 3]
    is_min = [False, True, True]

    kernel, dominance, outranking = electre(
        evaluations,
        weights,
        is_min,
        alpha_init=0.1,
        beta_init=0.9,
        step=0.01,
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
