import { create } from "zustand";

type PredictionResult = [string, number];

type PredictionStore = {
  prediction: PredictionResult[] | null;
  setPrediction: (prediction: PredictionResult[] | null) => void;
};

export const usePredictionStore = create<PredictionStore>((set) => ({
  prediction: null,
  setPrediction: (prediction) => set({ prediction }),
}));

export const usePrediction = () =>
  usePredictionStore((state) => state.prediction);
export const useSetPrediction = () =>
  usePredictionStore((state) => state.setPrediction);
