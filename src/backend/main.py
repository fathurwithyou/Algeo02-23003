from flask import Flask, request, jsonify
from flask_cors import CORS
from src.image.imageRetriever import ImageRetriever
import os
import json

# Load settings
with open('settings.json', 'r') as f:
    settings = json.load(f)

app = Flask(__name__)
CORS(app)


def predictImage():
    try:
        image_dir = settings["IMAGE_CONFIG"]["database_folder"]
        query_image_path = "data/image/cat-1.png"  # Example query
        result_limit = 5
        max_distance = 100

        # Instantiate the retriever with the correct parameters
        model = ImageRetriever(
            n_components=50,
            resize_shape=settings["IMAGE_CONFIG"]["resize_shape"]
        )
        
        # Ensure the image directory exists
        if not os.path.exists(image_dir):
            raise FileNotFoundError(f"Image directory {image_dir} does not exist.")
        
        model.fit(image_dir)

        # Predict
        results = model.predict(
            query_image_path, result_limit=result_limit, max_distance=max_distance
        )
        print("Results:", results)

    except Exception as e:
        print(f"Error: {e}")
