"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, CloudRain, LogOut, MapPin, Mic, Sparkles } from "lucide-react";
import { AnimatedFAB } from "@/components/AnimatedFAB";
import { HealthScore } from "@/components/ConfidenceMeter";
import { useApp } from "@/lib/app-context";
import { useFarmerStore } from "@/lib/store";

export default function HomePage() {
  const { user, ready, logout } = useApp();
  const router = useRouter();
  const { language, setLanguage, demoMode, setDemoMode } = useFarmerStore();
  const firstName = user?.full_name?.split(" ")[0] || "Jean";

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.user_level !== "citizen") router.replace("/officer");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="flex min-h-dvh items-center justify-center text-m3-onSurface/40">…</div>;
  }

  return (
    <main className="relative min-h-dvh px-5 pb-28 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "rw" : "en")}
            className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-m3-primary shadow-sm"
          >
            {language === "en" ? "RW" : "EN"}
          </button>
          <button
            type="button"
            onClick={() => setDemoMode(!demoMode)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
              demoMode ? "bg-g-yellow text-m3-onSurface" : "bg-white/80 text-m3-onSurface/60"
            }`}
          >
            {demoMode ? "Demo ON" : "Demo OFF"}
          </button>
        </div>
        <button type="button" onClick={logout} className="rounded-full p-2 text-m3-onSurface/45">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm font-medium text-m3-onSurface/55">e-Hinga AI</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-m3-onSurface">
          {language === "rw" ? `Muraho ${firstName}` : `Hello ${firstName}`}{" "}
          <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-base font-medium text-m3-primary">
          {language === "rw" ? "Umurima wawe uri meza uyu munsi" : "Your Farm is Healthy Today"}{" "}
          <span aria-hidden>🌱</span>
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-4 glass rounded-5xl p-5 shadow-glass"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-m3-primary">
              {language === "rw" ? "Umurima" : "Farm"}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold">
              {language === "rw" ? "Umurima w'Ibigori" : "Maize Field"}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-m3-onSurface/60">
              <MapPin className="h-3.5 w-3.5" />
              Cyabararika · Musanze
            </p>
            <p className="mt-1 text-sm font-semibold text-m3-onSurface/80">0.25 ha · Season A 2026</p>
          </div>
          <div className="rounded-2xl bg-m3-primaryContainer px-3 py-2 text-center">
            <p className="text-[10px] font-bold uppercase text-m3-primary">Score</p>
            <p className="font-display text-2xl font-extrabold text-m3-primary">98%</p>
          </div>
        </div>
      </motion.section>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <HealthScore value={98} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mt-4 flex items-center gap-3 rounded-3xl bg-g-blue/10 px-4 py-3"
      >
        <CloudRain className="h-5 w-5 text-g-blue" />
        <div>
          <p className="text-sm font-semibold text-m3-onSurface">
            {language === "rw" ? "Imvura ejo" : "Rain tomorrow"}
          </p>
          <p className="text-xs text-m3-onSurface/60">
            {language === "rw" ? "Wirinde gufata ifumbire uyu munsi" : "Avoid fertilizer today"}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Link href="/diagnose">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-3 rounded-5xl bg-m3-primary py-5 text-lg font-bold text-white shadow-float"
          >
            <Camera className="h-6 w-6" />
            {language === "rw" ? "Suzuma Igihingwa Cyanjye" : "Diagnose My Crop"}
          </motion.button>
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/chat?voice=1"
            className="flex items-center justify-center gap-2 rounded-3xl bg-white/80 py-4 text-sm font-semibold shadow-soft active:scale-[0.98]"
          >
            <Mic className="h-4 w-4 text-m3-primary" />
            {language === "rw" ? "Vuga" : "Voice"}
          </Link>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 rounded-3xl bg-white/80 py-4 text-sm font-semibold shadow-soft active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 text-g-blue" />
            {language === "rw" ? "Baza AI" : "Ask AI"}
          </Link>
        </div>
      </motion.div>

      <AnimatedFAB />
    </main>
  );
}
