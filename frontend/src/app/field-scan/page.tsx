"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, Sparkles, Video } from "lucide-react";
import { analyzeFieldVideo, type FieldVideoReport } from "@/lib/ai/veo";
import { useFarmerStore } from "@/lib/farmer-store";
import { M3Card, PrimaryButton } from "@/components/ui/m3";

function FieldInner() {
  const router = useRouter();
  const params = useSearchParams();
  const auto = params.get("demo") === "1";
  const { language, demoMode } = useFarmerStore();
  const rw = language === "rw";
  const [phase, setPhase] = useState<"ready" | "scanning" | "result">(auto ? "scanning" : "ready");
  const [step, setStep] = useState("");
  const [report, setReport] = useState<FieldVideoReport | null>(null);

  useEffect(() => {
    if (auto) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  async function run() {
    setPhase("scanning");
    const data = await analyzeFieldVideo({ language, onStep: setStep });
    setReport(data);
    setPhase("result");
  }

  return (
    <main className="min-h-dvh px-5 pb-tabbar pt-4">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">{rw ? "Video y'Umurima" : "AI Field Video"}</h1>
        <span className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "ready" ? (
          <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex h-64 flex-col items-center justify-center rounded-[28px] bg-gradient-to-br from-[#1B5E20] to-[#4285F4] text-white shadow-lg">
              <Video className="h-12 w-12 opacity-90" />
              <p className="mt-3 text-lg font-bold">
                {rw ? "Video y'umurima (10s)" : "10s farm walkthrough"}
              </p>
              <p className="mt-1 text-sm text-white/75">Veo 3 · frame intelligence</p>
            </div>
            <PrimaryButton variant="blue" onClick={run}>
              <Sparkles className="h-5 w-5" />
              {rw ? "Tangira Veo 3 Scan" : "Start Veo 3 Analysis"}
            </PrimaryButton>
            {demoMode ? (
              <p className="text-center text-xs text-[#1B1C1A]/45">
                Demo Mode — guaranteed cinematic results
              </p>
            ) : null}
          </motion.div>
        ) : null}

        {phase === "scanning" ? (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative h-64 overflow-hidden rounded-[28px] bg-[#1B5E20]">
              <motion.div
                className="absolute inset-x-0 h-1 bg-[#FBBC04] shadow-[0_0_20px_#FBBC04]"
                animate={{ top: ["8%", "90%", "8%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(234,67,53,0.35),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_55%,rgba(251,188,4,0.25),transparent_35%)]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/50 p-3 text-white backdrop-blur">
                <p className="text-xs font-bold uppercase text-[#FBBC04]">Veo 3</p>
                <p className="text-sm font-semibold">{step}</p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {phase === "result" && report ? (
          <motion.div key="res" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative h-56 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#66BB6A] to-[#2E7D32]">
              {report.hotspots.map((h) => (
                <motion.span
                  key={h.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 + h.intensity * 0.4 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${h.x * 100}%`,
                    top: `${h.y * 100}%`,
                    width: 30 + h.intensity * 50,
                    height: 30 + h.intensity * 50,
                    background: `radial-gradient(circle, rgba(234,67,53,${0.6 + h.intensity * 0.3}) 0%, transparent 70%)`,
                  }}
                />
              ))}
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-black/55 px-3 py-2 text-white">
                <p className="text-xs font-bold uppercase text-[#FBBC04]">Field Analysis</p>
                <p className="font-semibold">
                  {rw ? "Ahantu handuye" : "Affected area"}: {report.affectedArea}%
                </p>
              </div>
            </div>

            <M3Card>
              <h2 className="text-xl font-extrabold">{rw ? report.diseaseRw : report.disease}</h2>
              <p className="mt-1 text-sm text-[#1B1C1A]/60">
                {rw ? report.fieldRw : report.field} · {Math.round(report.confidence * 100)}%
              </p>
              <div className="mt-3 flex items-start gap-2 rounded-[16px] bg-[#4285F4]/10 px-3 py-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-[#4285F4]" />
                {rw ? report.locationRw : report.location}
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                {rw ? report.recommendationRw : report.recommendation}
              </p>
            </M3Card>

            <PrimaryButton variant="danger" onClick={() => router.push("/escalate")}>
              <Phone className="h-4 w-4" />
              {rw ? "Huza n'umukozi" : "Contact Officer"}
            </PrimaryButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

export default function FieldScanPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">Loading...</div>}>
      <FieldInner />
    </Suspense>
  );
}
