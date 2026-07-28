"use client";

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
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-500">Ubuhinzi</span>
          <p className="text-xs text-neutral-500">Officer Console</p>
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
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{user?.full_name}</p>
            <p className="text-xs text-neutral-500">{level ? LEVEL_LABELS[level] : ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-8 dark:bg-neutral-900">{children}</main>
    </div>
  );
}
