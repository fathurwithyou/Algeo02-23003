import numpy as np


class Similarity:
    @staticmethod
    def cosine_similarity(vector1: np.ndarray, vector2: np.ndarray) -> float:
        dot_product = np.dot(vector1, vector2)
        norm1 = np.linalg.norm(vector1)
        norm2 = np.linalg.norm(vector2)
        return dot_product / (norm1 * norm2)

    @staticmethod
    def euclidean_distance(vector1: np.ndarray, vector2: np.ndarray) -> float:
        return np.linalg.norm(vector1 - vector2)
