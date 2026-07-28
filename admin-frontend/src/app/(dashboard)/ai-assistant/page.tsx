"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import { Mic, Image as ImageIcon, Send, X } from "lucide-react";
import type { Conversation, Message } from "@/lib/types";

export default function AiAssistantPage() {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const existing = await api.get<Conversation[]>("/messaging/conversations/");
        let conversation = existing.find((c) => c.channel === "ai") ?? null;
        if (!conversation) {
          conversation = await api.post<Conversation>("/messaging/conversations/", { channel: "ai" });
        }
        if (cancelled) return;
        setPublicId(conversation.public_id);
        const history = await api.get<Message[]>(`/messaging/conversations/${conversation.public_id}/messages/`);
        if (!cancelled) setMessages(history);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to start the AI assistant.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicId || (!body.trim() && !attachment)) return;

    setSending(true);
    setError(null);
    try {
      const form = new FormData();
      if (body.trim()) form.append("body", body.trim());
      if (attachment) form.append("attachment", attachment);

      const newMessages = await api.post<Message[]>(`/messaging/conversations/${publicId}/messages/`, form, {
        isForm: true,
      });
      setMessages((prev) => [...prev, ...newMessages]);
      setBody("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <PageHeader
        title="AI Assistant"
        description="Your own conversation with the Ubuhinzi AI assistant — ask questions, or attach a crop photo or a voice note, just like a farmer would."
      />

      {error && <ErrorBanner message={error} />}

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && <Spinner />}
          {!loading && messages.length === 0 && (
            <p className="py-12 text-center text-sm text-neutral-400">
              Ask a farming question, or attach a photo or voice note to get started.
            </p>
          )}
          {!loading &&
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.is_ai_message ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    message.is_ai_message
                      ? "bg-emerald-50 text-neutral-800 dark:bg-emerald-950/50 dark:text-neutral-100"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {message.body && <p className="whitespace-pre-line">{message.body}</p>}
                  {message.attachments.map((att) =>
                    att.file_type.startsWith("image") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={att.id} src={att.file} alt="Attachment" className="mt-2 max-h-48 rounded-lg" />
                    ) : att.file_type.startsWith("audio") ? (
                      <audio key={att.id} controls src={att.file} className="mt-2 h-9 max-w-full" />
                    ) : (
                      <a key={att.id} href={att.file} target="_blank" rel="noreferrer" className="mt-2 block underline">
                        Attachment
                      </a>
                    )
                  )}
                  <p className={`mt-1 text-[10px] ${message.is_ai_message ? "text-neutral-400" : "text-emerald-100"}`}>
                    {message.is_ai_message ? "AI assistant" : "You"} · {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-emerald-100 p-3 dark:border-emerald-900/40">
          {attachment && (
            <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
              <span className="truncate">{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} className="text-red-500">
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*"
              className="hidden"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              id="ai-attachment-input"
            />
            <label
              htmlFor="ai-attachment-input"
              title="Attach a photo"
              className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <ImageIcon size={16} />
            </label>
            <label
              htmlFor="ai-attachment-input"
              title="Attach a voice note"
              className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <Mic size={16} />
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ask the AI assistant…"
              rows={1}
              className="flex-1 resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as FormEvent);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !publicId || (!body.trim() && !attachment)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
