"use client";

import { use } from "react";
import Link from "next/link";
import { useList } from "@/lib/hooks";
import { mediaUrl } from "@/lib/api";
import { Card, EmptyState, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import type { Message, MessageAttachment } from "@/lib/types";

function AttachmentPreview({ att }: { att: MessageAttachment }) {
  const url = mediaUrl(att.file);
  const type = att.file_type || "";

  if (type.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="Attachment" className="mt-2 max-h-64 rounded-md border border-neutral-200 dark:border-neutral-800" />
    );
  }

  if (type.startsWith("audio/")) {
    return (
      <audio controls className="mt-2 w-full max-w-sm">
        <source src={url} type={type} />
        Your browser does not support audio playback.
      </audio>
    );
  }

  if (type.startsWith("video/")) {
    if (att.processing_status === "ready" && att.hls_master) {
      return (
        <div className="mt-2 space-y-1">
          <video controls className="max-h-64 rounded-md border border-neutral-200 dark:border-neutral-800" src={url} />
          <p className="text-xs text-neutral-400">Adaptive HLS ready: {mediaUrl(att.hls_master)}</p>
        </div>
      );
    }
    return (
      <p className="mt-2 text-xs text-neutral-500">
        Video attachment — HLS processing: <span className="font-medium">{att.processing_status}</span>
        {att.processing_status === "pending" || att.processing_status === "processing" ? " (check back shortly)" : ""}
      </p>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-emerald-700 hover:underline dark:text-emerald-400">
      Download attachment ({type || "file"})
    </a>
  );
}

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
            {message.attachments.map((att) => (
              <AttachmentPreview key={att.id} att={att} />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
