"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, Volume2Icon } from "lucide-react";
import Progress from "../ui/progress";
import { Card, CardContent } from "../ui/card";

type AudioPlayerProps = {
  file: File | null;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ file }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1); // Volume state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioSrc(objectUrl);
      setFileName(file.name);
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = objectUrl;
        audioRef.current.play();
      }
    } else {
      setAudioSrc(null);
      setFileName(null);
    }
  }, [file]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressChange = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const newProgress = (offsetX / rect.width) * 100;
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newProgress);
    }
  };

  const handleMouseDown = () => {
    if (audioRef.current) {
      isDragging.current = true;
      audioRef.current.pause();
    }
  };

  const handleMouseUp = () => {
    if (audioRef.current && isDragging.current) {
      isDragging.current = false;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="max-w-md w-full space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 p-8">
          <div className="text-center w-full">
            <h2 className="text-xl font-bold break-words">
              {fileName || "No Audio Selected"}
            </h2>
          </div>

          <div className="w-full flex justify-between items-center gap-1 text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <div
              className="w-full"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={(event) =>
                isDragging.current && handleProgressChange(event)
              }
              onClick={handleProgressChange}
            >
              <Progress value={progress} />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              disabled={!audioSrc}
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Volume2Icon className="w-6 h-6" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          {audioSrc && (
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPlayer;
