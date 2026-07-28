"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera, Home, MessageCircle, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFarmerStore } from "@/lib/farmer-store";

const TABS = [
  { href: "/", icon: Home, label: "Home", labelRw: "Ahabanza" },
  { href: "/diagnose", icon: Camera, label: "Scan", labelRw: "Suzuma" },
  { href: "/field-scan", icon: Video, label: "Video", labelRw: "Video" },
  { href: "/chat", icon: MessageCircle, label: "Ask AI", labelRw: "Baza" },
  { href: "/escalate", icon: Phone, label: "Help", labelRw: "Umukozi" },
] as const;

export function AppTabBar() {
  const pathname = usePathname();
  const { language, onboarded } = useFarmerStore();
  const [ready, setReady] = useState(false);
  const rw = language === "rw";

  useEffect(() => setReady(true), []);

  if (!ready || !onboarded) return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/officer/login")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-[#E0E7DF] bg-white/92 backdrop-blur-xl"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="grid grid-cols-5 px-1 pt-1.5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-bold transition-colors",
                  active ? "text-[#2E7D32]" : "text-[#1B1C1A]/45",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    active && "bg-[#E8F5E9]",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                {rw ? tab.labelRw : tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
