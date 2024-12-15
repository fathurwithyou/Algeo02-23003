import numpy as np
import librosa
from mido import MidiFile, MidiTrack, Message

class AudioProcessor:
    def __init__(self, reference_note=60):
        self.reference_note = reference_note
        
    def wav2midi(self, wav_file, midi_file):
        """
        Convert a WAV file to a MIDI file by estimating pitches.
        """
        y, sr = librosa.load(wav_file, sr=None)
        y_harmonic, _ = librosa.effects.hpss(y)

        # Estimate pitches and magnitudes
        pitches, magnitudes = librosa.piptrack(y=y_harmonic, sr=sr)

        # Create a new MIDI file
        midi = MidiFile()
        track = MidiTrack()
        midi.tracks.append(track)

        # Threshold for note detection
        threshold = 0.1
        
        for time_idx in range(pitches.shape[1]):
            # Extract pitch at this frame
            pitch = pitches[:, time_idx]
            magnitude = magnitudes[:, time_idx]
            
            # Find the strongest pitch
            idx = magnitude.argmax()
            if magnitude[idx] > threshold:
                # Convert to MIDI note
                midi_note = librosa.hz_to_midi(pitch[idx])
                midi_note = int(np.round(midi_note))
                
                # Add note to the MIDI file
                track.append(Message('note_on', note=midi_note, velocity=64, time=0))
                track.append(Message('note_off', note=midi_note, velocity=64, time=480))
        
        # Save the MIDI file
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
        