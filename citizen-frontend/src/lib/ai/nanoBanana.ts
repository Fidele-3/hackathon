import { DEMO_CASES, type DiagnosisResult } from "@/data/demo";
import { sleep } from "@/lib/utils";

/** Nano Banana — on-device / offline-first quick diagnosis. */
export async function quickLocalDiagnosis(params?: {
  onStep?: (s: string) => void;
}): Promise<{ offline: true; result: DiagnosisResult; syncedAt: string }> {
  params?.onStep?.("Nano Banana ready");
  await sleep(400);
  params?.onStep?.("Running on-device vision...");
  await sleep(700);
  params?.onStep?.("Instant advice ready");
  await sleep(400);

  return {
    offline: true,
    result: DEMO_CASES["maize-blight"].diagnosis,
    syncedAt: new Date().toLocaleDateString(),
  };
}

export function offlineStatus() {
  return {
    active: typeof navigator !== "undefined" ? !navigator.onLine : false,
    label: "Offline Mode Active",
    lastSynced: "Today",
  };
}
