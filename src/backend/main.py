from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from models.image_model import ImageModel
from models.audio_model import AudioModel
import os
import json
import zipfile
import shutil
import patoolib

mapper = {}

try:
    with open('settings.json', 'r') as f:
        settings = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("settings.json file is missing. Please provide a valid configuration file.")

image_model = ImageModel(settings["IMAGE_CONFIG"])
audio_model = AudioModel(settings["AUDIO_CONFIG"])

app = Flask(__name__)
CORS(app)

@app.route('/get/images', methods=['GET'])
def get_images():
    """Endpoint to retrieve all image file names from the public/images directory."""
    try:
        directory = "data/image/"
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
        directory = "data/audio/"
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


@app.route('/reset', methods=['GET'])
def reset():
    """Reset the API."""
    global mapper
    mapper = {}

    #  delete all files in the audio folder
    audio_files = os.listdir(settings["AUDIO_CONFIG"]["database_folder"])
    for audio_file in audio_files:
        file_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], audio_file)
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
        
    # delete all files in the image folder
    image_files = os.listdir(settings["IMAGE_CONFIG"]["database_folder"])
    for image_file in image_files:
        file_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], image_file)
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
        
    return jsonify({"message": "API reset successful."}), 200

    

@app.route('/audio', methods=['GET'])
def get_audio_by_filename():
    """Endpoint to retrieve audio file by filename."""
    try:
        filename = request.args.get('filename')
        if not filename:
            return jsonify({"error": "No filename provided."}), 400
        
        if not os.path.exists(filename):
            return jsonify({"error": "File not found."}), 404
        
        return send_file(filename, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/image', methods=['GET'])
def get_image_by_filename():
    """Endpoint to retrieve image file path by filename."""
    try:
        filename = request.args.get('filename')
        if not filename:
            return jsonify({"error": "No filename provided."}), 400

        if not os.path.exists(filename):
            return jsonify({"error": "File not found."}), 404
        
        # Return the path for the image
        return jsonify({"path": f"/static/images/{filename}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/audio', methods=['POST'])
def predict_audio():
    """Endpoint to predict similar audio."""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided."}), 400

        audio_file = request.files['audio']
        
        if audio_model.is_fit() == False:
            return jsonify({"error": "Model is not trained yet."}), 400
        
        result = audio_model.predict(audio_file)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload/audio', methods=['POST'])
def upload_audio():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        files = request.files.getlist('file')
        if not files:
            return jsonify({"error": "No selected files"}), 400

        audio_extensions = [".wav", ".mp3", ".m4a", ".mid"]
        
        backend_audio_folder = settings["AUDIO_CONFIG"]["database_folder"]
        frontend_audio_folder = os.path.join('..', 'frontend', 'public', 'audio')

        os.makedirs(backend_audio_folder, exist_ok=True)
        os.makedirs(frontend_audio_folder, exist_ok=True)

        for existing_file in os.listdir(backend_audio_folder):
            file_path = os.path.join(backend_audio_folder, existing_file)
            if os.path.isdir(file_path):
                shutil.rmtree(file_path)
            else:
                os.remove(file_path)
        
        for existing_file in os.listdir(frontend_audio_folder):
            file_path = os.path.join(frontend_audio_folder, existing_file)
            if os.path.isdir(file_path):
                shutil.rmtree(file_path)
            else:
                os.remove(file_path)

        for file in files:
            filename = file.filename
            extension = os.path.splitext(filename)[1].lower()

            if extension == ".zip":
                with zipfile.ZipFile(file) as zip_file:
                    print(zip_file.namelist())
                    for zip_info in zip_file.infolist():
                        if zip_info.is_dir():
                            continue
                        zip_filename = zip_info.filename
                        zip_extension = os.path.splitext(zip_filename)[1].lower()
                        if zip_extension in audio_extensions:
                            with zip_file.open(zip_info) as audio_file:
                                audio_path_backend = os.path.join(backend_audio_folder, zip_filename)
                                audio_path_frontend = os.path.join(frontend_audio_folder, zip_filename)
                                os.makedirs(os.path.dirname(audio_path_backend), exist_ok=True)
                                os.makedirs(os.path.dirname(audio_path_frontend), exist_ok=True)
                                with open(audio_path_backend, 'wb') as output_file_backend, open(audio_path_frontend, 'wb') as output_file_frontend:
                                    data = audio_file.read()
                                    output_file_backend.write(data)
                                    output_file_frontend.write(data)
                                    
            elif extension == ".rar":
                file_path_backend = os.path.join(backend_audio_folder, filename)
                file_path_frontend = os.path.join(frontend_audio_folder, filename)
                file.save(file_path_backend)
                file.save(file_path_frontend)
                os.makedirs(os.path.join(backend_audio_folder, filename.split('.')[0]), exist_ok=True)
                os.makedirs(os.path.join(frontend_audio_folder, filename.split('.')[0]), exist_ok=True)
                patoolib.extract_archive(file_path_backend, outdir=os.path.join(backend_audio_folder, filename.split('.')[0]))
                patoolib.extract_archive(file_path_frontend, outdir=os.path.join(frontend_audio_folder, filename.split('.')[0]))
                os.remove(file_path_backend)
                os.remove(file_path_frontend)
                
            elif extension in audio_extensions:
                file_path_backend = os.path.join(backend_audio_folder, filename)
                file_path_frontend = os.path.join(frontend_audio_folder, filename)
                file.save(file_path_backend)
                file.save(file_path_frontend)
            
        for folder in os.listdir(backend_audio_folder):
            if os.path.isdir(os.path.join(backend_audio_folder, folder)):
                folder_path = os.path.join(backend_audio_folder, folder)
                for file in os.listdir(folder_path):
                    file_path = os.path.join(folder_path, file)
                    file_new = "_".join([folder, file])
                    new_file_path = os.path.join(backend_audio_folder, file_new)
                    shutil.move(file_path, new_file_path)
                shutil.rmtree(folder_path)
        
        audio_model.fit(backend_audio_folder)
        return jsonify({"message": "Files uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/predict/image', methods=['POST'])
def predict_image():
    """Endpoint to predict similar images."""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400
        
        image_file = request.files['image']
        
        if image_model.is_fit() == False:
            return jsonify({"error": "Model is not trained yet."}), 400
        
        result = image_model.predict(image_file)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route('/upload/image', methods=['POST'])
def upload_image():
    """Endpoint for image upload."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        files = request.files.getlist('file')
        if not files:
            return jsonify({"error": "No selected files"}), 400

        image_extensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif"]
        
        backend_image_folder = settings["IMAGE_CONFIG"]["database_folder"]
        frontend_image_folder = os.path.join('..', 'frontend', 'public', 'images')

        os.makedirs(backend_image_folder, exist_ok=True)
        os.makedirs(frontend_image_folder, exist_ok=True)

        for existing_file in os.listdir(backend_image_folder):
            file_path = os.path.join(backend_image_folder, existing_file)
            if os.path.isdir(file_path):
                shutil.rmtree(file_path)
            else:
                os.remove(file_path)

        for existing_file in os.listdir(frontend_image_folder):
            file_path = os.path.join(frontend_image_folder, existing_file)
            if os.path.isdir(file_path):
                shutil.rmtree(file_path)
            else:
                os.remove(file_path)

        for file in files:
            filename = file.filename
            extension = os.path.splitext(filename)[1].lower()

            if extension == ".zip":
                with zipfile.ZipFile(file) as zip_file:
                    for zip_info in zip_file.infolist():
                        if zip_info.is_dir():
                            continue
                        zip_filename = zip_info.filename
                        zip_extension = os.path.splitext(zip_filename)[1].lower()
                        if zip_extension in image_extensions:
                            with zip_file.open(zip_info) as image_file:
                                image_path_backend = os.path.join(backend_image_folder, zip_filename)
                                image_path_frontend = os.path.join(frontend_image_folder, zip_filename)
                                os.makedirs(os.path.dirname(image_path_backend), exist_ok=True)
                                os.makedirs(os.path.dirname(image_path_frontend), exist_ok=True)
                                with open(image_path_backend, 'wb') as output_file_backend, open(image_path_frontend, 'wb') as output_file_frontend:
                                    data = image_file.read()
                                    output_file_backend.write(data)
                                    output_file_frontend.write(data)
                                    
            elif extension == ".rar":
                file_path_backend = os.path.join(backend_image_folder, filename)
                file_path_frontend = os.path.join(frontend_image_folder, filename)
                file.save(file_path_backend)
                file.save(file_path_frontend)
                os.makedirs(os.path.join(backend_image_folder, filename.split('.')[0]), exist_ok=True)
                os.makedirs(os.path.join(frontend_image_folder, filename.split('.')[0]), exist_ok=True)
                patoolib.extract_archive(file_path_backend, outdir=os.path.join(backend_image_folder, filename.split('.')[0]))
                patoolib.extract_archive(file_path_frontend, outdir=os.path.join(frontend_image_folder, filename.split('.')[0]))
                os.remove(file_path_backend)
                os.remove(file_path_frontend)
                
            elif extension in image_extensions:
                file_path_backend = os.path.join(backend_image_folder, filename)
                file_path_frontend = os.path.join(frontend_image_folder, filename)
                print(file)
                file.save(file_path_backend)
                file.stream.seek(0)  # Reset file stream position to the beginning
                file.save(file_path_frontend)
        
        for folder in os.listdir(backend_image_folder):
            if os.path.isdir(os.path.join(backend_image_folder, folder)):
                folder_path = os.path.join(backend_image_folder, folder)
                for file in os.listdir(folder_path):
                    file_path = os.path.join(folder_path, file)
                    file_new = "_".join([folder, file])
                    new_file_path = os.path.join(backend_image_folder, file_new)
                    shutil.move(file_path, new_file_path)
                shutil.rmtree(folder_path)
        
        image_model.fit(backend_image_folder)
        return jsonify({"message": "Files uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "API is running"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    app.run(debug=True)