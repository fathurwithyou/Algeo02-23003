import React from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

type SongCardProps = {
  fileName: string;
  onPlay: () => void;
  isLoading: boolean;
};

const SongCard: React.FC<SongCardProps> = ({ fileName, onPlay, isLoading }) => {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg shadow-sm mb-2">
      <span className="text-lg font-medium">{fileName}</span>
      <Button variant="ghost" size="icon" onClick={onPlay} disabled={isLoading}>
        <PlayIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default SongCard;
