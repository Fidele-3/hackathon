"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MapPin,
  Wheat,
  PiggyBank,
  PackageCheck,
  Warehouse,
  AlertTriangle,
  MessagesSquare,
  Sparkles,
  TrendingUp,
  LogOut,
  Brain,
  Map as MapIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import type { UserLevel } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  allowed: UserLevel[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/officers",
    label: "Officers",
    icon: Users,
    allowed: ["national_admin", "district_officer", "sector_officer"],
  },
  { href: "/buyers", label: "Buyers", icon: ShoppingBag, allowed: ["national_admin"] },
  {
    href: "/lands",
    label: "Lands",
    icon: MapPin,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/harvest-reports",
    label: "Harvest Reports",
    icon: Wheat,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/livestock",
    label: "Livestock",
    icon: PiggyBank,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/resource-requests",
    label: "Resource Requests",
    icon: PackageCheck,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/storage-requests",
    label: "Storage Requests",
    icon: Warehouse,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/issues",
    label: "Farmer Issues",
    icon: AlertTriangle,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/map",
    label: "Map",
    icon: MapIcon,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  {
    href: "/ai-conversations",
    label: "AI Conversations",
    icon: MessagesSquare,
    allowed: ["national_admin", "district_officer", "sector_officer", "cell_officer"],
  },
  { href: "/insights", label: "Insights", icon: Sparkles, allowed: ["national_admin", "district_officer"] },
  { href: "/forecast", label: "Forecast", icon: TrendingUp, allowed: ["national_admin", "district_officer"] },
];

const LEVEL_LABELS: Record<UserLevel, string> = {
  national_admin: "National Admin",
  district_officer: "District Officer",
  sector_officer: "Sector Officer",
  cell_officer: "Cell Officer",
  citizen: "Citizen",
  buyer: "Buyer",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const level = user?.user_level;
  const items = NAV_ITEMS.filter((item) => level && item.allowed.includes(level));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-shrink-0 flex-col bg-emerald-950 border-r border-emerald-500/30 shadow-2xl">
        <div className="border-b border-emerald-500/30 px-5 py-4">
          <span className="text-lg font-semibold text-white">E-Hinga</span>
          <p className="text-xs text-emerald-300">Officer Console</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-700/40 text-white"
                    : "text-emerald-200 hover:bg-emerald-800/40 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-emerald-500/30 p-3 bg-emerald-900/40">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-xs text-emerald-300">{level ? LEVEL_LABELS[level] : ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-800/40 hover:text-white"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-8 dark:bg-neutral-900">{children}</main>

      <FloatingAIButton />
    </div>
  );
}

function FloatingAIButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {hovered && (
        <div className="mb-2 px-4 py-2 bg-emerald-700 text-white rounded-xl shadow-lg text-sm font-medium fade-in-top">
          Ask E-Hinga AI
        </div>
      )}
      <Link
        href="/ai-conversations"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-xl border border-emerald-400 transition-all duration-300 hover:scale-105 hover:from-emerald-500 hover:to-emerald-400"
        title="AI Assistant"
      >
        <Brain className="h-8 w-8 text-white" />
      </Link>
    </div>
  );
}
