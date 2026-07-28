"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Sparkles } from "lucide-react";
import { FARMER } from "@/data/demo";
import { useFarmerStore } from "@/lib/farmer-store";
import { sleep } from "@/lib/utils";
import { M3Card, PrimaryButton } from "@/components/ui/m3";

export default function EscalatePage() {
  const { language } = useFarmerStore();
  const rw = language === "rw";
  const [phase, setPhase] = useState<"prep" | "done">("prep");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const steps = rw
        ? [
            "Gukora icyegeranyo cya AI...",
            "Gushakisha umukozi w'akagari...",
            `Yabonetse: ${FARMER.officer.name}`,
            "Itangazo ryahejwe!",
          ]
        : [
            "Generating AI summary...",
            "Finding your cell agronomist...",
            `Officer found: ${FARMER.officer.name}`,
            "Notification sent!",
          ];
      for (const s of steps) {
        setLog((l) => [...l, s]);
        await sleep(700);
      }
      setPhase("done");
    })();
  }, [rw]);

  return (
    <main className="min-h-dvh px-5 pb-tabbar pt-4">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">{rw ? "Umukozi" : "Escalation"}</h1>
        <span className="w-9" />
      </div>

      <M3Card>
        <p className="text-xs font-bold uppercase tracking-wide text-[#EA4335]">
          {rw ? "Itangazo rihutirwa" : "Emergency escalation"}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">
          {rw ? "Huza n'umukozi w'ubuhinzi" : "Call My Agriculture Officer"}
        </h2>

        <ul className="mt-5 space-y-3">
          {log.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-sm font-semibold"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32] text-xs text-white">
                {i < log.length - 1 || phase === "done" ? "✓" : "…"}
              </span>
              {item}
            </motion.li>
          ))}
        </ul>
      </M3Card>

      {phase === "done" ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 space-y-4">
          <M3Card className="border border-[#34A853]/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-8 w-8 text-[#34A853]" />
              <div>
                <p className="text-lg font-extrabold">{FARMER.officer.name}</p>
                <p className="text-sm text-[#1B1C1A]/60">
                  {rw ? FARMER.officer.roleRw : FARMER.officer.role}
                </p>
                <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#4285F4]">
                  <MapPin className="h-4 w-4" />
                  {rw ? FARMER.officer.distanceRw : FARMER.officer.distance}
                </p>
                <p className="mt-1 text-sm">{FARMER.officer.phone}</p>
              </div>
            </div>
          </M3Card>

          <div className="rounded-[22px] bg-[#FBBC04]/20 p-4 text-sm">
            <p className="flex items-center gap-2 font-bold">
              <Sparkles className="h-4 w-4" />
              {rw ? "Incamake ya AI" : "AI summary sent"}
            </p>
            <p className="mt-1 text-[#1B1C1A]/75">
              {rw
                ? "Northern Corn Leaf Blight · 96% · Ahantu 18% · Bisaba gusura."
                : "Northern Corn Leaf Blight · 96% confidence · 18% area · Field inspection recommended."}
            </p>
          </div>

          <PrimaryButton
            variant="danger"
            onClick={() => {
              window.location.href = `tel:${FARMER.officer.phone.replace(/\s/g, "")}`;
            }}
          >
            <Phone className="h-4 w-4" />
            {rw ? "Hamagara umukozi" : "Call officer"}
          </PrimaryButton>
          <Link href="/officer" className="block text-center text-sm font-bold text-[#4285F4]">
            {rw ? "Reba inbox y'umukozi" : "View officer inbox"}
          </Link>
          <Link href="/" className="block text-center text-sm font-bold text-[#2E7D32]">
            {rw ? "Subira ahabanza" : "Back home"}
          </Link>
        </motion.div>
      ) : null}
    </main>
  );
}
