"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { login } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { useFarmerStore } from "@/lib/store";

export default function LoginPage() {
  const { user, setUser, ready } = useApp();
  const { language, setLanguage } = useFarmerStore();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("+250788000001");
  const [password, setPassword] = useState("demo1234");
  const [mode, setMode] = useState<"farmer" | "officer">("farmer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(user.user_level === "citizen" ? "/" : "/officer");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(identifier, password, mode === "officer");
      setUser(u);
      router.replace(u.user_level === "citizen" ? "/" : "/officer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-3xl bg-m3-primary text-white shadow-float">
          <Sprout className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-m3-onSurface">
          e-Hinga AI
        </h1>
        <p className="mt-2 text-base text-m3-onSurface/65">
          {language === "rw"
            ? "Umujyanama w'ubuhinzi mu mufuka wawe."
            : "The AI agronomist in every farmer's pocket."}
        </p>
      </motion.div>

      <div className="mt-8 mb-4 flex gap-1 rounded-full bg-white/70 p-1 shadow-sm">
        {(["farmer", "officer"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setIdentifier(m === "farmer" ? "+250788000001" : "+250788000010");
            }}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold transition ${
              mode === m ? "bg-m3-primary text-white shadow-soft" : "text-m3-onSurface/55"
            }`}
          >
            {m === "farmer"
              ? language === "rw"
                ? "Umuhinzi"
                : "Farmer"
              : language === "rw"
                ? "Umukozi"
                : "Officer"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-3xl border border-m3-outline/40 bg-white px-4 py-3.5 text-sm outline-none ring-m3-primary focus:ring-2"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={language === "rw" ? "Telefone" : "Phone"}
        />
        <input
          type="password"
          className="w-full rounded-3xl border border-m3-outline/40 bg-white px-4 py-3.5 text-sm outline-none ring-m3-primary focus:ring-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={language === "rw" ? "Ijambo ry'ibanga" : "Password"}
        />
        {error ? <p className="text-sm text-g-red">{error}</p> : null}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-m3-primary py-4 text-sm font-bold text-white shadow-float disabled:opacity-60"
        >
          {loading ? "…" : language === "rw" ? "Injira" : "Sign in"}
        </motion.button>
      </form>

      <button
        type="button"
        onClick={() => setLanguage(language === "en" ? "rw" : "en")}
        className="mt-6 text-center text-xs font-semibold text-m3-primary"
      >
        {language === "en" ? "Hindura mu Kinyarwanda" : "Switch to English"}
      </button>
    </main>
  );
}
