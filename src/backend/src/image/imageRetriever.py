from src.image.imageProcessing import ImageProcessor, PCAProcessor
from src.similarity import SimilarityCalculator
from PIL import Image
from tqdm import tqdm
import os
import numpy as np


class ImageRetriever:
    def __init__(self, n_components=50, resize_shape=(64, 64)):
        self.pca_processor = PCAProcessor(n_components=n_components)
        self.image_processor = ImageProcessor(resize_shape=resize_shape)
        self.images = None
        self.image_paths = None
        self.projections = None

    def fit(self, image_dir):
        """Load, preprocess, and fit the dataset."""
        self.images, self.image_paths = self.image_processor.load_images(image_dir)
        self.projections = self.pca_processor.fit_transform(self.images)

    def predict(self, query_image_path, result_limit=5, max_distance=float('inf')):
        """Find and visualize similar images."""
        print(f"Processing query image: {query_image_path}")
        try:
            query_image = Image.open(query_image_path).convert("RGB")
            query_grayscale = self.image_processor.rgb_to_grayscale(np.array(query_image))
            query_resized = self.image_processor.resize_image(query_grayscale).flatten()
        except Exception as e:
            raise ValueError(f"Error processing query image: {e}")

        query_projection = self.pca_processor.project(query_resized)

        print("Computing similarities...")
        distances = SimilarityCalculator.compute_euclidean_distance(self.projections, query_projection)
        ranked_results = SimilarityCalculator.rank_similarities(
            distances, self.image_paths, limit=result_limit, max_distance=max_distance
        )

        if not ranked_results:
            print("No similar images found within the specified distance limit.")
            return

