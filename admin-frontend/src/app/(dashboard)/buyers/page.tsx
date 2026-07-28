"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { usePaginatedList } from "@/lib/hooks";
import { Button, Card, DataTable, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner, StatusBadge } from "@/components/ui";
import type { BuyerListItem } from "@/lib/types";

export default function BuyersPage() {
  const { items, loading, error, page, totalPages, goToPage, reload } = usePaginatedList<BuyerListItem>("/auth/buyers/");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleVerify = async (id: number) => {
    setVerifyingId(id);
    setActionError(null);
    try {
      await api.post(`/auth/buyers/${id}/verify/`);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to verify buyer.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Produce Buyers" description="Verify buyer businesses before they can see or reserve marketplace listings." />

      {actionError && <ErrorBanner message={actionError} />}

      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No buyers registered yet." />}
        {!loading && items.length > 0 && (
          <DataTable
            rows={items}
            keyFn={(row) => row.id}
            columns={[
              { header: "Business", render: (row) => row.business_name },
              { header: "Contact", render: (row) => `${row.full_name} · ${row.phone_number}` },
              { header: "Payment method", render: (row) => row.payment_method.replace("_", " ") },
              { header: "Assigned cells", render: (row) => row.assigned_cells.join(", ") || "—" },
              {
                header: "Status",
                render: (row) => <StatusBadge status={row.is_verified ? "approved" : "pending"} />,
              },
              {
                header: "",
                render: (row) =>
                  row.is_verified ? (
                    <span className="text-xs text-neutral-400">Verified</span>
                  ) : (
                    <Button onClick={() => handleVerify(row.id)} disabled={verifyingId === row.id}>
                      {verifyingId === row.id ? "Verifying…" : "Verify"}
                    </Button>
                  ),
              },
            ]}
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </Card>
    </div>
  );
}
