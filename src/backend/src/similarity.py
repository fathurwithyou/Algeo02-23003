import numpy as np

class SimilarityCalculator:
    @staticmethod
    def compute_euclidean_distance(projections, query_projection):
        """Compute Euclidean distances between query image and all dataset images."""
        return np.linalg.norm(projections - query_projection, axis=1)

    @staticmethod
    def rank_similarities(distances, image_paths, limit=5, max_distance=float('inf')):
        """Rank images by similarity and return the top results."""
        indices = np.argsort(distances)
        results = [
            (image_paths[i], distances[i])
            for i in indices if distances[i] <= max_distance
        ][:limit]
        return results