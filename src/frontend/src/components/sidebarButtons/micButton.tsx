"use client";

import React, { useEffect, useState } from "react";
import { useAudioRecorder, AudioRecorder } from "react-audio-voice-recorder";
import { LoaderIcon, CheckIcon, XIcon, MicIcon } from "lucide-react"; // Import icons from lucide-react
import { useSetPrediction } from "@/store/usePredictionStore"; // Import the prediction store

const RECORD_TIME = 5;

const MicButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isHovered, setIsHovered] = useState(false);
  const setPrediction = useSetPrediction();
  const recorderControls = useAudioRecorder();

  useEffect(() => {
    if (recorderControls.recordingTime == RECORD_TIME + 1) {
      recorderControls.stopRecording();
    }
  }, [recorderControls.recordingTime]);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsLoading(true);
    setUploadStatus("idle");

    console.log("Uploading recording...");
    try {
      const formData = new FormData();
      formData.append(
        "audio",
        new Blob([blob], { type: "audio/wav" }),
        "recording.wav"
      );

      const response = await fetch("http://localhost:5000/predict/audio", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPrediction(result);
        setUploadStatus("success");
        setTimeout(() => setUploadStatus("idle"), 2000);
        setIsHovered(false);
      } else {
        console.error("File upload failed");
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="hidden">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          recorderControls={recorderControls}
        />
      </div>
      <button
        type="button"
        onClick={recorderControls.startRecording}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center justify-center w-10 h-10 bg-secondary rounded-md transition-transform transform duration-300 ease-in-out ${
          isLoading || uploadStatus !== "idle"
            ? "scale-90"
            : isHovered
            ? "scale-110"
            : "scale-100"
        }`}
      >
        {isLoading ? (
          <LoaderIcon className="w-6 h-6 animate-spin" />
        ) : uploadStatus === "success" ? (
          <CheckIcon className="w-6 h-6" />
        ) : uploadStatus === "error" ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MicIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default MicButton;
