"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, LogOut, MapPin, User } from "lucide-react";
import { fetchPriorityFeed } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { useFarmerStore } from "@/lib/store";
import type { PriorityAlert } from "@/lib/types";

export default function OfficerPage() {
  const { user, ready, logout } = useApp();
  const { language, setLanguage } = useFarmerStore();
  const router = useRouter();
  const [alerts, setAlerts] = useState<PriorityAlert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.user_level === "citizen") {
      router.replace("/");
      return;
    }
    const load = () =>
      fetchPriorityFeed()
        .then((data) => setAlerts(data.results))
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
        .finally(() => setLoading(false));
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [ready, user, router]);

  if (!ready || !user || user.user_level === "citizen") {
    return <div className="flex min-h-dvh items-center justify-center">…</div>;
  }

  return (
    <main className="min-h-dvh px-5 pb-10 pt-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-m3-primary">Command Center</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-m3-onSurface">
            {language === "rw" ? "Amatangazo ya AI" : "AI Priority Feed"}
          </h1>
          <p className="mt-1 text-sm text-m3-onSurface/55">{user.full_name}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "rw" : "en")}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm"
          >
            {language === "en" ? "RW" : "EN"}
          </button>
          <button type="button" onClick={logout} className="rounded-full bg-white p-2 shadow-sm">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {loading ? <p className="text-sm text-m3-onSurface/45">…</p> : null}
      {error ? <p className="text-sm text-g-red">{error}</p> : null}
      {!loading && !alerts.length ? (
        <div className="glass rounded-4xl p-8 text-center text-sm text-m3-onSurface/55">
          {language === "rw" ? "Nta matangazo ya AI ahari." : "Waiting for farmer AI alerts…"}
        </div>
      ) : null}

      <div className="space-y-4">
        {alerts.map((alert, i) => (
          <motion.article
            key={alert.issue_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="overflow-hidden rounded-4xl bg-white shadow-float"
          >
            <div className="flex items-center gap-2 bg-g-red px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white">
              <AlertTriangle className="h-4 w-4" />
              Urgent AI Alert
            </div>
            <div className="space-y-3 p-5">
              <h3 className="font-display text-xl font-bold text-m3-onSurface">{alert.problem}</h3>
              <p className="text-sm text-m3-onSurface/60">
                {alert.crop} · {alert.severity}
                {alert.confidence != null ? ` · ${Math.round(Number(alert.confidence) * 100)}%` : ""}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-m3-primary" />
                  <span className="font-semibold">{alert.farmer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-m3-primary" />
                  <span className="font-semibold">{alert.location || "—"}</span>
                </div>
              </div>
              {alert.recommendation ? (
                <p className="text-sm leading-relaxed text-m3-onSurface/75">{alert.recommendation}</p>
              ) : null}
              <div className="rounded-2xl bg-g-yellow/20 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-m3-onSurface/50">
                  Recommended action
                </p>
                <p className="font-bold text-m3-onSurface">
                  {alert.recommended_action || "Field inspection required."}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  );
}
