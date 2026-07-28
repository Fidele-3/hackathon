"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button, Card, ErrorBanner, Spinner } from "@/components/ui";
import type { FarmerIssue, Insight, Paginated, ResourceRequest, StorageRequest } from "@/lib/types";

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
  { key: "issues", label: "Farmer issues", path: "/messaging/officer/issues/" },
  { key: "ai", label: "AI conversations", path: "/messaging/officer/ai-conversations/" },
];

const PIE_COLORS = ["#059669", "#d97706", "#2563eb", "#dc2626", "#6b7280"];

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}

function countBy<T>(items: T[], key: (item: T) => string): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const k = key(item);
    counts[k] = (counts[k] ?? 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Record<string, number | null>>({});
  const [statsLoading, setStatsLoading] = useState(true);

  const [issuesByCategory, setIssuesByCategory] = useState<{ name: string; value: number }[]>([]);
  const [issuesByStatus, setIssuesByStatus] = useState<{ name: string; value: number }[]>([]);
  const [resourceByStatus, setResourceByStatus] = useState<{ name: string; value: number }[]>([]);
  const [storageByStatus, setStorageByStatus] = useState<{ name: string; value: number }[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightRequested, setInsightRequested] = useState(false);

  const canSeeInsight = user?.user_level === "national_admin" || user?.user_level === "district_officer";

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

    setChartsLoading(true);
    Promise.all([
      api.get<Paginated<FarmerIssue> | FarmerIssue[]>("/messaging/officer/issues/?page_size=500").then(unwrap).catch(() => []),
      api
        .get<Paginated<ResourceRequest> | ResourceRequest[]>("/production/officer/resource-requests/?page_size=500")
        .then(unwrap)
        .catch(() => []),
      api
        .get<Paginated<StorageRequest> | StorageRequest[]>("/production/officer/storage-requests/?page_size=500")
        .then(unwrap)
        .catch(() => []),
    ]).then(([issues, resourceRequests, storageRequests]) => {
      setIssuesByCategory(countBy(issues, (i) => i.category));
      setIssuesByStatus(countBy(issues, (i) => i.status));
      setResourceByStatus(countBy(resourceRequests, (r) => r.status));
      setStorageByStatus(countBy(storageRequests, (r) => r.status));
      setChartsLoading(false);
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

  const hasAnyChartData =
    issuesByCategory.length + issuesByStatus.length + resourceByStatus.length + storageByStatus.length > 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Welcome, {user?.full_name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{user ? LEVEL_GREETING[user.user_level] : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canSeeInsight && (
            <Button onClick={loadInsight} disabled={insightLoading}>
              {insightLoading ? "Generating…" : "Generate today's AI insight"}
            </Button>
          )}
          <Link href="/forecast">
            <Button variant="secondary">Crop forecast →</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_ENDPOINTS.map((s) => (
          <Card key={s.key} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {statsLoading ? "…" : stats[s.key] ?? "—"}
            </p>
          </Card>
        ))}
      </div>

      {/* Direct map link, large */}
      <Link href="/map" className="mb-6 block">
        <Card className="flex items-center justify-between p-6 transition hover:border-emerald-400">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Issue Map</h2>
            <p className="mt-1 text-sm text-neutral-500">
              View every farmer-reported issue plotted on the map, filterable by layer, with AI analysis.
            </p>
          </div>
          <span className="text-2xl">🗺️ →</span>
        </Card>
      </Link>

      {insightRequested && (
        <Card className="mb-6 p-6">
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

      {chartsLoading && <Spinner />}
      {!chartsLoading && !hasAnyChartData && (
        <Card className="p-6 text-sm text-neutral-500">No reports/requests/issues in your jurisdiction yet — charts will populate as real data comes in.</Card>
      )}

      {!chartsLoading && hasAnyChartData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {issuesByCategory.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Farmer issues by category</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={issuesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {issuesByCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {issuesByStatus.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Farmer issues by status</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={issuesByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {resourceByStatus.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Resource requests by status</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resourceByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {storageByStatus.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Storage requests by status</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={storageByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {storageByStatus.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
