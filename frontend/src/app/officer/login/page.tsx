"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OfficerLoginRedirect() {
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
