import matplotlib.pyplot as plt
from PIL import Image

class Visualizer:
    @staticmethod
    def visualize_results(ranked_results):
        """Visualize the top-ranked similar images."""
        fig, axes = plt.subplots(1, len(ranked_results), figsize=(12, 4))
        for ax, (image_path, distance) in zip(axes, ranked_results):
            img = Image.open(image_path)
            ax.imshow(img)
            ax.axis("off")
            ax.set_title(f"Distance: {distance:.2f}")
        plt.show()