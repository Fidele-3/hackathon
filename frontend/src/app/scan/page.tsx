"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — redirect to Crop Doctor. */
export default function ScanRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/diagnose");
  }, [router]);
  return <div className="flex min-h-dvh items-center justify-center text-m3-onSurface/40">…</div>;
}
