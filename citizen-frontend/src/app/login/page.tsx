"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Farmer demo is auth-free — redirect legacy login. */
export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <main className="flex min-h-dvh items-center justify-center text-[#2E7D32]">
      Opening E-Hinga…
    </main>
  );
}
