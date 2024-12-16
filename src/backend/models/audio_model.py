import os
import zipfile
from datetime import datetime
from src.audio.audioRetriever import AudioRetriever
import json
from typing import List, Tuple, Dict


class AudioModel:
    def __init__(self, config):
        self.audio_folder = config.get("audio_folder", "data/audio")
        self.audio_query = config.get("audio_query", "data/audio_query")
        self.audio_db = None
        self.model = AudioRetriever()
        os.makedirs(self.audio_folder, exist_ok=True)
        os.makedirs(self.audio_query, exist_ok=True)
    
    def fit(self, audio_folder):
        self.model.fit(audio_folder)

    def predict(self, audio_file):
        if not audio_file.filename.lower().endswith((".wav", ".midi", ".mid")):
            raise ValueError("Invalid file type. Only WAV and MIDI are allowed.")

        query_path = os.path.join(self.audio_query, audio_file.filename)
        audio_file.save(query_path)

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
            zip_ref.extractall(self.audio_folder)

        self.model.fit(self.audio_folder)
        return "Audio files uploaded and model updated successfully."
    
    def get_result(self, files: List[str], mapper: Dict[str, str]) -> List[Tuple[str, str]]:
        """
        Mapper structure: list of {image_file: audio_file}
        
        Returns:
            List of tuples containing (audio_file, image_file)
        """
        result = []
        for file in files:
            result.append((mapper.get(file, None), file))
        
        return result

    def is_fit(self):
        return self.model.is_fit()
        
        
        
        
