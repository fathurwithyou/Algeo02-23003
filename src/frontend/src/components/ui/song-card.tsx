import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

type SongCardProps = {
  audioName?: string;
  picName?: string;
  mapper?: Record<string, string>;
  atribute?: Record<string, string>;
  onPlay: () => void;
  isLoading: boolean;
  similarity?: number;
  distance?: number;
};

const SongCard: React.FC<SongCardProps> = ({
  audioName,
  picName,
  mapper,
  atribute,
  onPlay,
  isLoading,
  similarity,
}) => {
  let finalAudioName = audioName;
  let finalPicName = picName;
  let finalSimilarity = similarity;
  let finalDistance = similarity;

  if (
    audioName &&
    (audioName.endsWith(".png") ||
      audioName.endsWith(".jpg") ||
      audioName.endsWith(".jpeg"))
  ) {
    finalPicName = audioName;
    finalAudioName = undefined;
    finalSimilarity = undefined;
    finalDistance = similarity;
  }

  const imageName =
    finalAudioName && mapper?.[finalAudioName] ? mapper[finalAudioName] : null;
  const songName =
    finalPicName && mapper?.[finalPicName] ? mapper[finalPicName] : null;
  const imageSrc =
    finalPicName || imageName ? `/images/${finalPicName || imageName}` : null;

  return (
    <div className="flex justify-between items-center p-4 rounded-lg hover:bg-slate-300">
      <Button variant="ghost" size="icon" onClick={onPlay} disabled={isLoading}>
        <PlayIcon className="w-6 h-6" />
      </Button>
      <div className="w-9 h-9 flex items-center justify-center text-gray-500">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={finalPicName || imageName || "Image"}
            width={36}
            height={36}
          />
        ) : (
          <p></p>
        )}
      </div>
      <span className="text-lg font-medium">{finalAudioName || songName}</span>
      {(finalSimilarity !== undefined || finalDistance !== undefined) && (
        <div className="text-sm text-gray-500">
          {finalSimilarity !== undefined && (
            <p>Similarity: {(finalSimilarity * 100).toFixed(2)}%</p>
          )}
          {finalAudioName == undefined && (
            <p>Distance: {finalDistance.toFixed(2)}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SongCard;
