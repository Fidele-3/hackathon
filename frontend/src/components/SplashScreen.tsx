"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandLogo } from "@/components/Brand";

/** iPhone-style launch splash — brand first, then app. */
export function SplashScreen({ minMs = 1800 }: { minMs?: number }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("ehinga-splash");
    if (seen) {
      setShow(false);
      return;
    }
    const t = window.setTimeout(() => {
      sessionStorage.setItem("ehinga-splash", "1");
      setShow(false);
    }, minMs);
    return () => clearTimeout(t);
  }, [minMs]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-[78%] max-w-[320px]"
          >
            <BrandLogo priority />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 text-center text-[13px] font-semibold tracking-wide text-[#1B5E20]/70"
          >
            AI Agronomist · Rwanda
          </motion.p>
          <motion.div
            className="mt-10 h-1 w-28 overflow-hidden rounded-full bg-[#E8F5E9]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full rounded-full bg-[#2E7D32]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: minMs / 1000, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
