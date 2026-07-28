"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Phone, Sparkles } from "lucide-react";
import { DEMO_CASES, type DemoCaseId, type DiagnosisResult } from "@/data/demo";
import { analyzeCropImage } from "@/lib/ai/gemini";
import { quickLocalDiagnosis } from "@/lib/ai/nanoBanana";
import { useFarmerStore } from "@/lib/farmer-store";
import { HealthRing, M3Card, PrimaryButton } from "@/components/ui/m3";

function DiagnoseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const demoId = (params.get("demo") as DemoCaseId | null) || null;
  const { language, offlineMode, demoMode } = useFarmerStore();
  const rw = language === "rw";

  const [phase, setPhase] = useState<"pick" | "analyzing" | "result">("pick");
  const [stepLabel, setStepLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState<string | null>(demoId ? DEMO_CASES[demoId].image : null);
  const [caseId, setCaseId] = useState<DemoCaseId>(demoId || "maize-blight");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    if (demoId) {
      setImage(DEMO_CASES[demoId].image);
      setCaseId(demoId);
      void run(demoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoId]);

  async function run(id: DemoCaseId = caseId) {
    setPhase("analyzing");
    setProgress(8);
    const tick = window.setInterval(() => setProgress((p) => Math.min(p + 8, 92)), 280);

    let diagnosis: DiagnosisResult;
    if (offlineMode) {
      const local = await quickLocalDiagnosis({ onStep: setStepLabel });
      diagnosis = local.result;
    } else {
      diagnosis = await analyzeCropImage({
        caseId: id,
        language,
        onStep: setStepLabel,
      });
    }
    clearInterval(tick);
    setProgress(100);
    setResult(diagnosis);
    setPhase("result");

    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(rw ? diagnosis.simpleRw : diagnosis.simple);
      utter.lang = rw ? "rw-RW" : "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }

  return (
    <main className="min-h-dvh px-5 pb-tabbar pt-4">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">{rw ? "Suzuma Igihingwa" : "Crop Doctor"}</h1>
        <span className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "pick" ? (
          <motion.div key="pick" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="overflow-hidden rounded-[28px] bg-black shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image || DEMO_CASES["maize-blight"].image}
                alt="Crop"
                className="h-64 w-full object-cover"
              />
            </div>
            <p className="text-sm font-semibold text-[#1B1C1A]/70">
              {rw ? "Hitamo demo case cyangwa tangira isuzuma" : "Pick a demo case or start analysis"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_CASES) as DemoCaseId[]).slice(0, 4).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCaseId(id);
                    setImage(DEMO_CASES[id].image);
                  }}
                  className={`overflow-hidden rounded-[20px] border-2 text-left ${
                    caseId === id ? "border-[#2E7D32]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={DEMO_CASES[id].image} alt="" className="h-20 w-full object-cover" />
                  <p className="bg-white p-2 text-[11px] font-bold">
                    {rw ? DEMO_CASES[id].titleRw : DEMO_CASES[id].title}
                  </p>
                </button>
              ))}
            </div>
            <PrimaryButton onClick={() => run(caseId)}>
              <Sparkles className="h-5 w-5" />
              {offlineMode
                ? rw
                  ? "Nano Banana · Suzuma"
                  : "Nano Banana · Analyze"
                : rw
                  ? "Suzuma na Gemini"
                  : "Analyze with Gemini"}
            </PrimaryButton>
          </motion.div>
        ) : null}

        {phase === "analyzing" ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-[28px] p-6"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative mb-4 h-20 w-20">
                <div
                  className="gemini-ring absolute inset-0 animate-spin rounded-full"
                  style={{ animationDuration: "2s" }}
                />
                <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-[#F7FAF6]">
                  <span className="shimmer-text text-sm font-bold">
                    {offlineMode ? "Nano" : "Gemini"}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-extrabold">{stepLabel || "…"}</h2>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#E8F5E9]">
              <motion.div
                className="h-full rounded-full bg-[#2E7D32]"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        ) : null}

        {phase === "result" && result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <M3Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#2E7D32]">
                    {rw ? "Diagnosis" : "Diagnosis"}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold leading-tight">
                    {rw ? result.diseaseRw : result.disease}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                        result.severity === "high"
                          ? "bg-[#EA4335]/15 text-[#EA4335]"
                          : result.severity === "medium"
                            ? "bg-[#FBBC04]/25 text-[#1B1C1A]"
                            : "bg-[#34A853]/15 text-[#34A853]"
                      }`}
                    >
                      {rw
                        ? result.severity === "high"
                          ? "Ikomeye"
                          : result.severity === "medium"
                            ? "Giciriritse"
                            : "Ntacyo"
                        : result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                    </span>
                    <span className="text-sm text-[#1B1C1A]/60">
                      {rw ? "Ahantu" : "Area"}: {result.affectedArea}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#EA4335]">
                    {rw ? "Akaga" : "Risk"}: {rw ? result.riskRw : result.risk}
                  </p>
                </div>
                <HealthRing value={result.confidence * 100} size={88} />
              </div>

              <div className="mt-4 rounded-[20px] bg-[#E8F5E9] p-4">
                <p className="text-xs font-bold uppercase text-[#2E7D32]">
                  {simple ? (rw ? "Bisobanuye byoroshye" : "Explain simply") : rw ? "Inama" : "Treatment"}
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  {simple
                    ? rw
                      ? result.simpleRw
                      : result.simple
                    : (rw ? result.recommendationRw : result.recommendation).map((r, i) => (
                        <span key={r} className="block">
                          {i + 1}. {r}
                        </span>
                      ))}
                </p>
              </div>

              <ul className="mt-4 space-y-1.5">
                {(rw ? result.evidenceRw : result.evidence).map((e) => (
                  <li key={e} className="flex gap-2 text-sm text-[#1B1C1A]/80">
                    <span className="text-[#34A853]">•</span>
                    {e}
                  </li>
                ))}
              </ul>
            </M3Card>

            <div className="flex gap-2">
              <PrimaryButton variant="ghost" className="!w-auto flex-1" onClick={() => setSimple((v) => !v)}>
                {rw ? "Sobanura byoroshye" : "Explain Simply"}
              </PrimaryButton>
              <PrimaryButton variant="danger" className="!w-auto flex-1" onClick={() => router.push("/escalate")}>
                <Phone className="h-4 w-4" />
                {rw ? "Umukozi" : "Officer"}
              </PrimaryButton>
            </div>
            {demoMode ? (
              <PrimaryButton variant="blue" onClick={() => router.push("/field-scan?demo=1")}>
                {rw ? "Komeza · Video Sweep" : "Continue · Field Video"}
              </PrimaryButton>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">Loading...</div>}>
      <DiagnoseInner />
    </Suspense>
  );
}
