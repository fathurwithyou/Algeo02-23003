"use client";

import React, { useState, useEffect } from "react";
import AudioPlayer from "../components/audio/audio-player";
import SongCard from "@/components/ui/song-card";

const ITEMS_PER_PAGE = 5;

export default function Home() {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state for fetch requests

  useEffect(() => {
    const fetchAudioFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/audio-files?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const data = await response.json();
        setAudioFiles(data.files);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching audio files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFileSelect = (fileName: string) => {
    const filePath = `/songs/${fileName}`;
    setSelectedFilePath(filePath); // Pass the file path as a string
  };

  return (
    <div className="flex-grow flex flex-col justify-between">
      <div className="h-full p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">Audio Files</h1>
          <ul>
            {audioFiles?.length ?? 0 > 0 ? (
              audioFiles.map((file, index) => (
                <li key={index}>
                  <SongCard
                    // index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                    fileName={file}
                    onPlay={() => handleFileSelect(file)}
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
        <AudioPlayer src={selectedFilePath} />
      </div>

      {/* {loading && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-300 opacity-50 flex justify-center items-center text-xl">
            Loading...
          </div>
        )} */}
    </div>
  );
}
