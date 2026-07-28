"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, ErrorBanner, Spinner } from "@/components/ui";
import type { Insight } from "@/lib/types";

const LEVEL_GREETING: Record<string, string> = {
  national_admin: "National overview",
  district_officer: "District overview",
  sector_officer: "Sector overview",
  cell_officer: "Cell overview",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSeeInsight = user?.user_level === "national_admin" || user?.user_level === "district_officer";

  useEffect(() => {
    if (!canSeeInsight) return;
    const path = user?.user_level === "national_admin" ? "/ai/insights/national/" : "/ai/insights/district/";
    setLoading(true);
    api
      .get<Insight>(path)
      .then(setInsight)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load insight."))
      .finally(() => setLoading(false));
  }, [canSeeInsight, user?.user_level]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Welcome, {user?.full_name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {user ? LEVEL_GREETING[user.user_level] : ""}
        </p>
      </div>

      {canSeeInsight && (
        <Card className="p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Today&apos;s AI-generated insight
          </h2>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {!loading && insight && (
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
