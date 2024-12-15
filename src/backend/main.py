from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
# from models.image_model import ImageModel
from models.audio_model import AudioModel
import os
import json
from datetime import datetime

# Load settings
try:
    with open('settings.json', 'r') as f:
        settings = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("settings.json file is missing. Please provide a valid configuration file.")

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Initialize models
# image_model = ImageModel(settings["IMAGE_CONFIG"])
audio_model = AudioModel(settings["AUDIO_CONFIG"])

# 2 way mapper
mapper = {}

@app.route('/get/mapper', methods=['GET'])
def get_mapper():
    """Endpoint to retrieve the mapper."""
    return jsonify(mapper)

@app.route('/upload/mapper', methods=['POST'])
def upload_mapper():
    """
    Aligning to proper mapper structure
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        json_file = request.files['file']
        
        for i in json_file:
            mapper[i["audio_file"]] = i["pic_name"]
            mapper[i["pic_name"]] = i["audio_file"]
        
        return jsonify({"message": "Mapper uploaded successfully."}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/audio', methods=['POST'])
def get_audio_by_filename():
    """Endpoint to retrieve audio file by filename text."""
    try:
        if 'filename' not in request.form:
            return jsonify({"error": "No filename provided."}), 400

        filepath = request.form['filename']
        print(filepath)
        
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found."}), 404
        
        # Serve the audio file
        return send_file(filepath, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/image', methods=['POST'])
def get_image_by_filename():
    """Endpoint to retrieve image file by filename."""
    try:
        if 'filename' not in request.form:
            return jsonify({"error": "No filename provided."}), 400

        filepath = request.form['filename']
        
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found."}), 404
        
        # Serve the image file
        return send_file(filepath, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/audio', methods=['POST'])
def predict_audio():
    """Endpoint to predict similar audio."""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided."}), 400

        audio_file = request.files['audio']
        
        # Validate and process audio
        result = audio_model.predict(audio_file)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload/audio', methods=['POST'])
def upload_audio():
    """Endpoint for audio upload."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        zip_file = request.files['file']
        
        # Validate and process ZIP
        message = audio_model.upload(zip_file)
        return jsonify({"message": message}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# @app.route('/predict/image', methods=['POST'])
# def predict_image():
#     """Endpoint to predict similar images."""
#     try:
#         if 'image' not in request.files:
#             return jsonify({"error": "No image file provided."}), 400

#         image_file = request.files['image']
        
#         # Validate and process image
#         result = image_model.predict(image_file, request.form)
#         return jsonify(result), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

    
# @app.route('/upload/image', methods=['POST'])
# def upload_image():
#     """Endpoint for image upload."""
#     try:
#         if 'file' not in request.files:
#             return jsonify({"error": "No file part in the request."}), 400

#         zip_file = request.files['file']
        
#         # Validate and process ZIP
#         message = image_model.upload(zip_file)
#         return jsonify({"message": message}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "API is running"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
