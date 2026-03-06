import numpy as np


def successive_concessions(evaluations, criteria_order, concessions, is_max):

    m, n = evaluations.shape

    evaluations = evaluations.copy()
    for j in range(n):
        if not is_max[j]:
            evaluations[:, j] = -evaluations[:, j]

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


if __name__ == "__main__":
    evaluations = np.array([[200, 45, 15, 10], [180, 48, 20, 8], [200, 50, 10, 8], [190, 48, 10, 10], [220, 50, 5, 12], [200, 42, 10, 7], [220, 40, 20, 15]])
    criteria_order = [0, 1, 2, 3]
    concessions = [50, 10, 20, 5]
    is_max = [True, False, False, True]
    selected = successive_concessions(evaluations, criteria_order, concessions, is_max)
    print(f"Индекс выбранной альтернативы: {selected}")
