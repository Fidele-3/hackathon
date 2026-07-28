"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  ImageIcon,
  Mic,
  SendHorizontal,
  Sparkles,
  Video,
} from "lucide-react";
import { cropScan, transcribeVoice } from "@/lib/api";
import {
  DEMO_TTS_EN,
  DEMO_TTS_RW,
  DEMO_VOICE_RW,
  buildDemoScanResponse,
} from "@/lib/demo-data";
import { useApp } from "@/lib/app-context";
import { useFarmerStore } from "@/lib/store";
import { sleep } from "@/lib/utils";

type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  streaming?: boolean;
};

function ChatInner() {
  const { user, ready } = useApp();
  const { language, demoMode, setLastDiagnosis } = useFarmerStore();
  const router = useRouter();
  const params = useSearchParams();
  const voiceFirst = params.get("voice") === "1";
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(voiceFirst ? DEMO_VOICE_RW : "");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "ai",
      text:
        language === "rw"
          ? "Muraho! Ndi e-Hinga AI — umujyanama wawe w'ubuhinzi. Ohereza ifoto, vuga, cyangwa andika ikibazo."
          : "Hello! I'm e-Hinga AI — your pocket agronomist. Send a photo, speak, or type a question.",
    },
  ]);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function streamAiText(full: string) {
    const id = `ai-${Date.now()}`;
    setTyping(false);
    setMessages((m) => [...m, { id, role: "ai", text: "", streaming: true }]);
    const words = full.split(" ");
    let acc = "";
    for (let i = 0; i < words.length; i++) {
      acc += (i ? " " : "") + words[i];
      const snapshot = acc;
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text: snapshot } : msg)));
      await sleep(28 + Math.random() * 40);
    }
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, streaming: false } : msg)));
    return id;
  }

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === "rw" ? "rw-RW" : "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function sendText(text: string, image?: File | null) {
    const trimmed = text.trim();
    if (!trimmed && !image) return;
    setInput("");
    setMessages((m) => [
      ...m,
      {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed || (language === "rw" ? "📷 Ifoto y'igihingwa" : "📷 Crop photo"),
      },
    ]);
    setTyping(true);

    try {
      let reply: string;
      if (demoMode) {
        await sleep(900);
        const demo = buildDemoScanResponse(language);
        setLastDiagnosis(demo);
        reply =
          language === "rw"
            ? `Ndabona **${demo.diagnosis.problem}**.\n\nIcyizere: **97%**\nUburemere: **moderate**\n\n${demo.diagnosis.recommendation}\n\n[Suzuma byimbitse](/diagnose)`
            : `I can see **${demo.diagnosis.problem}**.\n\nConfidence: **97%**\nSeverity: **moderate**\n\n${demo.diagnosis.recommendation}\n\nOpen [Crop Doctor](/diagnose) for the full report.`;
        // Best-effort real log for officer path
        cropScan({
          text: trimmed || "Maize leaf blight symptoms",
          image,
          language,
          landId: 1,
          autoEscalate: false,
        }).catch(() => null);
      } else {
        const data = await cropScan({
          text: trimmed,
          image,
          language,
          landId: 1,
          autoEscalate: false,
        });
        setLastDiagnosis(data);
        const d = data.diagnosis;
        reply = `**${d.problem}**\n\nConfidence: **${Math.round(d.confidence * 100)}%**\nSeverity: **${d.severity}**\n\n${d.recommendation}`;
      }
      await streamAiText(reply);
      speak(language === "rw" ? DEMO_TTS_RW : DEMO_TTS_EN);
    } catch (err) {
      setTyping(false);
      await streamAiText(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendText(input);
  }

  async function toggleVoice() {
    if (listening) return;
    if (demoMode) {
      setListening(true);
      await sleep(1200);
      setInput(DEMO_VOICE_RW);
      setListening(false);
      await sendText(DEMO_VOICE_RW);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (ev) => chunks.push(ev.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setListening(false);
        try {
          const { transcript } = await transcribeVoice(
            new Blob(chunks, { type: "audio/webm" }),
            language,
          );
          setInput(transcript);
          await sendText(transcript);
        } catch {
          setInput(DEMO_VOICE_RW);
        }
      };
      setListening(true);
      recorder.start();
      setTimeout(() => recorder.stop(), 4000);
    } catch {
      setListening(false);
    }
  }

  if (!ready || !user) {
    return <div className="flex min-h-dvh items-center justify-center">…</div>;
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#E5DDD5]">
      <header className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white shadow-md">
        <Link href="/" className="rounded-full p-1 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="gemini-ring flex h-10 w-10 items-center justify-center rounded-full p-[2px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <Sparkles className="h-4 w-4 text-m3-primary" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">e-Hinga AI</p>
          <p className="text-[11px] text-white/70">
            {typing ? (language === "rw" ? "irandika…" : "typing…") : "Gemini · online"}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "rounded-br-md bg-[#DCF8C6] text-m3-onSurface"
                  : "rounded-bl-md bg-white text-m3-onSurface"
              }`}
            >
              <MessageBody text={msg.text} />
              {msg.streaming ? <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-m3-primary" /> : null}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {typing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-m3-onSurface/35 animate-typing"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-black/5 bg-[#F0F2F5] px-2 py-2">
        <div className="mb-2 flex gap-1.5 px-1">
          <IconBtn onClick={() => fileRef.current?.click()} label="Gallery">
            <ImageIcon className="h-4 w-4" />
          </IconBtn>
          <IconBtn onClick={() => fileRef.current?.click()} label="Camera">
            <Camera className="h-4 w-4" />
          </IconBtn>
          <Link href="/diagnose" className="rounded-full bg-white p-2 text-m3-primary shadow-sm">
            <Video className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={toggleVoice}
            className={`rounded-full p-2 shadow-sm ${listening ? "bg-g-red text-white" : "bg-white text-m3-primary"}`}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === "rw" ? "Andika ubutumwa…" : "Type a message…"}
            className="flex-1 rounded-3xl border-0 bg-white px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075E54] text-white shadow-md active:scale-95"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void sendText(input || (language === "rw" ? "Suzuma iyi foto" : "Diagnose this photo"), f);
          }}
        />
      </form>
    </main>
  );
}

function MessageBody({ text }: { text: string }) {
  // Minimal markdown: **bold** and [label](/path)
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={i} href={link[2]} className="font-semibold text-[#075E54] underline">
              {link[1]}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="rounded-full bg-white p-2 text-m3-primary shadow-sm">
      {children}
    </button>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-[#E5DDD5]">…</div>}>
      <ChatInner />
    </Suspense>
  );
}
