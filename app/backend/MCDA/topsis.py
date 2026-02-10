import numpy as np


def topsis(X: np.ndarray, weights: np.ndarray, criteria: np.ndarray):
    norm_den = np.sqrt((X**2).sum(axis=0))
    R = X / norm_den

    V = R * weights

    ideal = np.where(~criteria, V.min(axis=0), V.max(axis=0))
    anti_ideal = np.where(~criteria, V.max(axis=0), V.min(axis=0))

    dist_to_ideal = np.sqrt(((V - ideal) ** 2).sum(axis=1))
    dist_to_anti = np.sqrt(((V - anti_ideal) ** 2).sum(axis=1))

    scores = dist_to_anti / (dist_to_ideal + dist_to_anti)
    ranked_indices = np.argsort(-scores)

    return scores, ranked_indices


if __name__ == "__main__":
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

    w = np.array([3, 2, 1])
    is_min = np.array([False, False, False])

    scores, ranking = topsis(X, w, is_min)

    print("Близости к идеалу:", np.round(scores, 4))
    print("Порядок альтернатив:", ranking)
