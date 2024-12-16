import { create } from "zustand";

type ImagePreviewStore = {
  image: File | null;
  setImage: (image: File | null) => void;
};

export const useImagePreviewStore = create<ImagePreviewStore>((set) => ({
  image: null,
  setImage: (image) => set({ image }),
}));

export const useImagePreview = () =>
  useImagePreviewStore((state) => state.image);
export const useSetImagePreview = () =>
  useImagePreviewStore((state) => state.setImage);
