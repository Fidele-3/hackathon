"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { FARMER } from "@/data/demo";
import { useFarmerStore } from "@/lib/farmer-store";
import { M3Card } from "@/components/ui/m3";

/** Lightweight officer inbox simulation for the demo story. */
export default function OfficerInboxPage() {
  const { language, setLanguage } = useFarmerStore();
  const rw = language === "rw";
  return (
    <main className="min-h-dvh px-5 pb-tabbar pt-4">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white p-2 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold">{rw ? "Amatangazo" : "Officer Inbox"}</h1>
          <button
            type="button"
            onClick={() => setLanguage(rw ? "en" : "rw")}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm"
          >
            {rw ? "EN" : "RW"}
          </button>
        </div>
        <span className="w-9" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <M3Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-[#EA4335]">
              {rw ? "Itangazo rishya" : "New escalation"}
            </p>
            <span className="rounded-full bg-[#EA4335]/15 px-3 py-1 text-[11px] font-bold text-[#EA4335]">
              {rw ? "Ikiciro cya kabiri" : "Priority 2"}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold">{FARMER.name}</h2>
          <p className="text-sm text-[#1B1C1A]/60">
            {rw ? `${FARMER.location.district} · Ibigori · Indwara y'Amababi` : `${FARMER.location.district} · Maize · Northern Corn Leaf Blight`}
          </p>
          <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#4285F4]">
            <MapPin className="h-4 w-4" />
            {rw ? "Metero 500 · ikiciro giciriritse" : "500 m · priority medium"}
          </p>
          <div className="mt-4 rounded-[18px] bg-[#E8F5E9] p-3 text-sm">
            <p className="flex items-center gap-2 font-bold text-[#2E7D32]">
              <Sparkles className="h-4 w-4" />
              {rw ? "Incamake ya AI" : "AI summary"}
            </p>
            <p className="mt-1 text-[#1B1C1A]/75">
              {rw
                ? "Icyizere 96%. Fata umuti ku gice cy'iburasirazuba (18%). Imvura mu minsi 2."
                : "Confidence 96%. Recommend fungicide on NE section (18% canopy). Rain in 2 days — spray before evening humidity."}
            </p>
          </div>
        </M3Card>
      </motion.div>
    </main>
  );
}
