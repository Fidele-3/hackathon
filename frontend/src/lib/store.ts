import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CropScanResponse, Language } from "./types";

type FarmerStore = {
  language: Language;
  demoMode: boolean;
  setLanguage: (l: Language) => void;
  setDemoMode: (v: boolean) => void;
  lastDiagnosis: CropScanResponse | null;
  setLastDiagnosis: (d: CropScanResponse | null) => void;
};

export const useFarmerStore = create<FarmerStore>()(
  persist(
    (set) => ({
      language: "rw",
      demoMode: true,
      setLanguage: (language) => set({ language }),
      setDemoMode: (demoMode) => set({ demoMode }),
      lastDiagnosis: null,
      setLastDiagnosis: (lastDiagnosis) => set({ lastDiagnosis }),
    }),
    { name: "ehinga-farmer" },
  ),
);
