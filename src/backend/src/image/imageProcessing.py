import os
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from numpy.linalg import svd

class ImageProcessor:
    def __init__(self, resize_shape=(64, 64)):
        self.resize_shape = resize_shape

    def load_and_preprocess(self, image_dir):
        """
        Load images from the directory, convert to grayscale, resize, and flatten.
        Returns the preprocessed images and their paths.
        """
        image_paths = [
            os.path.join(image_dir, fname)
            for fname in os.listdir(image_dir)
            if fname.lower().endswith((".jpg", ".png", ".jpeg"))
        ]
        if not image_paths:
            raise ValueError("No images found in the directory.")

        images = []
        for path in image_paths:
            try:
                image = Image.open(path).convert("RGB")
                grayscale = self.rgb_to_grayscale(np.array(image))
                resized = self.resize_image(grayscale)
                images.append(resized.flatten())
            except Exception as e:
                print(f"Warning: Failed to process image {path}. Error: {e}")
                continue

        if not images:
            raise ValueError("All images failed to process. Please check the dataset.")
        
        return np.array(images), image_paths

    def rgb_to_grayscale(self, image):
        """Convert RGB image to grayscale."""
        return np.dot(image[..., :3], [0.2989, 0.5870, 0.1140])

    def resize_image(self, image):
        """Resize the image to the target size."""
        return np.array(Image.fromarray(image).resize(self.resize_shape))


class PCAProcessor:
    def __init__(self, n_components=50):
        self.n_components = n_components
        self.mean_image = None
        self.components = None

    def fit(self, images):
        """Fit PCA to the image dataset using SVD."""
        self.mean_image = np.mean(images, axis=0)
        centered_data = images - self.mean_image
        U, _, Vt = svd(centered_data, full_matrices=False)
        self.components = Vt[:self.n_components]

    def transform(self, images):
        """Transform images to PCA space."""
        centered_images = images - self.mean_image
        return np.dot(centered_images, self.components.T)

    def project(self, image):
        """Project a single image into PCA space."""
        return np.dot(image - self.mean_image, self.components.T)