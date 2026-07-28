"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { usePaginatedList } from "@/lib/hooks";
import { Button, Card, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner, StatusBadge } from "@/components/ui";
import type { FarmerIssue, IssueStatus } from "@/lib/types";

const QUERY_TYPE_LABELS: Record<string, string> = {
  crop_diagnosis: "Crop photo diagnosis",
  livestock_query: "Livestock query",
  general_qa: "General Q&A",
  insight_generation: "Insight generation",
  voice_message: "Voice message",
};

export default function IssuesPage() {
  const { items, loading, error, page, totalPages, goToPage, reload } = usePaginatedList<FarmerIssue>(
    "/messaging/officer/issues/"
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const resolve = async (id: number, status: IssueStatus) => {
    if (!response.trim()) {
      setActionError("A response is required to resolve or reject an issue.");
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      await api.patch(`/messaging/officer/issues/${id}/resolve/`, { status, officer_response: response });
      setActiveId(null);
      setResponse("");
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to resolve issue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Farmer Issues"
        description="Crop and livestock issues escalated to officers in your jurisdiction — including what the AI assistant already saw and said, if the farmer started there."
      />

      {actionError && <ErrorBanner message={actionError} />}

      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No issues in your jurisdiction." />}
        {!loading &&
          items.map((row) => (
            <div key={row.id} className="border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {row.reporter.full_name} · {row.category}
                    {row.cell_name && <span className="text-neutral-500"> · {row.cell_name}</span>}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{row.description}</p>
                  <p className="mt-1 text-xs text-neutral-500">{new Date(row.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {row.ai_query && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      AI already responded
                    </span>
                  )}
                  <StatusBadge status={row.status} />
                  {(row.status === "open" || row.status === "assigned") && (
                    <Button variant="secondary" onClick={() => setActiveId(activeId === row.id ? null : row.id)}>
                      Respond
                    </Button>
                  )}
                </div>
              </div>

              {row.ai_query && (
                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    What the AI assistant saw ({QUERY_TYPE_LABELS[row.ai_query.query_type] ?? row.ai_query.query_type})
                  </p>
                  {row.ai_query.input_text && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="font-medium">Farmer asked:</span> {row.ai_query.input_text}
                    </p>
                  )}
                  {(row.ai_query.input_image || row.ai_query.input_audio) && (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {row.ai_query.input_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a href={row.ai_query.input_image} target="_blank" rel="noreferrer">
                          <img
                            src={row.ai_query.input_image}
                            alt="Photo attached to the farmer's AI query"
                            className="h-24 w-24 rounded-md object-cover"
                          />
                        </a>
                      )}
                      {row.ai_query.input_audio && (
                        <audio controls src={row.ai_query.input_audio} className="h-10 max-w-xs" />
                      )}
                    </div>
                  )}
                  {row.ai_query.response_text && (
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="font-medium">AI responded:</span> {row.ai_query.response_text}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-neutral-400">
                    {row.ai_query.model_used} · {new Date(row.ai_query.created_at).toLocaleString()}
                  </p>
                </div>
              )}

              {activeId === row.id && (
                <div className="mt-3 space-y-2 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800/50">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Your response to the farmer (required)"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button disabled={submitting} onClick={() => resolve(row.id, "resolved")}>
                      Mark resolved
                    </Button>
                    <Button variant="danger" disabled={submitting} onClick={() => resolve(row.id, "rejected")}>
                      Reject
                    </Button>
                  </div>
                </div>
              )}
              {row.officer_response && (
                <p className="mt-2 text-xs italic text-neutral-500">&ldquo;{row.officer_response}&rdquo;</p>
              )}
            </div>
          ))}
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </Card>
    </div>
  );
}
