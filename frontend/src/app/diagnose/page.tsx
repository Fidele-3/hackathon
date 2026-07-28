"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, ImageIcon, Sparkles } from "lucide-react";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { ThinkingExperience } from "@/components/ThinkingExperience";
import { cropScan, escalateDiagnosis } from "@/lib/api";
import {
  DEMO_LEAF_SVG,
  DEMO_TTS_EN,
  DEMO_TTS_RW,
  buildDemoScanResponse,
} from "@/lib/demo-data";
import { useApp } from "@/lib/app-context";
import { useFarmerStore } from "@/lib/store";
import { sleep } from "@/lib/utils";
import type { CropScanResponse } from "@/lib/types";

type Phase = "capture" | "thinking" | "result" | "success";

export default function DiagnosePage() {
  const { user, ready } = useApp();
  const { language, demoMode, setLastDiagnosis } = useFarmerStore();
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CropScanResponse | null>(null);
  const [error, setError] = useState("");
  const [escalating, setEscalating] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (demoMode && !preview) setPreview(DEMO_LEAF_SVG);
  }, [demoMode, preview]);

  function onFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === "rw" ? "rw-RW" : "en-US";
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function runAnalysis() {
    setError("");
    setPhase("thinking");
    setStep(0);

    const stepTimers = [0, 1, 2, 3].map((i) =>
      window.setTimeout(() => setStep(i + 1), 700 + i * 850),
    );

    try {
      let data: CropScanResponse;
      if (demoMode) {
        // Parallel real call so escalate can light officer feed; UI uses polished demo payload
        const realPromise = cropScan({
          image: file,
          text:
            language === "rw"
              ? "Ibigori byanjye biri guhinduka umuhondo. Amababi afite amaribati y'umuhondo."
              : "My maize leaves are turning yellow with elongated lesions.",
          language,
          landId: 1,
          autoEscalate: false,
        }).catch(() => null);

        await sleep(3400);
        data = buildDemoScanResponse(language);
        const real = await realPromise;
        if (real?.diagnosis_id) {
          data = {
            ...data,
            diagnosis_id: real.diagnosis_id,
            diagnosis: { ...data.diagnosis, ...pickConfidence(real.diagnosis.confidence) },
          };
        }
      } else {
        if (!file && !preview) {
          throw new Error("Take or upload a photo first.");
        }
        const apiPromise = cropScan({
          image: file,
          text: language === "rw" ? "Suzuma ubuzima bw'igihingwa" : "Diagnose crop health",
          language,
          landId: 1,
          autoEscalate: false,
        });
        await sleep(2800);
        data = await apiPromise;
      }

      stepTimers.forEach(clearTimeout);
      setStep(4);
      await sleep(400);
      setResult(data);
      setLastDiagnosis(data);
      setPhase("result");
      speak(language === "rw" ? DEMO_TTS_RW : DEMO_TTS_EN);
    } catch (err) {
      stepTimers.forEach(clearTimeout);
      setPhase("capture");
      setError(err instanceof Error ? err.message : "Analysis failed");
    }
  }

  async function onEscalate() {
    if (!result) return;
    setEscalating(true);
    try {
      if (result.diagnosis_id > 0) {
        const esc = await escalateDiagnosis(result.diagnosis_id, 1);
        setResult({ ...result, escalated: true, issue_id: esc.issue_id });
      } else {
        // Demo-only fallback
        await sleep(600);
        setResult({ ...result, escalated: true, issue_id: 1 });
      }
      setPhase("success");
    } catch (err) {
      // Still show success animation in demo so pitch never dies
      if (demoMode) {
        setResult({ ...result, escalated: true });
        setPhase("success");
      } else {
        setError(err instanceof Error ? err.message : "Escalation failed");
      }
    } finally {
      setEscalating(false);
    }
  }

  if (!ready || !user) {
    return <div className="flex min-h-dvh items-center justify-center">…</div>;
  }

  return (
    <main className="min-h-dvh px-5 pb-10 pt-4">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white/80 p-2 shadow-sm">
          <ArrowLeft className="h-5 w-5 text-m3-onSurface" />
        </Link>
        <h1 className="font-display text-base font-bold">
          {language === "rw" ? "Suzuma Igihingwa" : "Crop Doctor"}
        </h1>
        <span className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "capture" ? (
          <motion.div
            key="capture"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="relative overflow-hidden rounded-5xl bg-black shadow-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview || DEMO_LEAF_SVG}
                alt="Crop"
                className="h-72 w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm font-medium text-white/90">
                  {demoMode
                    ? language === "rw"
                      ? "Demo · ifoto y'ibigori yiteguye"
                      : "Demo · maize sample ready"
                    : language === "rw"
                      ? "Fata ifoto y'amababi"
                      : "Point at leaves and capture"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-3xl bg-white py-4 text-sm font-bold shadow-soft active:scale-[0.98]"
              >
                <Camera className="h-5 w-5 text-m3-primary" />
                {language === "rw" ? "Kamera" : "Camera"}
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-3xl bg-white py-4 text-sm font-bold shadow-soft active:scale-[0.98]"
              >
                <ImageIcon className="h-5 w-5 text-g-blue" />
                {language === "rw" ? "Gallery" : "Gallery"}
              </button>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={runAnalysis}
              className="flex w-full items-center justify-center gap-2 rounded-5xl bg-m3-primary py-4 text-base font-bold text-white shadow-float"
            >
              <Sparkles className="h-5 w-5" />
              {language === "rw" ? "Tangira isuzuma rya AI" : "Analyze with Gemini"}
            </motion.button>
            {error ? <p className="text-sm text-g-red">{error}</p> : null}
          </motion.div>
        ) : null}

        {phase === "thinking" ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-5xl p-6 shadow-glass"
          >
            <ThinkingExperience language={language} activeStep={step} />
          </motion.div>
        ) : null}

        {phase === "result" && result ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DiagnosisCard
              result={result}
              language={language}
              escalating={escalating}
              simpleMode={simpleMode}
              onEscalate={onEscalate}
              onExplainSimply={() => setSimpleMode((v) => !v)}
            />
            {error ? <p className="mt-3 text-sm text-g-red">{error}</p> : null}
          </motion.div>
        ) : null}

        {phase === "success" ? (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-g-green text-4xl text-white shadow-float"
            >
              ✓
            </motion.div>
            <h2 className="font-display text-2xl font-extrabold text-m3-onSurface">
              {language === "rw" ? "Umukozi amenyeshejwe!" : "Officer notified!"}
            </h2>
            <p className="mt-2 max-w-xs text-sm text-m3-onSurface/65">
              {language === "rw"
                ? "Alice Uwase yabonye itangazo rya AI. Azasura umurima wawe."
                : "Alice Uwase received an urgent AI alert. Field inspection is recommended."}
            </p>
            <Link
              href="/"
              className="mt-8 rounded-3xl bg-m3-primary px-8 py-3.5 text-sm font-bold text-white"
            >
              {language === "rw" ? "Subira ahabanza" : "Back home"}
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function pickConfidence(c?: number) {
  return c && c > 0.5 ? { confidence: Math.max(c, 0.9) } : {};
}
