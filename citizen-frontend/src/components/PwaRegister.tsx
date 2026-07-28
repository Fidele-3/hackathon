"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Native iOS shell already caches assets — skip SW
    if (Capacitor.isNativePlatform()) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* demo continues without SW */
    });
  }, []);
  return null;
}
