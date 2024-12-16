import numpy as np
import librosa
from mido import MidiFile, MidiTrack, Message

class AudioProcessor:
    def __init__(self, reference_note=60):
        self.reference_note = reference_note

    def m4atomidi(self, m4a_file, midi_file):
        """
        Convert an M4A file to a MIDI file by estimating pitches.
        """
        y, sr = librosa.load(m4a_file, sr=22050)  
        
        y_harmonic = librosa.effects.harmonic(y)
        
        pitches, magnitudes = librosa.piptrack(y=y_harmonic, sr=sr, fmin=50.0, fmax=2000.0)
        
        midi = MidiFile()
        track = MidiTrack()
        midi.tracks.append(track)

        threshold = 0.2
        last_note = None
        time_step = 480
        
        for time_idx in range(pitches.shape[1]):
            pitch = pitches[:, time_idx]
            magnitude = magnitudes[:, time_idx]
            
            idx = magnitude.argmax()
            if magnitude[idx] > threshold:
                midi_note = librosa.hz_to_midi(pitch[idx])
                midi_note = int(np.round(midi_note))
                
                if midi_note != last_note:
                    track.append(Message('note_on', note=midi_note, velocity=64, time=0))
                    track.append(Message('note_off', note=midi_note, velocity=64, time=time_step))
                    last_note = midi_note

        midi.save(midi_file)
        
    def mp3tomidi(self, mp3_file, midi_file):
            """
            Convert an MP3 file to a MIDI file by estimating pitches.
            """
            # Load the MP3 file
            y, sr = librosa.load(mp3_file, sr=22050)
            
            # Harmonic separation for pitch tracking
            y_harmonic = librosa.effects.harmonic(y)
            
            pitches, magnitudes = librosa.piptrack(y=y_harmonic, sr=sr, fmin=50.0, fmax=2000.0)
            
            # Create MIDI file and track
            midi = MidiFile()
            track = MidiTrack()
            midi.tracks.append(track)

            threshold = 0.1  
            last_note = None
            hop_length = 512  
            time_step = int((hop_length / sr) * 1000)  
            
            # Process each frame
            for time_idx in range(pitches.shape[1]):
                pitch = pitches[:, time_idx]
                magnitude = magnitudes[:, time_idx]
                
                idx = magnitude.argmax()
                if magnitude[idx] > threshold and pitch[idx] > 0: 
                    midi_note = librosa.hz_to_midi(pitch[idx])
                    midi_note = int(np.round(midi_note))
                    
                    if midi_note != last_note:
                        velocity = int(np.clip(magnitude[idx] * 127, 0, 127)) 
                        track.append(Message('note_on', note=midi_note, velocity=velocity, time=0))
                        track.append(Message('note_off', note=midi_note, velocity=velocity, time=time_step))
                        last_note = midi_note
            
            midi.save(midi_file)
    
    def wav2midi(self, wav_file, midi_file):
        """
        Convert a WAV file to a MIDI file by estimating pitches.
        """
        y, sr = librosa.load(wav_file, sr=22050)  
        
        y_harmonic = librosa.effects.harmonic(y)
        
        pitches, magnitudes = librosa.piptrack(y=y_harmonic, sr=sr, fmin=50.0, fmax=2000.0)
        
        midi = MidiFile()
        track = MidiTrack()
        midi.tracks.append(track)

        threshold = 0.2
        last_note = None
        time_step = 480
        
        for time_idx in range(pitches.shape[1]):
            pitch = pitches[:, time_idx]
            magnitude = magnitudes[:, time_idx]
            
            idx = magnitude.argmax()
            if magnitude[idx] > threshold:
                midi_note = librosa.hz_to_midi(pitch[idx])
                midi_note = int(np.round(midi_note))
                
                if midi_note != last_note:
                    track.append(Message('note_on', note=midi_note, velocity=64, time=0))
                    track.append(Message('note_off', note=midi_note, velocity=64, time=time_step))
                    last_note = midi_note

        midi.save(midi_file)

    def extract_midi_notes(self, midi_file):
        """
        Extract MIDI notes from a MIDI file
        """
        midi = MidiFile(midi_file)
        notes = []
        for track in midi.tracks:
            for msg in track:
                if msg.type == 'note_on' and msg.velocity > 0:
                    notes.append(msg.note)
        return notes

    def atb(self, midi_notes):
        """
        Absolute Tone Based (ATB) feature extraction.
        """
        return np.clip(midi_notes, 0, 127)
        
    def rtb(self, midi_notes):
        """
        Relative Tone Based (RTB) feature extraction.
        """
        relative_tones = np.clip(np.array(midi_notes) - self.reference_note, -127, 127)
        return relative_tones
    
    def ftb(self, midi_notes):
        """
        First Tone Based (FTB) feature extraction.
        """
        if not midi_notes:
            return []

        first_note = midi_notes[0]
        first_tone_based = np.array(midi_notes) - first_note
        return first_tone_based
    
    def histogram(self, data):
        """
        Generate a histogram of MIDI notes.
        """
        return np.histogram(data, bins=128, range=(0, 127))[0]
    
    def similarity(self, hist1, hist2, method='cosine'):
        """
        Calculate similarity between two histograms.
        """
        if method == 'cosine':
            return np.dot(hist1, hist2) / (np.linalg.norm(hist1) * np.linalg.norm(hist2))
        else:
            raise ValueError('Invalid similarity method')
        