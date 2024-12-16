"use client";

import React, { useState, useEffect } from "react";
import AudioPlayer from "../components/audio/audio-player";
import SongCard from "@/components/ui/song-card";

const ITEMS_PER_PAGE = 5;

export default function Home() {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [mapper, setMapper] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useMapper, setUseMapper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [imagePredictionResult, setImagePredictionResult] = useState<
    { picName: string; distance: number }[]
  >([]);
  const [audioPredictionResult, setAudioPredictionResult] = useState<
    { audioName: string; similarity: number }[]
  >([]);
  const [isPredictImage, setIsPredictImage] = useState(false);
  const [isPredictAudio, setIsPredictAudio] = useState(false);

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

    const fetchImageFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/get/images");
        if (!response.ok) {
          throw new Error("Failed to fetch image files");
        }
        const data = await response.json();
        setImageFiles(data.images);
      } catch (error) {
        console.error("Error fetching image files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
    fetchImageFiles();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchMapper = async () => {
    try {
      const response = await fetch("http://localhost:5000/get/mapper");
      if (!response.ok) {
        throw new Error("Failed to fetch mapper");
      }
      const mapperData = await response.json();
      setMapper(mapperData);
      setUseMapper(true);
    } catch (error) {
      console.error("Error fetching mapper:", error);
    }
  };

  const resetMapper = () => {
    setMapper({});
    setUseMapper(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedAudio(event.target.files[0]);
    }
  };

  const handleImagePredict = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("http://localhost:5000/predict/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to predict image");
      }

      const result = await response.json();
      const mappedResults = result.results.map((item: [string, number]) => ({
        picName: item[0],
        distance: item[1],
      }));
      setImagePredictionResult(mappedResults);
      setTotalPages(Math.ceil(mappedResults.length / ITEMS_PER_PAGE));
      setIsPredictImage(true);
      setIsPredictAudio(false);
      fetchMapper();
    } catch (error) {
      console.error("Error predicting image:", error);
    }
  };

  const handleAudioPredict = async () => {
    if (!selectedAudio) return;

    const formData = new FormData();
    formData.append("audio", selectedAudio);

    try {
      const response = await fetch("http://localhost:5000/predict/audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to predict audio");
      }

      const result = await response.json();
      const mappedResults = result.results.map((item: [string, number]) => ({
        audioName: item[0],
        similarity: item[1],
      }));
      setAudioPredictionResult(mappedResults);
      setTotalPages(Math.ceil(mappedResults.length / ITEMS_PER_PAGE));
      setIsPredictAudio(true);
      setIsPredictImage(false);
      fetchMapper();
    } catch (error) {
      console.error("Error predicting audio:", error);
    }
  };

  const resetPredictions = () => {
    setIsPredictImage(false);
    setIsPredictAudio(false);
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
  const currentImagePredictionResults = imagePredictionResult.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const currentAudioPredictionResults = audioPredictionResult.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="flex-grow flex flex-col justify-between">
      <div className="h-full p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">Audio Files</h1>
          <button
            className="px-4 py-2 bg-blue-500 text-white mb-4"
            onClick={fetchMapper}
          >
            Use Mapper
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white mb-4"
            onClick={resetMapper}
          >
            Reset Mapper
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white mb-4"
            onClick={resetPredictions}
          >
            Reset Predictions
          </button>

          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Upload and Predict Image</h2>
            <input type="file" onChange={handleImageUpload} accept="image/*" />
            <button
              className="px-4 py-2 bg-green-500 text-white mt-2"
              onClick={handleImagePredict}
            >
              Predict Image
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Upload and Predict Audio</h2>
            <input type="file" onChange={handleAudioUpload} accept="audio/*" />
            <button
              className="px-4 py-2 bg-green-500 text-white mt-2"
              onClick={handleAudioPredict}
            >
              Predict Audio
            </button>
          </div>
          <ul>
            {!isPredictImage && !isPredictAudio && (
              <>
                {currentAudioFiles.length > 0 ? (
                  currentAudioFiles.map((file, index) => (
                    <li key={index}>
                      <SongCard
                        audioName={file}
                        picName={useMapper ? mapper[file] : undefined}
                        onPlay={() => handlePlay(file)}
                        isLoading={loading}
                      />
                    </li>
                  ))
                ) : (
                  <p>No audio files available.</p>
                )}
              </>
            )}
            {isPredictImage && !isPredictAudio && (
              <ul>
                {currentImagePredictionResults.map((result, index) => (
                  <li key={index}>
                    <SongCard
                      picName={result.picName}
                      distance={result.distance}
                      mapper={mapper}
                      onPlay={() => {}}
                      isLoading={loading}
                    />
                  </li>
                ))}
              </ul>
            )}
            {isPredictAudio && !isPredictImage && (
              <ul>
                {currentAudioPredictionResults.map((result, index) => (
                  <li key={index}>
                    <SongCard
                      audioName={result.audioName}
                      similarity={result.similarity}
                      mapper={mapper}
                      onPlay={() => handlePlay(result.audioName)}
                      isLoading={loading}
                    />
                  </li>
                ))}
              </ul>
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
                disabled={loading} // Disable page navigation while loading
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
