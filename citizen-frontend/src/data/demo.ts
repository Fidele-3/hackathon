import type { Language } from "@/lib/types";

export type FarmingType = "crop" | "livestock" | "vegetable";

export type DemoCaseId =
  | "healthy-maize"
  | "maize-blight"
  | "tomato-fungal"
  | "coffee-leaf"
  | "livestock";

export type DiagnosisResult = {
  disease: string;
  diseaseRw: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  affectedArea: number;
  risk: string;
  riskRw: string;
  recommendation: string[];
  recommendationRw: string[];
  simple: string;
  simpleRw: string;
  evidence: string[];
  evidenceRw: string[];
};

export const FARMER = {
  name: "Jean Habimana",
  firstName: "Jean",
  location: {
    country: "Rwanda",
    province: "Northern Province",
    district: "Musanze",
    cell: "Cyabararika",
  },
  farm: {
    crop: "Maize",
    cropRw: "Ibigori",
    hectares: 0.25,
    healthScore: 97,
  },
  officer: {
    name: "Alice Uwase",
    role: "Cell Agronomist",
    roleRw: "Umujyanama w'Ubuhinzi",
    distance: "500 meters away",
    distanceRw: "Metero 500",
    phone: "+250 788 000 010",
  },
};

export const DEMO_CASES: Record<
  DemoCaseId,
  {
    id: DemoCaseId;
    title: string;
    titleRw: string;
    image: string;
    diagnosis: DiagnosisResult;
  }
> = {
  "healthy-maize": {
    id: "healthy-maize",
    title: "Healthy maize",
    titleRw: "Ibigori byiza",
    image: "/demo/healthy-crop.jpg",
    diagnosis: {
      disease: "Healthy crop",
      diseaseRw: "Igihingwa gifite ubuzima bwiza",
      confidence: 0.98,
      severity: "low",
      affectedArea: 2,
      risk: "Low — keep monitoring",
      riskRw: "Buke — komeza gukurikirana",
      recommendation: [
        "Continue regular weeding",
        "Maintain soil moisture",
        "Scout again after rain",
      ],
      recommendationRw: [
        "Komeza kurandura ibyatsi",
        "Menya ko ubutaka bufite ubushyuhe buhagije",
        "Ongera usuzume nyuma y'imvura",
      ],
      simple: "Your maize looks healthy. Keep doing what you are doing.",
      simpleRw: "Ibigori byawe biri meza. Komeza uko ubikora.",
      evidence: ["Uniform green canopy", "No lesion patterns"],
      evidenceRw: ["Amababi y'icyatsi cyiza", "Nta bimenyetso by'indwara"],
    },
  },
  "maize-blight": {
    id: "maize-blight",
    title: "Diseased maize",
    titleRw: "Ibigori birwaye",
    image: "/demo/maize-blight.jpg",
    diagnosis: {
      disease: "Northern Corn Leaf Blight",
      diseaseRw: "Indwara y'Amababi y'Ibigori (NCLB)",
      confidence: 0.96,
      severity: "medium",
      affectedArea: 18,
      risk: "High if untreated",
      riskRw: "Byinshi niba bitavuwe",
      recommendation: [
        "Remove infected leaves",
        "Apply approved fungicide on affected area only",
        "Avoid watering leaves at night",
      ],
      recommendationRw: [
        "Kurandura amababi yanduye",
        "Fata umuti wemewe ku bice byanduye gusa",
        "Ntuhire amababi nijoro",
      ],
      simple:
        "Your maize has a fungus — like a cold in humans. Spray medicine on sick leaves. Do not water leaves at night.",
      simpleRw:
        "Ibigori byawe bifite fungus — nka cold ku bantu. Fata umuti ku mababi arwaye. Ntuhire amababi nijoro.",
      evidence: [
        "Elongated gray-green lesions",
        "Lower canopy more affected",
        "Humidity-favorable pattern",
      ],
      evidenceRw: [
        "Amaribati y'umuhondo ku mababi",
        "Amababi yo hasi aranduye cyane",
        "Ubushyuhe bufasha indwara",
      ],
    },
  },
  "tomato-fungal": {
    id: "tomato-fungal",
    title: "Tomato fungal infection",
    titleRw: "Indwara y'inyanya",
    image: "/demo/tomato-disease.jpg",
    diagnosis: {
      disease: "Early Blight (Alternaria)",
      diseaseRw: "Early Blight ku nyanya",
      confidence: 0.93,
      severity: "medium",
      affectedArea: 22,
      risk: "Spreads fast in humid weather",
      riskRw: "Irakwira vuba iyo hari ubushyuhe",
      recommendation: [
        "Remove lower infected leaves",
        "Improve air flow between plants",
        "Use copper-based fungicide if available",
      ],
      recommendationRw: [
        "Kurandura amababi yo hasi yanduye",
        "Tanga umwuka mu bihingwa",
        "Koresha umuti wa copper niba uhari",
      ],
      simple: "Tomato leaves have a fungus. Cut sick leaves. Give plants space to breathe.",
      simpleRw: "Amababi y'inyanya afite fungus. Kata ayanduye. Tanga umwuka.",
      evidence: ["Target-spot lesions", "Yellowing around spots"],
      evidenceRw: ["Ibimenyetso nka target", "Umuhondo inkuru y'amaribati"],
    },
  },
  "coffee-leaf": {
    id: "coffee-leaf",
    title: "Coffee leaf disease",
    titleRw: "Indwara y'ikawa",
    image: "/demo/coffee-leaf.jpg",
    diagnosis: {
      disease: "Coffee Leaf Rust",
      diseaseRw: "Umusuri w'ikawa",
      confidence: 0.91,
      severity: "high",
      affectedArea: 27,
      risk: "Yield loss likely without treatment",
      riskRw: "Umusaruro ushobora kugabanuka",
      recommendation: [
        "Remove heavily infected leaves",
        "Apply recommended rust fungicide",
        "Contact cell agronomist for spray timing",
      ],
      recommendationRw: [
        "Kurandura amababi yanduye cyane",
        "Fata umuti w'umusuri",
        "Vugana n'umujyanama ku gihe cyo gufata umuti",
      ],
      simple: "Coffee leaves have rust. Treat soon or harvest may drop.",
      simpleRw: "Amababi y'ikawa afite umusuri. Fata umuti vuba.",
      evidence: ["Orange powdery spots underside", "Yellow patches on top"],
      evidenceRw: ["Ibara ry'umuhondo munsi", "Amabara yo hejuru"],
    },
  },
  livestock: {
    id: "livestock",
    title: "Livestock health check",
    titleRw: "Isuzuma ry'amatungo",
    image: "/demo/cow-health.jpg",
    diagnosis: {
      disease: "Possible skin irritation / early mange",
      diseaseRw: "Ishuri ry'uruhu / mange",
      confidence: 0.86,
      severity: "medium",
      affectedArea: 12,
      risk: "May spread to other animals",
      riskRw: "Ishobora gukwira ku zindi",
      recommendation: [
        "Isolate the animal if possible",
        "Clean the shed and bedding",
        "Ask the veterinary officer to inspect",
      ],
      recommendationRw: [
        "Tandukanya n'izindi niba bishoboka",
        "Sukura uruhuko",
        "Saba umuveterineri gusuzuma",
      ],
      simple: "The animal's skin looks irritated. Keep it clean and call the vet officer.",
      simpleRw: "Uruhu rw'itungo rurwaye. Sukura, hamagara umuveterineri.",
      evidence: ["Patchy hair loss", "Visible scratching marks"],
      evidenceRw: ["Imvi zibuze", "Ibimenyetso byo kwiyega"],
    },
  },
};

