"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function AnimatedFAB() {
  return (
    <Link href="/chat" aria-label="Open AI assistant" className="fixed bottom-6 right-5 z-40 md:right-[calc(50%-11rem)]">
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative"
      >
        <span className="absolute -inset-1 animate-geminiGlow rounded-full" />
        <span className="gemini-ring relative flex h-14 w-14 items-center justify-center rounded-full p-[2.5px] shadow-float">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <MessageCircle className="h-6 w-6 text-m3-primary" strokeWidth={2.2} />
          </span>
        </span>
      </motion.div>
    </Link>
  );
}
