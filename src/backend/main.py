from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from src.image.imageRetriever import ImageRetriever
import os
import json
import zipfile

mapper = {}

# Load settings
with open('settings.json', 'r') as f:
    settings = json.load(f)

app = Flask(__name__)
CORS(app)

@app.route('/get/images', methods=['GET'])
def get_images():
    """Endpoint to retrieve all image file names from the public/images directory."""
    try:
        directory = "public/images/"
        if not os.path.exists(directory):
            return jsonify({"error": "Images directory does not exist."}), 404

        image_files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
        return jsonify({"images": image_files}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/get/songs', methods=['GET'])
def get_songs():
    """Endpoint to retrieve all audio file names from the public/songs directory."""
    try:
        directory = "public/songs/"
        if not os.path.exists(directory):
            return jsonify({"error": "Songs directory does not exist."}), 404

        song_files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
        return jsonify({"songs": song_files}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/get/mapper', methods=['GET'])
def get_mapper():
    """Endpoint to retrieve the mapper."""
    print("Mapper content:", mapper)
    return jsonify(mapper)

@app.route('/upload/mapper', methods=['POST'])
def upload_mapper():
    """
    Aligning to proper mapper structure
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        file = request.files['file']
        file_content = file.read().decode('utf-8')
        
        try:
            json_data = json.loads(file_content)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Invalid JSON format"}), 400

        for item in json_data:
            mapper[item["audio_file"]] = item["pic_name"]
            mapper[item["pic_name"]] = item["audio_file"]
        
        print("Mapper content:", mapper)
        
        return jsonify({"message": "Mapper uploaded successfully."}), 200
    
    except Exception as e:
        print("Error:", e)  # Log the exception
        return jsonify({"error": str(e)}), 500

@app.route('/upload/image', methods=['POST'])
def upload_image():
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No file part"}), 400

        files = request.files.getlist('files')
        if not files:
            return jsonify({"error": "No selected files"}), 400

        image_extensions = [".jpg", ".jpeg", ".png"]
        directory = "public/images/"
        os.makedirs(directory, exist_ok=True)

        # Delete previous files in the directory
        for existing_file in os.listdir(directory):
            os.remove(os.path.join(directory, existing_file))

        for file in files:
            filename = file.filename
            extension = os.path.splitext(filename)[1].lower()

            if extension == ".zip":
                with zipfile.ZipFile(file) as zip_file:
                    for zip_info in zip_file.infolist():
                        zip_filename = zip_info.filename
                        zip_extension = os.path.splitext(zip_filename)[1].lower()
                        if zip_extension in image_extensions:
                            with zip_file.open(zip_info) as image_file:
                                image_path = os.path.join(directory, zip_filename)
                                with open(image_path, 'wb') as output_file:
                                    output_file.write(image_file.read())
            elif extension in image_extensions:
                file_path = os.path.join(directory, filename)
                file.save(file_path)
            else:
                return jsonify({"error": f"Invalid file type received: {filename}"}), 400
        return jsonify({"message": "Files uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload/audio', methods=['POST'])
def upload_audio():
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No file part"}), 400

        files = request.files.getlist('files')
        if not files:
            return jsonify({"error": "No selected files"}), 400

        audio_extensions = [".wav", ".mp3", ".m4a", ".mid"]
        directory = "public/songs/"
        os.makedirs(directory, exist_ok=True)

        for existing_file in os.listdir(directory):
            os.remove(os.path.join(directory, existing_file))

        for file in files:
            filename = file.filename
            extension = os.path.splitext(filename)[1].lower()

            if extension == ".zip":
                with zipfile.ZipFile(file) as zip_file:
                    for zip_info in zip_file.infolist():
                        zip_filename = zip_info.filename
                        zip_extension = os.path.splitext(zip_filename)[1].lower()
                        if zip_extension in audio_extensions:
                            with zip_file.open(zip_info) as audio_file:
                                audio_path = os.path.join(directory, zip_filename)
                                with open(audio_path, 'wb') as output_file:
                                    output_file.write(audio_file.read())
            elif extension in audio_extensions:
                file_path = os.path.join(directory, filename)
                file.save(file_path)
            else:
                return jsonify({"error": f"Invalid file type received: {filename}"}), 400

        return jsonify({"message": "Files uploaded successfully"}), 201

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