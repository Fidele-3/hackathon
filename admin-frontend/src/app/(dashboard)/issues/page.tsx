"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { usePaginatedList } from "@/lib/hooks";
import { Button, Card, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner, StatusBadge } from "@/components/ui";
import type { FarmerIssue, IssueStatus } from "@/lib/types";

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
        description="Crop and livestock issues escalated to officers in your jurisdiction."
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
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{row.description}</p>
                  <p className="mt-1 text-xs text-neutral-500">{new Date(row.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                  {(row.status === "open" || row.status === "assigned") && (
                    <Button variant="secondary" onClick={() => setActiveId(activeId === row.id ? null : row.id)}>
                      Respond
                    </Button>
                  )}
                </div>
              </div>
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
