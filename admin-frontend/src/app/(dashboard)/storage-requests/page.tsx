"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { usePaginatedList } from "@/lib/hooks";
import { Button, Card, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner, StatusBadge } from "@/components/ui";
import type { StorageRequest, StorageRequestStatus } from "@/lib/types";

export default function StorageRequestsPage() {
  const { items, loading, error, page, totalPages, goToPage, reload } = usePaginatedList<StorageRequest>(
    "/production/officer/storage-requests/"
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const decide = async (id: number, status: StorageRequestStatus) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.patch(`/production/officer/storage-requests/${id}/decide/`, { status, decision_comment: comment });
      setActiveId(null);
      setComment("");
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to record decision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Storage Requests"
        description="Government warehouse storage requests within your jurisdiction. Only a crop (agronomist) specialist can decide these."
      />

      {actionError && <ErrorBanner message={actionError} />}

      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No storage requests in your jurisdiction." />}
        {!loading &&
          items.map((row) => (
            <div key={row.id} className="border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    Harvest #{row.harvest_report} · {row.quantity_kg} kg · Warehouse #{row.warehouse}
                  </p>
                  <p className="text-xs text-neutral-500">requested {new Date(row.requested_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                  {row.status === "requested" && (
                    <Button variant="secondary" onClick={() => setActiveId(activeId === row.id ? null : row.id)}>
                      Decide
                    </Button>
                  )}
                </div>
              </div>
              {activeId === row.id && (
                <div className="mt-3 space-y-2 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800/50">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Decision comment (optional)"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button disabled={submitting} onClick={() => decide(row.id, "approved")}>
                      Approve
                    </Button>
                    <Button variant="danger" disabled={submitting} onClick={() => decide(row.id, "rejected")}>
                      Reject
                    </Button>
                  </div>
                </div>
              )}
              {row.status === "approved" && (
                <div className="mt-2">
                  <Button variant="secondary" disabled={submitting} onClick={() => decide(row.id, "stored")}>
                    Mark stored
                  </Button>
                </div>
              )}
              {row.decision_comment && (
                <p className="mt-2 text-xs italic text-neutral-500">&ldquo;{row.decision_comment}&rdquo;</p>
              )}
            </div>
          ))}
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </Card>
    </div>
  );
}
