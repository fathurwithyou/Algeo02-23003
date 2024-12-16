import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

type SongCardProps = {
  audioName?: string;
  picName?: string;
  mapper?: Record<string, string>;
  onPlay: () => void;
  isLoading: boolean;
};

const SongCard: React.FC<SongCardProps> = ({
  audioName,
  picName,
  mapper,
  onPlay,
  isLoading,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const imageName = audioName && mapper?.[audioName] ? mapper[audioName] : null;
  const songName = picName && mapper?.[picName] ? mapper[picName] : null;

  return (
    <div
      className="flex justify-between items-center p-4 rounded-lg hover:bg-slate-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlay}
          disabled={isLoading}
        >
          <PlayIcon className="w-6 h-6" />
        </Button>
      ) : (
        <div className="w-9 h-9 flex items-center justify-center text-gray-500">
          {picName ? (
            <p>{picName}</p>
          ) : imageName ? (
            <p>{imageName}</p>
          ) : (
            <p>Image Not Provided</p>
          )}
        </div>
      )}
      <span className="text-lg font-medium">{audioName || songName}</span>
    </div>
  );
};

export default SongCard;
