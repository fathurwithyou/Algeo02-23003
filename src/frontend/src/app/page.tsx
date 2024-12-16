"use client";

import React, { useState, useEffect } from "react";
import AudioPlayer from "../components/audio/audio-player";
import SongCard from "@/components/ui/song-card";
import { useAudioRecorder, AudioRecorder } from "react-audio-voice-recorder";
import { useIsReloading, useSetIsReloading } from "@/store/useReloadStore";
import { usePrediction } from "@/store/usePredictionStore";

const ITEMS_PER_PAGE = 5;
const RECORD_TIME = 5;

export default function Home() {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [mapper, setMapper] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const recorderControls = useAudioRecorder();

  const [audioUrl, setAudioUrl] = useState<any>(null);

  const isReloading = useIsReloading();
  const setIsReloading = useSetIsReloading();
  const predictionsResult = usePrediction();

  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/get/songs");
        if (!response.ok) {
          throw new Error("Failed to fetch audio files");
        }
        const data = await response.json();
        setAudioFiles(data.songs);
        setTotalPages(Math.ceil(data.songs.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching audio files:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchMapper = async () => {
      try {
        const response = await fetch("http://localhost:5000/get/mapper");
        if (!response.ok) {
          throw new Error("Failed to fetch mapper");
        }
        const mapperData = await response.json();
        setMapper(mapperData);
      } catch (error) {
        console.error("Error fetching mapper:", error);
      }
    };

    console.log(predictionsResult?.results);
    fetchMapper();
    setIsReloading(false);
    fetchAudioFiles();
  }, [isReloading, setIsReloading, predictionsResult]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePlay = (audioName: string) => {
    const audioPath = `/audio/${audioName}`;
    setSelectedFile(audioPath);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAudioFiles = audioFiles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const currentPredictionResults = predictionsResult?.results || [];

  const recordComplete = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url); // Store the URL in state
    // download
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio.wav";
    a.click();
  };

  useEffect(() => {
    if (recorderControls.recordingTime == RECORD_TIME + 1) {
      recorderControls.stopRecording();
    }
  }, [recorderControls.recordingTime]);

  return (
    <div className="flex-grow flex flex-col justify-between">
      <div className="h-full p-4 flex flex-col justify-between">
        <div>
          <div style={{ display: "none" }}>
            <AudioRecorder
              onRecordingComplete={(blob) => recordComplete(blob)}
              recorderControls={recorderControls}
            />
          </div>
          <button onClick={recorderControls.startRecording}>
            Start recording
          </button>
          <ul>
            {!predictionsResult ? (
              <>
                {currentAudioFiles.length > 0 ? (
                  currentAudioFiles.map((file, index) => (
                    <li key={index}>
                      <SongCard
                        audioName={file}
                        mapper={mapper}
                        onPlay={() => handlePlay(file)}
                        isLoading={loading}
                      />
                    </li>
                  ))
                ) : (
                  <p>No audio files available.</p>
                )}
              </>
            ) : (
              <>
                {currentPredictionResults.length > 0 ? (
                  currentPredictionResults.map(([name, value], index) => (
                    <li key={index}>
                      <SongCard
                        audioName={name}
                        picName={name}
                        mapper={mapper}
                        onPlay={() => handlePlay(name)}
                        isLoading={loading}
                        similarity={value}
                        distance={value}
                      />
                    </li>
                  ))
                ) : (
                  <p>No prediction results available.</p>
                )}
              </>
            )}
          </ul>
        </div>

        <div className="flex justify-center mt-4">
          {totalPages > 1 &&
            Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`px-4 py-2 mx-1 ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-secondary"
                }`}
                onClick={() => handlePageChange(index + 1)}
                disabled={loading}
              >
                {index + 1}
              </button>
            ))}
        </div>
      </div>

      <div className="w-full h-fit flex flex-row justify-center items-center">
        <AudioPlayer src={selectedFile} />
      </div>
    </div>
  );
}
