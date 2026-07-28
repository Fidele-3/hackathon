"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import type { Insight } from "@/lib/types";

export default function InsightsPage() {
  const user = useAuthStore((s) => s.user);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const path = user?.user_level === "national_admin" ? "/ai/insights/national/" : "/ai/insights/district/";
    setLoading(true);
    api
      .get<Insight>(path)
      .then(setInsight)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load insight."))
      .finally(() => setLoading(false));
  }, [user?.user_level]);

  return (
    <div>
      <PageHeader
        title="AI Insight"
        description="Daily AI-generated summary grounded in real platform and climate data, regenerated once per day."
      />
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {!loading && insight && (
        <Card className="p-6">
          <p className="whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{insight.content}</p>
          <p className="mt-4 text-xs text-neutral-400">
            {insight.scope === "national" ? "National" : `District #${insight.district}`} · {insight.summary_date} ·
            generated {new Date(insight.generated_at).toLocaleString()} · {insight.model_used}
          </p>
        </Card>
      )}
    </div>
  );
}
