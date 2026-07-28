"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button, Card, ErrorBanner, Spinner } from "@/components/ui";
import type { Insight, Paginated } from "@/lib/types";

const LEVEL_GREETING: Record<string, string> = {
  national_admin: "National overview",
  district_officer: "District overview",
  sector_officer: "Sector overview",
  cell_officer: "Cell overview",
};

const STAT_ENDPOINTS: { key: string; label: string; path: string }[] = [
  { key: "lands", label: "Registered lands", path: "/production/officer/lands/" },
  { key: "harvest", label: "Harvest reports", path: "/production/officer/harvest-reports/" },
  { key: "livestock", label: "Livestock locations", path: "/production/officer/livestock-locations/" },
  { key: "production", label: "Livestock production reports", path: "/production/officer/livestock-production/" },
  { key: "resource", label: "Resource requests", path: "/production/officer/resource-requests/" },
  { key: "storage", label: "Storage requests", path: "/production/officer/storage-requests/" },
  { key: "issues", label: "Farmer issues", path: "/messaging/officer/issues/" },
  { key: "ai", label: "AI conversations", path: "/messaging/officer/ai-conversations/" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Record<string, number | null>>({});
  const [statsLoading, setStatsLoading] = useState(true);

  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightRequested, setInsightRequested] = useState(false);

  const canSeeInsight = user?.user_level === "national_admin" || user?.user_level === "district_officer";
  const canSeeForecast = canSeeInsight;

  useEffect(() => {
    setStatsLoading(true);
    Promise.all(
      STAT_ENDPOINTS.map((s) =>
        api
          .get<Paginated<unknown>>(s.path)
          .then((r) => [s.key, r.count] as const)
          .catch(() => [s.key, null] as const)
      )
    ).then((entries) => {
      setStats(Object.fromEntries(entries));
      setStatsLoading(false);
    });
  }, []);

  const loadInsight = () => {
    if (!canSeeInsight) return;
    setInsightRequested(true);
    setInsightLoading(true);
    setInsightError(null);
    const path = user?.user_level === "national_admin" ? "/ai/insights/national/" : "/ai/insights/district/";
    api
      .get<Insight>(path)
      .then(setInsight)
      .catch((err) => setInsightError(err instanceof ApiError ? err.message : "Failed to generate insight."))
      .finally(() => setInsightLoading(false));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Welcome, {user?.full_name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{user ? LEVEL_GREETING[user.user_level] : ""}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_ENDPOINTS.map((s) => (
          <Card key={s.key} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {statsLoading ? "…" : stats[s.key] ?? "—"}
            </p>
          </Card>
        ))}
      </div>

      {(canSeeInsight || canSeeForecast) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {canSeeInsight && (
            <Button onClick={loadInsight} disabled={insightLoading}>
              {insightLoading ? "Generating…" : "Generate today's AI insight"}
            </Button>
          )}
          {canSeeForecast && (
            <Link href="/forecast">
              <Button variant="secondary">Run a crop forecast →</Button>
            </Link>
          )}
          <Link href="/ai-conversations">
            <Button variant="secondary">Review farmer AI conversations →</Button>
          </Link>
        </div>
      )}

      {insightRequested && (
        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Today&apos;s AI-generated insight</h2>
          {insightLoading && <Spinner />}
          {insightError && <ErrorBanner message={insightError} />}
          {!insightLoading && insight && (
            <>
              <p className="whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{insight.content}</p>
              <p className="mt-4 text-xs text-neutral-400">
                Generated {new Date(insight.generated_at).toLocaleString()} · {insight.model_used}
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
