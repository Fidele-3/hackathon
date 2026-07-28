"use client";

import { useState } from "react";
import { usePaginatedList } from "@/lib/hooks";
import { Card, DataTable, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner } from "@/components/ui";
import type { LivestockLocation, LivestockProduction } from "@/lib/types";

type Tab = "locations" | "production";

export default function LivestockPage() {
  const [tab, setTab] = useState<Tab>("locations");

  return (
    <div>
      <PageHeader title="Livestock" description="Livestock holdings and production reports within your jurisdiction." />

      <div className="mb-4 flex gap-2">
        <TabButton active={tab === "locations"} onClick={() => setTab("locations")}>
          Locations
        </TabButton>
        <TabButton active={tab === "production"} onClick={() => setTab("production")}>
          Production
        </TabButton>
      </div>

      {tab === "locations" ? <LocationsTable /> : <ProductionTable />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

function LocationsTable() {
  const { items, loading, error, page, totalPages, goToPage } = usePaginatedList<LivestockLocation>(
    "/production/officer/livestock-locations/"
  );
  return (
    <Card>
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && items.length === 0 && <EmptyState message="No livestock locations in your jurisdiction." />}
      {!loading && items.length > 0 && (
        <DataTable
          rows={items}
          keyFn={(row) => row.id}
          columns={[
            { header: "Cell ID", render: (row) => row.cell },
            { header: "Livestock type ID", render: (row) => row.livestock_type },
            { header: "Count", render: (row) => row.count },
            { header: "Registered", render: (row) => new Date(row.registered_at).toLocaleDateString() },
          ]}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </Card>
  );
}

function ProductionTable() {
  const { items, loading, error, page, totalPages, goToPage } = usePaginatedList<LivestockProduction>(
    "/production/officer/livestock-production/"
  );
  return (
    <Card>
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && items.length === 0 && <EmptyState message="No production reports in your jurisdiction." />}
      {!loading && items.length > 0 && (
        <DataTable
          rows={items}
          keyFn={(row) => row.id}
          columns={[
            { header: "Location ID", render: (row) => row.livestock_location },
            { header: "Product", render: (row) => row.product_type },
            { header: "Season", render: (row) => `${row.season} ${row.season_year}` },
            { header: "Quantity", render: (row) => `${row.quantity} ${row.unit}` },
            { header: "Source", render: (row) => row.source.replace("_", " ") },
            { header: "Reported", render: (row) => new Date(row.created_at).toLocaleDateString() },
          ]}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </Card>
  );
}
