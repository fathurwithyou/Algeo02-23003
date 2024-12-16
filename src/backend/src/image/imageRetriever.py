from src.image.imageProcessing import ImageProcessor, PCAProcessor
from src.similarity import SimilarityCalculator
from PIL import Image
import os
import numpy as np

class ImageRetriever:
    def __init__(self, n_components=50, resize_shape=(64, 64)):
        self.pca_processor = PCAProcessor(n_components=n_components)
        self.image_processor = ImageProcessor(resize_shape=resize_shape)
        self.images = []
        self.image_paths = []
        self.projections = None
        self.fit_status = False

    def fit(self, folder_path):
        """Load, preprocess, and fit the dataset."""
        import os
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith('.png') or file.endswith('.jpg'):
                    image_file = os.path.join(root, file)
                    image = Image.open(image_file).convert("RGB")
                    grayscale_image = self.image_processor.rgb_to_grayscale(np.array(image))
                    resized_image = self.image_processor.resize_image(grayscale_image).flatten().astype(np.float64)
                    self.images.append(resized_image)
                    self.image_paths.append(image_file)
                    
        self.projections = self.pca_processor.fit_transform(self.images)
        self.fit_status = True

    def predict(self, query_image_path, result_limit=5, max_distance=float('inf'), method="euclidean"):
        """Find similar images."""
        try:
            query_image = Image.open(query_image_path).convert("RGB")
            query_grayscale = self.image_processor.rgb_to_grayscale(np.array(query_image))
            query_resized = self.image_processor.resize_image(query_grayscale).flatten().astype(float)
        except Exception as e:
            raise ValueError(f"Error processing query image: {e}")

        query_projection = self.pca_processor.project(query_resized)
        
        distances = SimilarityCalculator.euclidean_distance(query_projection, self.projections)
        distances = np.squeeze(distances)

        result = [(self.image_paths[i], distances[i]) for i in range(len(distances)) if distances[i] <= max_distance]
        result.sort(key=lambda x: x[1])        
        result = result[:result_limit]
        result = [(os.path.basename(k), v) for k, v in result]
        
        return result
        
    def is_fit(self):
        return self.fit_status
