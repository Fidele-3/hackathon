import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FarmingType } from "@/data/demo";
import type { CropScanResponse, Language } from "@/lib/types";

type FarmerStore = {
  onboarded: boolean;
  farmingType: FarmingType | null;
  language: Language;
  demoMode: boolean;
  offlineMode: boolean;
  lastDiagnosis: CropScanResponse | null;
  setOnboarded: (v: boolean) => void;
  setFarmingType: (t: FarmingType) => void;
  setLanguage: (l: Language) => void;
  setDemoMode: (v: boolean) => void;
  setOfflineMode: (v: boolean) => void;
  setLastDiagnosis: (d: CropScanResponse | null) => void;
  resetDemo: () => void;
};

export const useFarmerStore = create<FarmerStore>()(
  persist(
    (set) => ({
      onboarded: false,
      farmingType: null,
      language: "rw",
      demoMode: true,
      offlineMode: false,
      setOnboarded: (onboarded) => set({ onboarded }),
      setFarmingType: (farmingType) => set({ farmingType, onboarded: true }),
      setLanguage: (language) => set({ language }),
      setDemoMode: (demoMode) => set({ demoMode }),
      setOfflineMode: (offlineMode) => set({ offlineMode }),
      lastDiagnosis: null,
      setLastDiagnosis: (lastDiagnosis) => set({ lastDiagnosis }),
      resetDemo: () =>
        set({
          onboarded: false,
          farmingType: null,
          demoMode: true,
          offlineMode: false,
          lastDiagnosis: null,
        }),
    }),
    { name: "ehinga-farmer-demo" },
  ),
);
