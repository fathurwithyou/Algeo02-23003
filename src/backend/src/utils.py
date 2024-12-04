import pickle

def save_image_ids(image_ids, filepath):
    """Save image IDs to a file."""
    with open(filepath, 'wb') as f:
        pickle.dump(image_ids, f)

def load_image_ids(filepath):
    """Load image IDs from a file."""
    with open(filepath, 'rb') as f:
        return pickle.load(f)

def save_audio_ids(audio_ids, filepath):
    """Save audio IDs to a file."""
    with open(filepath, 'wb') as f:
        pickle.dump(audio_ids, f)
        
def load_audio_ids(filepath):
    """Load audio IDs from a file."""
    with open(filepath, 'rb') as f:
        return pickle.load(f)
