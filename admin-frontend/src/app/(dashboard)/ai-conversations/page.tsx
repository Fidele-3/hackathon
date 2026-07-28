"use client";

import Link from "next/link";
import { usePaginatedList } from "@/lib/hooks";
import { Card, DataTable, EmptyState, ErrorBanner, PageHeader, Pagination, Spinner } from "@/components/ui";
import type { Conversation } from "@/lib/types";

export default function AiConversationsPage() {
  const { items, loading, error, page, totalPages, goToPage } = usePaginatedList<Conversation>(
    "/messaging/officer/ai-conversations/"
  );

  return (
    <div>
      <PageHeader
        title="AI Conversations"
        description="Every AI chatbot conversation from a farmer in your jurisdiction (app or USSD), for oversight — not only escalated ones. Read-only."
      />
      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No AI conversations in your jurisdiction." />}
        {!loading && items.length > 0 && (
          <DataTable
            rows={items}
            keyFn={(row) => row.public_id}
            columns={[
              {
                header: "Conversation",
                render: (row) => (
                  <Link href={`/ai-conversations/${row.public_id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {row.public_id.slice(0, 8)}…
                  </Link>
                ),
              },
              { header: "Linked issue", render: (row) => (row.related_issue ? `#${row.related_issue}` : "—") },
              { header: "Started", render: (row) => new Date(row.created_at).toLocaleString() },
              { header: "Last activity", render: (row) => new Date(row.updated_at).toLocaleString() },
            ]}
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </Card>
    </div>
  );
}
