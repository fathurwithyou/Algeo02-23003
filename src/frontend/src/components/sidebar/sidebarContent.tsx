"use client";
import Image from "next/image";
import { useImagePreviewStore } from "@/store/useImagePreviewStore";
import { ImageForm } from "../form/ImageForm";
import { SongForm } from "../form/SongForm";

// image
export const SaluSidebarContent = () => {
  const { image } = useImagePreviewStore();
  return (
    <div>
      {/* <InputFile /> */}
      {image && (
        <Image
          width={500}
          height={500}
          src={URL.createObjectURL(image)}
          alt="Preview"
        />
      )}
      <ImageForm />
      <SongForm />
    </div>
  );
};
