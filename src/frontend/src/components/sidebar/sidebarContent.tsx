"use client";
import React from "react";
import { ImageForm } from "../form/ImageForm";
import { SongForm } from "../form/SongForm";
import { MapperForm } from "../form/MapperForm";
import { ThemeTogglerBtn } from "../theme/ThemeTogglerBtn";
import ResetButton from "../sidebarButtons/resetButton";
import { SearchForm } from "../form/searchForm";
import MicButton from "../sidebarButtons/micButton";

export const SaluSidebarContent = () => {
  return (
    <div className="h-full flex flex-col gap-4 p-4 items-center justify-between">
      <div className="h-full flex flex-col gap-4 items-center">
        <SearchForm />
        <MicButton />
      </div>
      <div className="w-full flex flex-col gap-4 items-center justify-center">
        <ThemeTogglerBtn />
        <ImageForm />
        <SongForm />
        <MapperForm />
        <ResetButton />
      </div>
    </div>
  );
};
