"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  CloudRain,
  Mic,
  Phone,
  Sparkles,
  Video,
  WifiOff,
} from "lucide-react";
import { DEMO_CASES, FARMER, TIMELINE, TREATMENT_CALENDAR, type FarmingType } from "@/data/demo";
import { BRAND, PRODUCT_STORY } from "@/data/brand";
import { BrandLogo, BrandMark } from "@/components/Brand";
import { InstallBanner } from "@/components/InstallBanner";
import { HealthRing, M3Card, PrimaryButton } from "@/components/ui/m3";
import { useFarmerStore } from "@/lib/farmer-store";

export default function FarmerAppPage() {
  const router = useRouter();
  const {
    onboarded,
    language,
    demoMode,
    offlineMode,
    setFarmingType,
    setLanguage,
    setDemoMode,
    setOfflineMode,
    resetDemo,
  } = useFarmerStore();
  const [step, setStep] = useState<"welcome" | "story" | "type">("welcome");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <BrandMark size={72} />
      </div>
    );
  }

  if (!onboarded) {
    return (
      <Onboarding
        step={step}
        setStep={setStep}
        language={language}
        setLanguage={setLanguage}
        onPickType={(t) => setFarmingType(t)}
        onSkipDemo={() => {
          setFarmingType("crop");
          setDemoMode(true);
          router.push("/diagnose?demo=maize-blight");
        }}
      />
    );
  }

  const rw = language === "rw";

  return (
    <main className="relative min-h-dvh px-5 pb-tabbar pt-3">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-tight text-[#1B5E20]">
              {BRAND.name}
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1B1C1A]/45">
              Smart Farms
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => setLanguage(rw ? "en" : "rw")}
            className="rounded-full bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#2E7D32] shadow-sm"
          >
            {rw ? "EN" : "RW"}
          </button>
          <button
            type="button"
            onClick={() => setDemoMode(!demoMode)}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold shadow-sm ${
              demoMode ? "bg-[#FBBC04] text-[#1B1C1A]" : "bg-white text-[#1B1C1A]/55"
            }`}
          >
            Demo
          </button>
          <button
            type="button"
            onClick={() => setOfflineMode(!offlineMode)}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold shadow-sm ${
              offlineMode ? "bg-[#4285F4] text-white" : "bg-white text-[#1B1C1A]/55"
            }`}
          >
            {offlineMode ? "Off" : "On"}
          </button>
        </div>
      </header>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1B1C1A]">
          {rw ? `Muraho, ${FARMER.firstName}` : `Hello, ${FARMER.firstName}`}
        </h1>
        <p className="mt-1 text-[15px] font-medium text-[#2E7D32]">
          {rw ? "Umurima wawe uri meza uyu munsi" : "Your farm looks healthy today"}
        </p>
      </motion.section>

      <M3Card className="mt-4">
        <div className="flex items-center gap-4">
          <HealthRing value={FARMER.farm.healthScore} size={96} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2E7D32]">
              {rw ? "Isuzuma ry'ubuzima" : "Farm health"}
            </p>
            <p className="mt-0.5 text-2xl font-extrabold text-[#1B1C1A]">
              {FARMER.farm.healthScore}%
            </p>
            <p className="text-sm text-[#1B1C1A]/60">
              {rw ? FARMER.farm.cropRw : FARMER.farm.crop} · {FARMER.farm.hectares} ha
            </p>
            <p className="text-xs text-[#1B1C1A]/45">
              {FARMER.location.district}, Rwanda
            </p>
          </div>
        </div>
      </M3Card>

      {/* What / How / When — compact product clarity */}
      <M3Card className="mt-3 !p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1B5E20]">
          {rw ? "Icyo dukemura" : "What it solves"}
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-[#1B1C1A]">
          {rw ? PRODUCT_STORY.solves.rw : PRODUCT_STORY.solves.en}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {PRODUCT_STORY.how.map((h) => (
            <div key={h.step} className="rounded-2xl bg-[#E8F5E9] px-2 py-2.5 text-center">
              <p className="text-lg font-extrabold text-[#2E7D32]">{h.step}</p>
              <p className="text-[11px] font-bold leading-tight">
                {rw ? h.titleRw : h.title}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[#1B1C1A]/60">
          <span className="font-bold text-[#2E7D32]">{rw ? "Iyo:" : "When:"} </span>
          {rw ? PRODUCT_STORY.when.rw : PRODUCT_STORY.when.en}
        </p>
      </M3Card>

      <InstallBanner />

      {offlineMode ? (
        <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-[#4285F4]/10 px-4 py-3 text-sm font-semibold text-[#4285F4]">
          <WifiOff className="h-4 w-4" />
          {rw ? "Offline · Nano Banana ready" : "Offline Mode · Nano Banana ready"}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <M3Card className="!p-4">
          <CloudRain className="h-5 w-5 text-[#4285F4]" />
          <p className="mt-2 text-[10px] font-bold uppercase text-[#1B1C1A]/45">
            {rw ? "Ikirere" : "Weather"}
          </p>
          <p className="text-sm font-bold">{rw ? "Imvura mu minsi 2" : "Rain in 2 days"}</p>
          <p className="text-xs text-[#1B1C1A]/55">
            {rw ? "Wirinde gufata umuti uyu munsi" : "Avoid spraying today"}
          </p>
        </M3Card>
        <M3Card className="!p-4">
          <AlertTriangle className="h-5 w-5 text-[#FBBC04]" />
          <p className="mt-2 text-[10px] font-bold uppercase text-[#1B1C1A]/45">
            {rw ? "Iburira" : "AI risk"}
          </p>
          <p className="text-sm font-bold">{rw ? "Ubushyuhe bukiri" : "Humidity rising"}</p>
          <p className="text-xs text-[#1B1C1A]/55">
            {rw ? "Suzuma amababi" : "Scout leaves soon"}
          </p>
        </M3Card>
      </div>

      {demoMode ? (
        <M3Card className="mt-4 border border-[#FBBC04]/40 bg-[#FBBC04]/12">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#1B1C1A]/55">
            Judge Demo Mode
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1B1C1A]/80">
            {rw
              ? "Ifoto → Diagnosis → Veo → Umukozi"
              : "Photo → Diagnosis → Veo → Officer"}
          </p>
          <PrimaryButton
            className="mt-3"
            onClick={() => {
              setDemoMode(true);
              router.push("/diagnose?demo=maize-blight");
            }}
          >
            <Sparkles className="h-5 w-5" />
            {rw ? "Tangira Demo yuzuye" : "Run full demo journey"}
          </PrimaryButton>
        </M3Card>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-extrabold">{rw ? "Ibikorwa byihuse" : "Quick actions"}</h2>
        <div className="space-y-3">
          <PrimaryButton onClick={() => router.push("/diagnose")}>
            <Camera className="h-5 w-5" />
            {rw ? "Suzuma Igihingwa" : "Diagnose Crop"}
          </PrimaryButton>
          <PrimaryButton variant="blue" onClick={() => router.push("/field-scan")}>
            <Video className="h-5 w-5" />
            {rw ? "Analiza Video y'Umurima" : "Analyze Farm Video"}
          </PrimaryButton>
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton variant="ghost" onClick={() => router.push("/chat?voice=1")}>
              <Mic className="h-4 w-4 text-[#2E7D32]" />
              {rw ? "Baza AI" : "Ask AI"}
            </PrimaryButton>
            <PrimaryButton variant="danger" onClick={() => router.push("/escalate")}>
              <Phone className="h-4 w-4" />
              {rw ? "Umukozi" : "Officer"}
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">{rw ? "Gerageza Demo" : "Try Demo Case"}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(Object.keys(DEMO_CASES) as (keyof typeof DEMO_CASES)[]).map((id) => {
            const c = DEMO_CASES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => router.push(`/diagnose?demo=${id}`)}
                className="min-w-[140px] overflow-hidden rounded-[22px] bg-white text-left shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" className="h-24 w-full object-cover" />
                <p className="p-3 text-xs font-bold leading-snug">
                  {rw ? c.titleRw : c.title}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">{rw ? "Amateka" : "Health timeline"}</h2>
        <M3Card className="!p-4">
          <div className="space-y-3">
            {TIMELINE.map((t) => (
              <div key={t.month} className="flex items-center justify-between text-sm">
                <span className="font-semibold">{rw ? t.monthRw : t.month}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    t.tone === "good"
                      ? "bg-[#34A853]/15 text-[#34A853]"
                      : t.tone === "warn"
                        ? "bg-[#FBBC04]/25 text-[#1B1C1A]"
                        : "bg-[#EA4335]/15 text-[#EA4335]"
                  }`}
                >
                  {rw ? t.statusRw : t.status}
                </span>
              </div>
            ))}
          </div>
        </M3Card>
      </section>

      <section className="mt-7 mb-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{rw ? "Kalendari" : "Treatment calendar"}</h2>
          <button type="button" onClick={() => resetDemo()} className="text-xs font-semibold text-[#1B1C1A]/40">
            Reset
          </button>
        </div>
        <div className="space-y-2">
          {TREATMENT_CALENDAR.map((t) => (
            <div key={t.when} className="rounded-[20px] bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-[#2E7D32]">
                {rw ? t.whenRw : t.when}
              </p>
              <p className="text-sm font-semibold">{rw ? t.taskRw : t.task}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Onboarding({
  step,
  setStep,
  language,
  setLanguage,
  onPickType,
  onSkipDemo,
}: {
  step: "welcome" | "story" | "type";
  setStep: (s: "welcome" | "story" | "type") => void;
  language: "en" | "rw";
  setLanguage: (l: "en" | "rw") => void;
  onPickType: (t: FarmingType) => void;
  onSkipDemo: () => void;
}) {
  const rw = language === "rw";
  const types: { id: FarmingType; icon: string; label: string; labelRw: string }[] = [
    { id: "crop", icon: "🌽", label: "Crop Farming", labelRw: "Ibihingwa" },
    { id: "livestock", icon: "🐄", label: "Livestock", labelRw: "Amatungo" },
    { id: "vegetable", icon: "🌱", label: "Vegetable Farming", labelRw: "Imboga" },
  ];

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setLanguage(rw ? "en" : "rw")}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm"
        >
          {rw ? "English" : "Kinyarwanda"}
        </button>
        {step !== "welcome" ? (
          <button
            type="button"
            onClick={() => setStep(step === "type" ? "story" : "welcome")}
            className="text-xs font-bold text-[#2E7D32]"
          >
            {rw ? "Inyuma" : "Back"}
          </button>
        ) : (
          <span />
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" ? (
          <motion.div
            key="w"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-1 flex-col justify-center"
          >
            <div className="mx-auto w-[86%] max-w-[300px]">
              <BrandLogo priority />
            </div>
            <h1 className="mt-8 text-center text-3xl font-extrabold leading-tight text-[#1B1C1A]">
              {rw ? "Muraho 👋" : "Hello 👋"}
            </h1>
            <p className="mt-2 text-center text-base text-[#1B1C1A]/65">
              {rw ? BRAND.taglineRw : BRAND.tagline}
            </p>
            <div className="mt-8 space-y-3">
              <PrimaryButton onClick={() => setStep("story")}>
                {rw ? "Tangira" : "Get started"}
              </PrimaryButton>
              <PrimaryButton variant="blue" onClick={onSkipDemo}>
                <Sparkles className="h-5 w-5" />
                Demo Mode (Judges)
              </PrimaryButton>
            </div>
          </motion.div>
        ) : null}

        {step === "story" ? (
          <motion.div
            key="s"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-1 flex-col"
          >
            <BrandMark size={48} className="mb-4" />
            <h2 className="text-2xl font-extrabold text-[#1B1C1A]">
              {rw ? "Icyo dukemura" : "What we solve"}
            </h2>
            <p className="mt-2 text-[#1B1C1A]/65">
              {rw ? PRODUCT_STORY.problem.rw : PRODUCT_STORY.problem.en}
            </p>

            <M3Card className="mt-5 !p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#2E7D32]">
                {rw ? "Igikorwa" : "How it works"}
              </p>
              <ol className="mt-3 space-y-3">
                {PRODUCT_STORY.how.map((h) => (
                  <li key={h.step} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-sm font-bold text-white">
                      {h.step}
                    </span>
                    <div>
                      <p className="font-bold">{rw ? h.titleRw : h.title}</p>
                      <p className="text-sm text-[#1B1C1A]/60">{rw ? h.bodyRw : h.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </M3Card>

            <M3Card className="mt-3 !p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#FBBC04]">
                {rw ? "Iyo ukoresha" : "When to use"}
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug">
                {rw ? PRODUCT_STORY.when.rw : PRODUCT_STORY.when.en}
              </p>
            </M3Card>

            <PrimaryButton className="mt-8" onClick={() => setStep("type")}>
              {rw ? "Komeza" : "Continue"}
            </PrimaryButton>
          </motion.div>
        ) : null}

        {step === "type" ? (
          <motion.div
            key="t"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <h2 className="text-3xl font-extrabold text-[#1B1C1A]">
              {rw ? "Hitamo ubuhinzi bwawe" : "What do you farm?"}
            </h2>
            <p className="mt-2 text-[#1B1C1A]/60">
              {rw ? "Hitamo kimwe kugira ngo dutangire." : "Pick one to personalize your assistant."}
            </p>
            <div className="mt-6 space-y-3">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onPickType(t.id)}
                  className="flex w-full items-center gap-4 rounded-[28px] bg-white p-5 text-left shadow-[0_8px_28px_rgba(46,125,50,0.10)] active:scale-[0.98]"
                >
                  <span className="text-3xl">{t.icon}</span>
                  <span className="text-lg font-bold">{rw ? t.labelRw : t.label}</span>
                </button>
              ))}
            </div>

            <M3Card className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#2E7D32]">
                {rw ? "Umuhinzi" : "Farmer profile"}
              </p>
              <p className="mt-1 text-xl font-extrabold">{FARMER.name}</p>
              <p className="text-sm text-[#1B1C1A]/60">
                {FARMER.location.district}, {FARMER.location.province}, Rwanda
              </p>
              <p className="mt-2 text-sm font-semibold">
                {rw ? FARMER.farm.cropRw : FARMER.farm.crop} · {FARMER.farm.hectares} hectares
              </p>
            </M3Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
