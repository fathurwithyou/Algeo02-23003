"use client";

import React, { useState } from "react";
import { TrashIcon } from "lucide-react"; // Import the trashcan icon from lucide-react
import { useSetIsReloading } from "@/store/useReloadStore";

const ResetButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setIsReloading = useSetIsReloading();

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/reset");

      if (response.ok) {
        console.log("API reset successful");
        setIsReloading(true);
      } else {
        console.error("Failed to reset API");
      }
    } catch (error) {
      console.error("Error resetting API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 ${
        isHovered ? "bg-red-500 shake" : "bg-secondary"
      }`}
      disabled={isLoading}
    >
      <TrashIcon className="w-6 h-6 text-white" />
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          50% {
            transform: translateX(2px);
          }
          75% {
            transform: translateX(-2px);
          }
        }
        .shake {
          animation: shake 0.5s;
        }
      `}</style>
    </button>
  );
};

export default ResetButton;
