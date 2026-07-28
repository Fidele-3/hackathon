import type { CropScanResponse, Diagnosis } from "./types";

/** Scripted demo diagnosis — Northern Corn Leaf Blight (guaranteed wow path). */
export const DEMO_DIAGNOSIS: Diagnosis = {
  crop: "Maize / Ibigori",
  problem: "Northern Corn Leaf Blight",
  confidence: 0.97,
  severity: "medium",
  evidence: [
    "Elongated gray-green lesions on leaves",
    "Lesions expanding along leaf veins",
    "Lower canopy more affected",
  ],
  recommendation:
    "Spray mancozeb or chlorothalonil on affected areas only. Remove heavily infected leaves. Avoid overhead watering at night.",
  reasoning_steps: [
    "Image received",
    "Leaf patterns detected",
    "Compared with disease database",
    "Weather risk considered",
  ],
  language: "en",
  should_escalate: true,
  escalation_reason: "Moderate blight risk — field inspection advised within 48 hours.",
  explanation:
    "Your maize has a fungal disease called Northern Corn Leaf Blight. It spreads in warm, humid weather. Treat soon to protect the rest of the field.",
};

export const DEMO_DIAGNOSIS_RW: Diagnosis = {
  ...DEMO_DIAGNOSIS,
  language: "rw",
  problem: "Indwara y'Amababi y'Ibigori (Northern Corn Leaf Blight)",
  recommendation:
    "Fata umuti wa mancozeb cyangwa chlorothalonil ku bice byanduye gusa. Kurandura amababi yanduye cyane. Ntuhire amazi nijoro.",
  explanation:
    "Ibigori byawe bifite indwara y'ubwoko bwa fungus. Nka cold ku bantu. Fata umuti, kandi wirinde kuhira nijoro.",
  reasoning_steps: [
    "Ifoto yakiriwe",
    "Ibimenyetso by'amababi byabonetse",
    "Byagereranyijwe n'indwara zizwi",
    "Ibintu by'ikirere byafasweho",
  ],
  escalation_reason: "Indwara ishobora gukwira — ushinzwe ubuhinzi agomba gusura umurima.",
};

export const THINKING_STEPS_EN = [
  { icon: "🔍", label: "Detecting disease" },
  { icon: "🌱", label: "Looking at leaves" },
  { icon: "📈", label: "Comparing with 3M samples" },
  { icon: "🧠", label: "Gemini Thinking..." },
];

export const THINKING_STEPS_RW = [
  { icon: "🔍", label: "Gushakisha indwara" },
  { icon: "🌱", label: "Reba amababi" },
  { icon: "📈", label: "Gereranya n'ibisobanuro byinshi" },
  { icon: "🧠", label: "Gemini iratekereza..." },
];

export const DEMO_TIMELINE = [
  { day: "Today", label: "Lesions on lower leaves", risk: 22 },
  { day: "2 days", label: "Spreads mid-canopy", risk: 45 },
  { day: "5 days", label: "Yield at risk", risk: 70 },
  { day: "7 days", label: "Severe field loss", risk: 88 },
];

export const DEMO_VOICE_RW = "Ibigori byanjye biri guhinduka umuhondo";

export const DEMO_TTS_RW =
  "Muraho. Ndabona ibigori byawe bifite indwara y'amababi. Ni fungus. Fata umuti ku bice byanduye. Niba bikomeye, twahamagaye umukozi w'ubuhinzi.";

export const DEMO_TTS_EN =
  "Hello. I can see your maize has leaf blight — a fungus, like a cold in humans. Spray the medicine on affected areas. I've flagged this for your cell officer if needed.";

export function buildDemoScanResponse(language: "en" | "rw"): CropScanResponse {
  const diagnosis = language === "rw" ? DEMO_DIAGNOSIS_RW : DEMO_DIAGNOSIS;
  return {
    diagnosis_id: -1,
    diagnosis,
    escalated: false,
    issue_id: null,
    escalation_error: null,
  };
}

/** Tiny inline SVG used as demo maize leaf preview (no network). */
export const DEMO_LEAF_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8BC34A"/>
      <stop offset="100%" stop-color="#2E7D32"/>
    </linearGradient>
  </defs>
  <rect width="640" height="480" fill="#E8F5E9"/>
  <ellipse cx="320" cy="240" rx="180" ry="70" fill="url(#g)" transform="rotate(-25 320 240)"/>
  <ellipse cx="300" cy="220" rx="40" ry="12" fill="#F9A825" opacity="0.85" transform="rotate(-20 300 220)"/>
  <ellipse cx="340" cy="250" rx="55" ry="14" fill="#FBC02D" opacity="0.9" transform="rotate(-30 340 250)"/>
  <ellipse cx="280" cy="260" rx="35" ry="10" fill="#EF6C00" opacity="0.75" transform="rotate(-15 280 260)"/>
  <text x="40" y="440" fill="#1B5E20" font-family="sans-serif" font-size="18">Demo · Northern Corn Leaf Blight</text>
</svg>
`)}`;
