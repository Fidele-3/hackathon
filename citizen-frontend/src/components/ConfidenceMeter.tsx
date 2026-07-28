"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  value,
  size = 96,
  label = "Confidence",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 85 ? "#34A853" : pct >= 60 ? "#FBBC04" : "#EA4335";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" viewBox="0 0 96 96" width={size} height={size}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="#E8F0E8" strokeWidth="9" />
          <motion.circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-m3-onSurface">{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-m3-onSurface/50">
        {label}
      </span>
    </div>
  );
}

export function HealthScore({ value = 98 }: { value?: number }) {
  return (
    <div className={cn("glass relative overflow-hidden rounded-4xl p-5 shadow-glass")}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-g-green/15 blur-2xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-m3-primary">AI Health Score</p>
      <div className="mt-3 flex items-end gap-4">
        <ConfidenceMeter value={value / 100} size={88} label="" />
        <div className="pb-2">
          <p className="font-display text-3xl font-bold text-m3-primary">{value}%</p>
          <p className="text-sm text-m3-onSurface/65">Your farm looks strong today</p>
        </div>
      </div>
    </div>
  );
}
