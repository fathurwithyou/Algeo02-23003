"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useImagePreviewStore } from "@/store/useImagePreviewStore";
import { ImageForm } from "../form/ImageForm";
import { SongForm } from "../form/SongForm";
import { MapperForm } from "../form/MapperForm";

export const SaluSidebarContent = () => {
  const { image } = useImagePreviewStore();
  const [selectedForm, setSelectedForm] = useState<"image" | "song" | "mapper">(
    "image"
  );

  return (
    <div>
      <div className="flex justify-around mb-4 rounded-md">
        <button
          className={`px-4 py-2 ${
            selectedForm === "image" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedForm("image")}
        >
          Image Form
        </button>
        <button
          className={`px-4 py-2 ${
            selectedForm === "song" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedForm("song")}
        >
          Song Form
        </button>
        <button
          className={`px-4 py-2 ${
            selectedForm === "mapper" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedForm("mapper")}
        >
          Mapper Form
        </button>
      </div>

      {selectedForm === "image" && (
        <>
          {image && (
            <Image
              width={500}
              height={500}
              src={URL.createObjectURL(image)}
              alt="Preview"
            />
          )}
          <ImageForm />
        </>
      )}
      {selectedForm === "song" && <SongForm />}
      {selectedForm === "mapper" && <MapperForm />}
    </div>
  );
};
