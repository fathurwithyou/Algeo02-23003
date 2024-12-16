"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, Volume2Icon } from "lucide-react";
import Progress from "../ui/progress";
import { Card, CardContent } from "../ui/card";
// @ts-ignore
import MidiPlayer from "react-midi-player";

type AudioPlayerProps = {
  file?: File | null;
  src?: string | null;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ file, src }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioSrc(objectUrl);
      setFileName(file.name);
    } else if (src) {
      setAudioSrc(src);
      setFileName(decodeURI(src.split("/").pop() || "Unknown"));
    } else {
      setAudioSrc(null);
      setFileName(null);
    }

    if (audioRef.current) {
      setProgress(0);
      setCurrentTime(0);
      setIsPlaying(false);
      audioRef.current.pause();
    }
  }, [file, src]);

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
    isDragging.current = true;
    audioRef.current?.pause();
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (isPlaying) {
        audioRef.current?.play();
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
  if (audioSrc && (audioSrc.endsWith(".mid") || audioSrc.endsWith(".midi"))) {
    return (
      <div className="max-w-md w-full space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <div className="text-center w-full">
              <h2 className="text-xl font-bold break-words">
                {fileName || "No Audio Selected"}
              </h2>
            </div>
            <MidiPlayer src={audioSrc} />
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="max-w-md w-full space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2">
          <div className="text-center w-full">
            <h2 className="text-xl font-bold break-words">
              {fileName || "No Audio Selected"}
            </h2>
          </div>

          <div className="w-full flex justify-between items-center gap-1 text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <div
              className="w-full h-5 flex items-center justify-center"
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
              className="rounded-full p-2"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6 scale-[1.5]" />
              ) : (
                <PlayIcon className="w-6 h-6 scale-[1.5]" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Volume2Icon className="w-4 h-4" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2"
              />
            </div>
          </div>
          {audioSrc && (
            <audio
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              controls={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPlayer;
