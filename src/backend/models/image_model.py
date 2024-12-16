import os
import zipfile
from datetime import datetime
from src.image.imageRetriever import ImageRetriever
import json
from typing import List, Tuple, Dict

class ImageModel:
    def __init__(self, config):
        self.image_folder = config.get("image_folder", "data/image")
        self.image_query = config.get("image_query", "data/image_query") 
        self.n_components = config.get("n_components", 50)
        self.resize_shape = tuple(config.get("resize_shape", (64, 64)))
        self.model = ImageRetriever(n_components=self.n_components, resize_shape=self.resize_shape)
        os.makedirs(self.image_folder, exist_ok=True)
    
    def fit(self, image_folder):    
        self.model.fit(image_folder)

    def predict(self, image_file):
        if not image_file.filename.lower().endswith((".png", ".jpg")):
            raise ValueError("Invalid file type. Only PNG and JPG are allowed.")

        query_path = os.path.join(self.image_query, image_file.filename)
        image_file.save(query_path)

        results = self.model.predict(query_path)
        os.remove(query_path)
        
        return {"results": results}

    def upload(self, zip_file):
        if not zip_file.filename.lower().endswith(".zip"):
            raise ValueError("Only ZIP files are allowed.")

        temp_zip_path = os.path.join("temp", zip_file.filename)
        os.makedirs("temp", exist_ok=True)
        zip_file.save(temp_zip_path)

        with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
            zip_ref.extractall(self.image_folder)

        os.remove(temp_zip_path)
        self.model.fit(self.image_folder)
        return "Images uploaded and model updated successfully."
    
    def get_result(self, files: List[str], mapper: Dict[str, str]) -> List[Tuple[str, str]]:
        """
        Mapper structure: list of {image_file: audio_file}
        
        Returns:
            List of tuples containing (image_file, audio_file)
        """
        # get image files and audio files
        result = []
        for file in files:
            result.append((file, mapper.get(file, None)))
        
        return result

    def is_fit(self):
        return self.model.is_fit()