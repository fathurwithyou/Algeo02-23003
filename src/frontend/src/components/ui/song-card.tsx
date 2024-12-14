import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

type SongCardProps = {
  fileName: string;
  onPlay: () => void;
  isLoading: boolean;
  index: number;
};

const SongCard: React.FC<SongCardProps> = ({
  fileName,
  onPlay,
  isLoading,
  index,
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
          {index + 1}
        </div>
      )}
      <span className="text-lg font-medium">{fileName}</span>
    </div>
  );
};

export default SongCard;