export const TIMELINE = [
  { month: "January", monthRw: "Mutarama", status: "Healthy", statusRw: "Meza", tone: "good" },
  { month: "February", monthRw: "Gashyantare", status: "Early warning", statusRw: "Iburira", tone: "warn" },
  { month: "March", monthRw: "Werurwe", status: "Disease detected", statusRw: "Indwara yabonetse", tone: "bad" },
];

export const TREATMENT_CALENDAR = [
  { when: "Today", whenRw: "Uyu munsi", task: "Remove infected leaves", taskRw: "Kurandura amababi yanduye" },
  { when: "Tomorrow", whenRw: "Ejo", task: "Apply treatment", taskRw: "Fata umuti" },
  { when: "In 3 days", whenRw: "Mu minsi 3", task: "Re-check field", taskRw: "Ongera usuzume" },
];

export function chatReplyFor(message: string, language: Language): string {
  const lower = message.toLowerCase();
  const blight = DEMO_CASES["maize-blight"].diagnosis;
  if (
    lower.includes("yellow") ||
    lower.includes("umuhondo") ||
    lower.includes("blight") ||
    lower.includes("birwaye") ||
    lower.includes("leaves") ||
    lower.includes("amababi")
  ) {
    if (language === "rw") {
      return `Ibigori byawe bishobora kugira **${blight.diseaseRw}**.\n\nIcyizere: **${Math.round(blight.confidence * 100)}%**\n\nIndwara irakwira bitewe n'ubushyuhe.\n\n**Ibikorwa:**\n1. ${blight.recommendationRw[0]}\n2. ${blight.recommendationRw[1]}\n3. ${blight.recommendationRw[2]}`;
    }
    return `Your maize may have **${blight.disease}**.\n\nConfidence: **${Math.round(blight.confidence * 100)}%**\n\nThe disease is spreading because of humidity.\n\n**Recommended action:**\n1. ${blight.recommendation[0]}\n2. ${blight.recommendation[1]}\n3. ${blight.recommendation[2]}`;
  }
  if (language === "rw") {
    return "Ndabyumvise. Ohereza ifoto y'amababi cyangwa video y'umurima ngo nsuzume neza.";
  }
  return "I understand. Send a leaf photo or a short field video so I can diagnose clearly.";
}

export const FIELD_VIDEO_RESULT = {
  field: "Maize farm",
  fieldRw: "Umurima w'ibigori",
  disease: "Leaf blight",
  diseaseRw: "Indwara y'amababi",
  affectedArea: 24,
  location: "North-east section",
  locationRw: "Impande y'amajyaruguru-uburasirazuba",
  recommendation: "Treat affected area first. Skip healthy border rows.",
  recommendationRw: "Tangira ku bice byanduye. Siga imirongo meza.",
};
