// import { create } from "zustand";

// export const useReloadStore = create((set) => ({
//   reloadTrigger: false,
//   setReloadTrigger: () =>
//     set((state: { reloadTrigger: boolean }) => ({
//       reloadTrigger: !state.reloadTrigger,
//     })),
// }));

// useImagePreviewStore

import { create } from "zustand";

type TReload = {
  isReloading: boolean;
  setIsReloading: (isReloading: boolean) => void;
};

export const useReloadStore = create<TReload>((set) => ({
  isReloading: false,
  setIsReloading: (isReloading) => set({ isReloading }),
}));

export const useIsReloading = () =>
  useReloadStore((state) => state.isReloading);
export const useSetIsReloading = () =>
  useReloadStore((state) => state.setIsReloading);
