import { FIELD_VIDEO_RESULT } from "@/data/demo";
import { sleep } from "@/lib/utils";

export type FieldVideoReport = typeof FIELD_VIDEO_RESULT & {
  confidence: number;
  hotspots: { x: number; y: number; intensity: number; label: string }[];
};

/** Veo 3 field video analysis — simulated cinematic pipeline for demo reliability. */
export async function analyzeFieldVideo(params: {
  language: "en" | "rw";
  onStep?: (step: string) => void;
}): Promise<FieldVideoReport> {
  const steps =
    params.language === "rw"
      ? [
          "Kohereza video...",
          "Veo 3 isuzuma frames...",
          "Gushakisha indwara...",
          "Gushushanya ahantu handuye...",
        ]
      : [
          "Uploading video...",
          "Veo 3 analyzing frames...",
          "Detecting disease patterns...",
          "Mapping affected areas...",
        ];

  for (const step of steps) {
    params.onStep?.(step);
    await sleep(850);
  }

  return {
    ...FIELD_VIDEO_RESULT,
    confidence: 0.94,
    hotspots: [
      { label: "NE", x: 0.78, y: 0.28, intensity: 0.9 },
      { label: "Mid", x: 0.48, y: 0.55, intensity: 0.55 },
      { label: "Edge", x: 0.22, y: 0.42, intensity: 0.35 },
    ],
  };
}
