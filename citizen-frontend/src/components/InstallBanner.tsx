"use client";

import { useEffect, useState } from "react";
import { Share } from "lucide-react";
import { M3Card, PrimaryButton } from "@/components/ui/m3";
import { useFarmerStore } from "@/lib/farmer-store";

/** Shows iPhone Add-to-Home-Screen tip when not in standalone. */
export function InstallBanner() {
  const { language, onboarded } = useFarmerStore();
  const [show, setShow] = useState(false);
  const rw = language === "rw";

  useEffect(() => {
    if (!onboarded) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const dismissed = localStorage.getItem("ehinga-install-dismissed");
    setShow(!standalone && !dismissed);
  }, [onboarded]);

  if (!show) return null;

  return (
    <M3Card className="mt-4 !p-4 border border-[#2E7D32]/20">
      <p className="text-sm font-extrabold text-[#1B5E20]">
        {rw ? "Shyira ku iPhone" : "Install on iPhone"}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#1B1C1A]/65">
        {rw
          ? "Safari → Share → Add to Home Screen. Izajya nka app nyayo."
          : "Safari → Share → Add to Home Screen. Opens like a real app."}
      </p>
      <div className="mt-3 flex gap-2">
        <PrimaryButton
          variant="ghost"
          className="!py-2.5 text-sm"
          onClick={() => {
            localStorage.setItem("ehinga-install-dismissed", "1");
            setShow(false);
          }}
        >
          {rw ? "Hagarika" : "Not now"}
        </PrimaryButton>
        <div className="flex flex-1 items-center justify-center gap-1 rounded-[28px] bg-[#E8F5E9] text-xs font-bold text-[#2E7D32]">
          <Share className="h-3.5 w-3.5" /> Share → Add
        </div>
      </div>
    </M3Card>
  );
}
