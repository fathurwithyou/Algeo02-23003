# Configuration file for image and audio retrieval

# General settings
DATA_DIR = "./data"
LOG_DIR = "./logs"
RESULTS_DIR = "./results"
SEED = 42  # For reproducibility

# Audio retrieval settings
AUDIO_CONFIG = {
    "frame_size": 1024,          # Frame size for audio segmentation
    "hop_size": 512,            # Hop size for overlapping frames
    "sampling_rate": 44100,     # Audio sampling rate (Hz)
    "supported_formats": [".wav", ".mp3"],  # Supported audio file formats
    "database_folder": f"{DATA_DIR}/audio",  # Path to audio database
    "query_folder": f"{DATA_DIR}/audio_query"         # Path to query audio files
}

# Image retrieval settings
IMAGE_CONFIG = {
    "resize_shape": (224, 224),  # Resize shape for image preprocessing
    "color_space": "RGB",        # Color space (e.g., RGB, Grayscale)
    "supported_formats": [".jpg", ".png"],  # Supported image file formats
    "database_folder": f"{DATA_DIR}/image",  # Path to image database
    "query_folder": f"{DATA_DIR}/image_query"         # Path to query image files
}

# Feature extraction settings
FEATURE_EXTRACTION = {
    "audio_features": ["atb", "rtb", "ftb"],  # Audio features to extract
    "image_features": ["color_histogram"],    # Image features to extract
}

# Similarity search settings
SIMILARITY_CONFIG = {
    "metric": "cosine",   # Similarity metric: 'cosine', 'euclidean', etc.
    "top_k": 5            # Number of top results to return
}
