"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CloudRain,
  Leaf,
  Phone,
  Pill,
  Sparkles,
} from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { DEMO_TIMELINE } from "@/lib/demo-data";
import type { CropScanResponse, Language } from "@/lib/types";

export function DiagnosisCard({
  result,
  language,
  onEscalate,
  onExplainSimply,
  escalating,
  simpleMode,
}: {
  result: CropScanResponse;
  language: Language;
  onEscalate: () => void;
  onExplainSimply: () => void;
  escalating?: boolean;
  simpleMode?: boolean;
}) {
  const d = result.diagnosis;
  const severityColor =
    d.severity === "high" ? "text-g-red" : d.severity === "medium" ? "text-g-yellow" : "text-g-green";

  const simpleEn =
    "Your maize has a fungus. Like a cold in humans. Spray this medicine. Avoid watering at night.";
  const simpleRw =
    "Ibigori byawe bifite fungus. Nka cold ku bantu. Fata umuti. Ntuhire amazi nijoro.";

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass overflow-hidden rounded-5xl shadow-float"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/40 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-m3-primary">
              {language === "rw" ? "Indwara ishoboka" : "Possible Disease"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-m3-onSurface">
              {d.problem}
            </h2>
            <p className="mt-1 text-sm text-m3-onSurface/60">
              {d.crop} · <span className={severityColor}>{d.severity}</span>
            </p>
          </div>
          <ConfidenceMeter value={d.confidence} size={84} />
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <SmartChip icon={<Leaf className="h-4 w-4" />} title={language === "rw" ? "Igihingwa" : "Crop"} body={d.crop} />
          <SmartChip
            icon={<AlertTriangle className="h-4 w-4 text-g-yellow" />}
            title={language === "rw" ? "Uburemere" : "Severity"}
            body={d.severity}
          />
          <SmartChip
            icon={<Pill className="h-4 w-4 text-g-blue" />}
            title={language === "rw" ? "Umuti" : "Treatment"}
            body={d.recommendation.slice(0, 80) + (d.recommendation.length > 80 ? "…" : "")}
            className="col-span-2"
          />
          <SmartChip
            icon={<CloudRain className="h-4 w-4 text-g-blue" />}
            title={language === "rw" ? "Ikirere" : "Weather"}
            body={language === "rw" ? "Imvura ejo — wirinde kuhira uyu munsi" : "Rain tomorrow — avoid spraying today"}
            className="col-span-2"
          />
        </div>

        <div className="space-y-3 px-5 pb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-m3-onSurface/45">
            {language === "rw" ? "Niba utavuze" : "If untreated"}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DEMO_TIMELINE.map((t) => (
              <div key={t.day} className="min-w-[5.5rem] rounded-2xl bg-m3-surfaceLow px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-m3-primary">{t.day}</p>
                <p className="mt-1 text-lg font-bold text-m3-onSurface">{t.risk}%</p>
                <p className="text-[10px] leading-snug text-m3-onSurface/55">{t.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-m3-primaryContainer/50 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-m3-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {simpleMode
                ? language === "rw"
                  ? "Bisobanurwa byoroshye"
                  : "Explain like I'm five"
                : language === "rw"
                  ? "Ibisobanuro"
                  : "Explanation"}
            </p>
            <p className="text-sm leading-relaxed text-m3-onSurface">
              {simpleMode ? (language === "rw" ? simpleRw : simpleEn) : d.explanation || d.recommendation}
            </p>
          </div>

          {d.evidence?.length ? (
            <ul className="space-y-1.5">
              {d.evidence.map((e) => (
                <li key={e} className="flex gap-2 text-sm text-m3-onSurface/80">
                  <span className="text-g-green">•</span>
                  {e}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </motion.div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onExplainSimply}
          className="rounded-2xl border border-m3-outline/60 bg-white/80 px-4 py-3.5 text-sm font-semibold active:scale-[0.98]"
        >
          {language === "rw" ? "Sobanura byoroshye" : "Explain Simply"}
        </button>
        {result.escalated ? (
          <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-g-green/15 px-4 py-3.5 text-sm font-bold text-g-green">
            <Phone className="h-4 w-4" />
            {language === "rw" ? "Umukozi amenyeshejwe" : "Officer notified"}
          </div>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onEscalate}
            disabled={escalating}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-g-red py-3.5 text-sm font-bold text-white shadow-float disabled:opacity-60"
          >
            <Phone className="h-4 w-4" />
            {escalating
              ? "…"
              : language === "rw"
                ? "Huza n'umukozi"
                : "Escalate to Officer"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

function SmartChip({
  icon,
  title,
  body,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-white/70 p-3 shadow-sm ${className}`}>
      <div className="mb-1 flex items-center gap-1.5 text-m3-primary">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-m3-onSurface/45">{title}</p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-m3-onSurface">{body}</p>
    </div>
  );
}
