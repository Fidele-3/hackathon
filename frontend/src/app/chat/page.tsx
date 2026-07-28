"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, Mic, SendHorizontal } from "lucide-react";
import { streamChatReply } from "@/lib/ai/gemini";
import { useFarmerStore } from "@/lib/farmer-store";
import { sleep } from "@/lib/utils";

type Msg = { id: string; role: "user" | "ai"; text: string };

function ChatInner() {
  const router = useRouter();
  const params = useSearchParams();
  const voiceFirst = params.get("voice") === "1";
  const { language } = useFarmerStore();
  const rw = language === "rw";
  const endRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(
    voiceFirst ? (rw ? "Ibigori byanjye birwaye" : "My maize leaves are turning yellow") : "",
  );
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "hi",
      role: "ai",
      text: rw
        ? "Muraho! Ndi E-Hinga AI — umujyanama wawe w'ubuhinzi. Vuga, andika, cyangwa ohereza ifoto."
        : "Hello! I'm E-Hinga AI — your pocket agronomist. Speak, type, or send a photo.",
    },
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: trimmed }]);
    setTyping(true);
    await sleep(500);
    const id = `a-${Date.now()}`;
    setTyping(false);
    setMessages((m) => [...m, { id, role: "ai", text: "" }]);
    const full = await streamChatReply(trimmed, language, (partial) => {
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: partial } : msg)));
    });
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(full.replace(/\*\*/g, ""));
      u.lang = rw ? "rw-RW" : "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }

  async function onVoice() {
    setListening(true);
    await sleep(1400);
    const phrase = rw ? "Ibigori byanjye birwaye" : "My maize leaves are turning yellow";
    setInput(phrase);
    setListening(false);
    await send(phrase);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#E5DDD5] pb-tabbar">
      <header
        className="flex items-center gap-3 bg-[#1B5E20] px-4 py-3 text-white shadow-md"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Link href="/" className="rounded-full p-1 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/app-icon.png" alt="" className="h-10 w-10 rounded-full bg-white object-contain p-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold">E-Hinga AI</p>
          <p className="text-[11px] text-white/70">
            {typing ? (rw ? "irandika…" : "typing…") : "Gemini · online"}
          </p>
        </div>
        <button type="button" onClick={() => router.push("/diagnose")} className="rounded-full bg-white/15 p-2">
          <Camera className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "rounded-br-md bg-[#DCF8C6]"
                  : "rounded-bl-md bg-white"
              }`}
            >
              {msg.text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {typing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-[#1B1C1A]/35"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-black/5 bg-[#F0F2F5] px-2 py-2">
        <div className="mb-2 flex gap-2 px-1">
          <button
            type="button"
            onClick={onVoice}
            className={`rounded-full p-2 shadow-sm ${listening ? "bg-[#EA4335] text-white" : "bg-white text-[#2E7D32]"}`}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/diagnose")}
            className="rounded-full bg-white p-2 text-[#2E7D32] shadow-sm"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={rw ? "Andika ubutumwa…" : "Type a message…"}
            className="flex-1 rounded-3xl border-0 bg-white px-4 py-3 text-sm outline-none"
          />
          <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075E54] text-white">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </form>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-[#E5DDD5]">Loading...</div>}>
      <ChatInner />
    </Suspense>
  );
}
