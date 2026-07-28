"use client";

import { usePaginatedList } from "@/lib/hooks";
import { Card, DataTable, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner } from "@/components/ui";
import type { HarvestReport } from "@/lib/types";

export default function HarvestReportsPage() {
  const { items, loading, error, page, totalPages, goToPage } = usePaginatedList<HarvestReport>(
    "/production/officer/harvest-reports/"
  );

  return (
    <div>
      <PageHeader title="Harvest Reports" description="Crop harvest reports submitted within your jurisdiction." />
      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No harvest reports in your jurisdiction." />}
        {!loading && items.length > 0 && (
          <DataTable
            rows={items}
            keyFn={(row) => row.id}
            columns={[
              { header: "Land ID", render: (row) => row.land },
              { header: "Crop ID", render: (row) => row.crop },
              { header: "Season", render: (row) => `${row.season} ${row.season_year}` },
              { header: "Quantity (kg)", render: (row) => row.quantity_kg },
              { header: "Source", render: (row) => row.source.replace("_", " ") },
              { header: "Reported", render: (row) => new Date(row.created_at).toLocaleDateString() },
            ]}
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </Card>
    </div>
  );
}
