import numpy as np

def successive_concessions(evaluations, criteria_order, concessions, is_max):
    """
    Реализует метод последовательных уступок для многокритериального принятия решений.

    Параметры:
    - evaluations: 2D массив numpy формы (m, n), где m — количество альтернатив,
                   n — количество критериев. Каждая строка — альтернатива,
                   каждый столбец — критерий.
    - criteria_order: список целых чисел, перестановка [0,1,...,n-1], указывающая порядок
                      критериев от наиболее к наименее важному.
    - concessions: список вещественных чисел длиной n, указывающий уступку для каждого критерия.
    - is_max: список булевых значений длиной n, указывающий, максимизируется ли критерий.

    Возвращает:
    - Индекс (или список индексов) выбранной альтернативы(альтернатив).
    """
    m, n = evaluations.shape
    # Преобразование оценок: для критериев минимизации умножаем на -1
    evaluations = evaluations.copy()
    for j in range(n):
        if not is_max[j]:
            evaluations[:, j] = -evaluations[:, j]
    # Инициализация текущего множества альтернатив
    X_current = list(range(m))
    for k in range(n):
        j = criteria_order[k]
        if len(X_current) == 0:
            break
        t_star = np.max(evaluations[X_current, j])
        X_next = [i for i in X_current if evaluations[i, j] >= t_star - concessions[j]]
        X_current = X_next
    if len(X_current) == 1:
        return X_current[0]
    elif len(X_current) > 1:
        return X_current
    else:
        return "Ни одна альтернатива не удовлетворяет всем уступкам"

# Пример использования
if __name__ == "__main__":
    # Пример выбора упаковочной машины
    evaluations = np.array([
        [200, 45, 15, 10],
        [180, 48, 20, 8],
        [200, 50, 10, 8],
        [190, 48, 10, 10],
        [220, 50, 5, 12],
        [200, 42, 10, 7],
        [220, 40, 20, 15]
    ])
    criteria_order = [0, 1, 2, 3]  # f1 наиболее важный, затем f2, f3, f4
    concessions = [50, 10, 20, 5]  # Δ1=20, Δ2=5, Δ3=5, Δ4=0
    is_max = [True, False, False, True]
    selected = successive_concessions(evaluations, criteria_order, concessions, is_max)
    print(f"Индекс выбранной альтернативы: {selected}")