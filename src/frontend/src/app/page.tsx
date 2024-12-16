"use client";

import React, { useState, useEffect } from "react";
import AudioPlayer from "../components/audio/audio-player";
import SongCard from "@/components/ui/song-card";
import { useIsReloading, useSetIsReloading } from "@/store/useReloadStore";
import { usePrediction } from "@/store/usePredictionStore";

const ITEMS_PER_PAGE = 5;

export default function Home() {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [mapper, setMapper] = useState<Record<string, string>>({});
  const [atribute, setAtribute] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isReloading = useIsReloading();
  const setIsReloading = useSetIsReloading();
  let predictionsResult = usePrediction();

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
        setMapper(mapperData[0]);
        setAtribute(mapperData[1]);
      } catch (error) {
        console.error("Error fetching mapper:", error);
      }
    };

    fetchMapper();
    setIsReloading(false);
    fetchAudioFiles();
    predictionsResult = null;
  }, [isReloading, setIsReloading]);

  useEffect(() => {
    console.log(predictionsResult?.results);
    setTotalPages(
      Math.ceil(predictionsResult?.results.length / ITEMS_PER_PAGE)
    );
  }, [predictionsResult]);

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

  const currentPredictionResults =
    predictionsResult?.results.slice(startIndex, startIndex + ITEMS_PER_PAGE) ||
    [];

  return (
    <div className="flex-grow flex flex-col justify-between">
      <div className="h-full p-4 flex flex-col justify-between">
        <div>
          <ul>
            {!predictionsResult ? (
              <>
                {currentAudioFiles.length > 0 ? (
                  currentAudioFiles.map((file, index) => (
                    <li key={index}>
                      <SongCard
                        audioName={file}
                        mapper={mapper}
                        atribute={atribute}
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
                        mapper={mapper}
                        atribute={atribute}
                        onPlay={() =>
                          handlePlay(
                            name.endsWith(".mp3") ||
                              name.endsWith(".wav") ||
                              name.endsWith(".m4a") ||
                              name.endsWith(".mid")
                              ? name
                              : mapper[name]
                          )
                        }
                        similarity={value}
                        isLoading={loading}
                      />
                    </li>
                  ))
                ) : (
                  <p>No audio files available.</p>
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
