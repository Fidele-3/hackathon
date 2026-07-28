"use client";

import { usePaginatedList } from "@/lib/hooks";
import { Card, DataTable, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner } from "@/components/ui";
import type { Land } from "@/lib/types";

export default function LandsPage() {
  const { items, loading, error, page, totalPages, goToPage } = usePaginatedList<Land>("/production/officer/lands/");

  return (
    <div>
      <PageHeader title="Lands" description="Registered land parcels within your jurisdiction." />
      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No land parcels in your jurisdiction." />}
        {!loading && items.length > 0 && (
          <DataTable
            rows={items}
            keyFn={(row) => row.id}
            columns={[
              { header: "UPI", render: (row) => row.upi },
              { header: "Cell ID", render: (row) => row.cell },
              { header: "Hectares", render: (row) => row.hectares ?? "—" },
              { header: "Crop ID", render: (row) => row.planted_crop ?? "—" },
              { header: "Season", render: (row) => (row.season ? `${row.season} ${row.season_year ?? ""}` : "—") },
              { header: "Registered", render: (row) => new Date(row.registered_at).toLocaleDateString() },
            ]}
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </Card>
    </div>
  );
}
