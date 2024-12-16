from src.audio.audioProcessing import AudioProcessor
import numpy as np
import os
import json

with open("settings.json", "r") as f:
    settings = json.load(f)

class AudioRetriever(AudioProcessor):
    def __init__(self):
        super().__init__()
        self.database = {}
        self.is_fitted = False
        
    def fit(self, folder_path):
        """
        Build a database of MIDI notes from a folder containing MIDI and WAV files.
        """
        import os
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith('.mid'):
                    midi_file = os.path.join(root, file)
                    midi_notes = self.extract_midi_notes(midi_file)
                    self.database[midi_file] = midi_notes
                elif file.endswith('.wav'):
                    audio_file = os.path.join(root, file)
                    midi_file = audio_file.replace('.wav', '.mid')
                    self.wav2midi(audio_file, midi_file)
                    midi_notes = self.extract_midi_notes(midi_file)
                    self.database[midi_file] = midi_notes
        self.is_fitted = True

    def predict(self, audio_file, threshold=0.55):
        """
        Predict the similarity of the input audio file against the database.
        Supports both WAV and MIDI files as input.
        Considers ATB, RTB, and FTB for similarity calculation.
        """
        if audio_file.endswith('.wav'):
            # Convert WAV to MIDI
            midi_file = audio_file.replace('.wav', '.mid')
            self.wav2midi(audio_file, midi_file)
        elif audio_file.endswith('.mp3'):
            # convert mp3 to midi
            midi_file = audio_file.replace('.mp3', '.mid')
            self.mp3tomidi(audio_file, midi_file)
        elif audio_file.endswith('.m4a'):
            # convert m4a to midi
            midi_file = audio_file.replace('.m4a', '.mid')
            self.m4atomidi(audio_file, midi_file)
        elif audio_file.endswith(('.mid', '.midi')):
            midi_file = audio_file
        else:
            raise ValueError("Unsupported file format. Please provide a .wav or .mid file.")
        
        # Extract MIDI notes
        midi_notes = self.extract_midi_notes(midi_file)
        
        atb_features = self.atb(midi_notes)
        rtb_features = self.rtb(midi_notes)
        ftb_features = self.ftb(midi_notes)
        
        combined_features = np.concatenate([atb_features, rtb_features, ftb_features])
        
        hist1 = self.histogram(combined_features)
        
        similarities = {}
        for midi_file, midi_notes_db in self.database.items():
            atb_features_db = self.atb(midi_notes_db)
            rtb_features_db = self.rtb(midi_notes_db)
            ftb_features_db = self.ftb(midi_notes_db)
            
            combined_features_db = np.concatenate([atb_features_db, rtb_features_db, ftb_features_db])
            
            hist2 = self.histogram(combined_features_db)
            
            similarities[midi_file] = self.similarity(hist1, hist2)
        
        result = [(k, v) for k, v in similarities.items() if v >= threshold]
        result.sort(key=lambda x: x[1], reverse=True)
        
        result = [(os.path.basename(k), v) for k, v in result]
        
        return result
    
    def is_fit(self):
        return self.is_fitted

