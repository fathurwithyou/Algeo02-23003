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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [useMapper, setUseMapper] = useState(false);

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
        const response = await fetch("http://localhost:5000/get/songs");
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAudioFiles = audioFiles.slice(
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
          <ul>
            {currentAudioFiles.length > 0 ? (
              currentAudioFiles.map((file, index) => (
                <li key={index}>
                  <SongCard
                    audioName={file}
                    picName={useMapper ? mapper[file] : undefined}
                    onPlay={() => {}}
                    isLoading={loading}
                  />
                </li>
              ))
            ) : (
              <p>No audio files available.</p>
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
                    : "bg-gray-200"
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
        <AudioPlayer file={selectedFile} />
      </div>
    </div>
  );
}
