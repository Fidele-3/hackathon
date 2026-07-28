"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HealthRing({ value, size = 120 }: { value: number; size?: number }) {
  const pct = Math.round(value);
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E8F5E9" strokeWidth="10" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#2E7D32"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-[#1B1C1A]">{pct}%</span>
      </div>
    </div>
  );
}

export function M3Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[28px] bg-white/90 p-5 shadow-[0_8px_28px_rgba(46,125,50,0.10)]", className)}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "blue" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-[#2E7D32] text-white",
    blue: "bg-[#4285F4] text-white",
    danger: "bg-[#EA4335] text-white",
    ghost: "bg-white text-[#1B1C1A] border border-[#C5CDC4]",
  };
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-[28px] px-5 py-4 text-base font-bold shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
        styles[variant],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
