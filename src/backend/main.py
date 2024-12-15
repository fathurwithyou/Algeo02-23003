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

@app.route('/upload-image/', methods=['POST'])
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        image_extensions = [".jpg", ".jpeg", ".png"]
        directory = "public/images/"
        filename = file.filename.replace(" ", "_")
        extension = os.path.splitext(filename)[1].lower()

        if extension not in image_extensions:
            return jsonify({"error": "Invalid file type received."}), 400

        os.makedirs(directory, exist_ok=True)

        # Delete previous files in the directory
        for existing_file in os.listdir(directory):
            os.remove(os.path.join(directory, existing_file))

        file_path = os.path.join(directory, filename)
        file.save(file_path)

        return jsonify({"message": "File uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload-audio/', methods=['POST'])
def upload_audio():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        audio_extensions = [".wav", ".mp3", ".m4a", ".mid"]
        directory = "public/songs/"
        filename = file.filename.replace(" ", "_")
        extension = os.path.splitext(filename)[1].lower()

        if extension not in audio_extensions:
            return jsonify({"error": "Invalid file type received."}), 400

        os.makedirs(directory, exist_ok=True)

        # Delete previous files in the directory
        for existing_file in os.listdir(directory):
            os.remove(os.path.join(directory, existing_file))

        file_path = os.path.join(directory, filename)
        file.save(file_path)

        return jsonify({"message": "File uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload-mapper/', methods=['POST'])
def upload_mapper():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        mapper_extensions = [".txt", ".json"]
        directory = "public/mapper/"
        filename = file.filename.replace(" ", "_")
        extension = os.path.splitext(filename)[1].lower()

        if extension not in mapper_extensions:
            return jsonify({"error": "Invalid file type received."}), 400

        os.makedirs(directory, exist_ok=True)

        # Delete previous files in the directory
        for existing_file in os.listdir(directory):
            os.remove(os.path.join(directory, existing_file))

        file_path = os.path.join(directory, filename)
        file.save(file_path)

        return jsonify({"message": "File uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

if __name__ == '__main__':
    app.run(debug=True)