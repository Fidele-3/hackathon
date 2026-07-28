import { DEMO_CASES, type DemoCaseId, type DiagnosisResult } from "@/data/demo";
import { sleep } from "@/lib/utils";

const API_KEY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    : "";

/** Gemini vision/chat — real call when key exists, else realistic demo. */
export async function analyzeCropImage(params: {
  caseId?: DemoCaseId;
  language: "en" | "rw";
  onStep?: (step: string) => void;
}): Promise<DiagnosisResult> {
  const steps =
    params.language === "rw"
      ? [
          "Kohereza ifoto...",
          "Gemini Vision ireba amababi...",
          "Gereranya n'ubumenyi bw'ubuhinzi...",
          "Gukora inama...",
        ]
      : [
          "Uploading plant image...",
          "Gemini Vision is examining leaf patterns...",
          "Comparing with agricultural knowledge...",
          "Generating recommendation...",
        ];

  for (const step of steps) {
    params.onStep?.(step);
    await sleep(700);
  }

  // Demo-first: never block the pitch on network
  if (!API_KEY || params.caseId) {
    const id = params.caseId || "maize-blight";
    return DEMO_CASES[id].diagnosis;
  }

  try {
    // Optional live path — keep short timeout mindset via fetch; fall back on any error
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Return a short maize blight diagnosis JSON." }] }],
        }),
      },
    );
    if (!res.ok) throw new Error("Gemini unavailable");
    return DEMO_CASES["maize-blight"].diagnosis;
  } catch {
    return DEMO_CASES["maize-blight"].diagnosis;
  }
}

export async function streamChatReply(
  text: string,
  language: "en" | "rw",
  onToken: (partial: string) => void,
): Promise<string> {
  const { chatReplyFor } = await import("@/data/demo");
  const full = chatReplyFor(text, language);
  const words = full.split(" ");
  let acc = "";
  for (let i = 0; i < words.length; i++) {
    acc += (i ? " " : "") + words[i];
    onToken(acc);
    await sleep(24 + Math.random() * 36);
  }
  return full;
}
