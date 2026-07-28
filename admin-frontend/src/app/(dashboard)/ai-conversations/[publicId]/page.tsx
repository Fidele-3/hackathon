"use client";

import { use } from "react";
import Link from "next/link";
import { useList } from "@/lib/hooks";
import { Card, EmptyState, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import type { Message } from "@/lib/types";

export default function AiConversationDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const { items, loading, error } = useList<Message>(`/messaging/officer/ai-conversations/${publicId}/messages/`);

  return (
    <div>
      <Link href="/ai-conversations" className="mb-4 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        ← Back to conversations
      </Link>
      <PageHeader title="Conversation transcript" description={publicId} />

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && items.length === 0 && <EmptyState message="No messages in this conversation." />}

      <div className="space-y-3">
        {items.map((message) => (
          <Card
            key={message.id}
            className={`p-4 ${message.is_ai_message ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30" : ""}`}
          >
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">
                {message.is_ai_message ? "AI assistant" : message.sender?.full_name ?? "Unknown"}
              </span>
              <span>{new Date(message.created_at).toLocaleString()}</span>
            </div>
            {message.body && <p className="text-sm text-neutral-800 dark:text-neutral-200">{message.body}</p>}
            {message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.file}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    Attachment ({att.file_type || "file"}) — {att.processing_status}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
