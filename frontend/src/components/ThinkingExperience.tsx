"use client";

import { AnimatePresence, motion } from "framer-motion";
import { THINKING_STEPS_EN, THINKING_STEPS_RW } from "@/lib/demo-data";
import type { Language } from "@/lib/types";

export function ThinkingExperience({
  language,
  activeStep,
}: {
  language: Language;
  activeStep: number;
}) {
  const steps = language === "rw" ? THINKING_STEPS_RW : THINKING_STEPS_EN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5 h-20 w-20">
          <div className="gemini-ring absolute inset-0 animate-spin rounded-full opacity-90" style={{ animationDuration: "2.2s" }} />
          <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-m3-surface">
            <span className="shimmer-text text-sm font-bold">Gemini</span>
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-m3-onSurface">
          {language === "rw" ? "Gusuzuma igihingwa..." : "Analyzing Crop..."}
        </h2>
        <p className="mt-1 text-sm text-m3-onSurface/55">e-Hinga AI · Multimodal Vision</p>
      </div>

      <ul className="space-y-3">
        {steps.map((step, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: done || current ? 1 : 0.35, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
                current ? "bg-white shadow-soft" : "bg-transparent"
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <span className="flex-1 text-sm font-semibold text-m3-onSurface">{step.label}</span>
              <AnimatePresence>
                {done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-g-green text-xs text-white"
                  >
                    ✓
                  </motion.span>
                ) : current ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-g-blue animate-typing"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                ) : null}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>

      <div className="h-1.5 overflow-hidden rounded-full bg-m3-surfaceLow">
        <motion.div
          className="h-full rounded-full gemini-ring"
          initial={{ width: "8%" }}
          animate={{ width: `${Math.min(100, (activeStep + 1) * 25)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
