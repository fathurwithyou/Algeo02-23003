from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models.image_model import ImageModel
from models.audio_model import AudioModel
import os
import json
import zipfile
import shutil
import patoolib

try:
    with open('settings.json', 'r') as f:
        settings = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("settings.json file is missing. Please provide a valid configuration file.")

app = Flask(__name__)
CORS(app)

image_model = ImageModel(settings["IMAGE_CONFIG"])
audio_model = AudioModel(settings["AUDIO_CONFIG"])

# 2 way mapper
mapper = {}

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

@app.route('/get/allimages', methods=['GET'])
def get_all_images():
    """Endpoint to retrieve all images and send"""
    
@app.route('/get/mapper', methods=['GET'])
def get_mapper():
    """Endpoint to retrieve the mapper."""
    return jsonify(mapper)

@app.route('/upload/mapper', methods=['POST'])
def upload_mapper():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        file = request.files['file']
        
        if file.filename.split('.')[-1] == 'txt':
            json_file = []
            for line in file:
                line = line.decode('utf-8').strip()
                if line:
                    audio_file, pic_name = line.split()
                    json_file.append({"audio_file": audio_file, "pic_name": pic_name})
            
        elif file.filename.split('.')[-1] == 'json':
            json_file = json.loads(file.read())
        
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
        
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found."}), 404
        
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
        
        os.makedirs(settings["AUDIO_CONFIG"]["database_folder"], exist_ok=True)

        for existing_file in os.listdir(settings["AUDIO_CONFIG"]["database_folder"]):
            file_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], existing_file)
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
                                audio_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], zip_filename)
                                os.makedirs(os.path.dirname(audio_path), exist_ok=True) 
                                with open(audio_path, 'wb') as output_file:
                                    output_file.write(audio_file.read())
                                    
            elif extension == ".rar":
                file_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], filename)
                file.save(file_path)
                os.makedirs(os.path.join(settings["AUDIO_CONFIG"]["database_folder"], filename.split('.')[0]), exist_ok=True)
                patoolib.extract_archive(file_path, outdir=os.path.join(settings["AUDIO_CONFIG"]["database_folder"], filename.split('.')[0]))
                os.remove(file_path)
                
            elif extension in audio_extensions:
                file_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], filename)
                file.save(file_path)
            
        for folder in os.listdir(settings["AUDIO_CONFIG"]["database_folder"]):
            if os.path.isdir(os.path.join(settings["AUDIO_CONFIG"]["database_folder"], folder)):
                folder_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], folder)
                for file in os.listdir(folder_path):
                    file_path = os.path.join(folder_path, file)
                    file_new = "_".join([folder, file])
                    new_file_path = os.path.join(settings["AUDIO_CONFIG"]["database_folder"], file_new)
                    shutil.move(file_path, new_file_path)
                shutil.rmtree(folder_path)
        
        audio_model.fit(settings["AUDIO_CONFIG"]["database_folder"])
        return jsonify({"message": "Files uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        

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
        
        os.makedirs(settings["IMAGE_CONFIG"]["database_folder"], exist_ok=True)

        for existing_file in os.listdir(settings["IMAGE_CONFIG"]["database_folder"]):
            file_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], existing_file)
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
                                image_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], zip_filename)
                                os.makedirs(os.path.dirname(image_path), exist_ok=True) 
                                with open(image_path, 'wb') as output_file:
                                    output_file.write(image_file.read())
                                    
            elif extension == ".rar":
                file_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], filename)
                file.save(file_path)
                os.makedirs(os.path.join(settings["IMAGE_CONFIG"]["database_folder"], filename.split('.')[0]), exist_ok=True)
                patoolib.extract_archive(file_path, outdir=os.path.join(settings["IMAGE_CONFIG"]["database_folder"], filename.split('.')[0]))
                os.remove(file_path)
                
            elif extension in image_extensions:
                file_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], filename)
                file.save(file_path)
        
        for folder in os.listdir(settings["IMAGE_CONFIG"]["database_folder"]):
            if os.path.isdir(os.path.join(settings["IMAGE_CONFIG"]["database_folder"], folder)):
                folder_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], folder)
                for file in os.listdir(folder_path):
                    file_path = os.path.join(folder_path, file)
                    file_new = "_".join([folder, file])
                    new_file_path = os.path.join(settings["IMAGE_CONFIG"]["database_folder"], file_new)
                    shutil.move(file_path, new_file_path)
                shutil.rmtree(folder_path)
            
        
        image_model.fit(settings["IMAGE_CONFIG"]["database_folder"])
        return jsonify({"message": "Files uploaded successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "API is running"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
