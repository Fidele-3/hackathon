export type Language = "en" | "rw";

export type Diagnosis = {
  crop: string;
  problem: string;
  confidence: number;
  severity: "high" | "medium" | "low";
  evidence: string[];
  recommendation: string;
  reasoning_steps: string[];
  language: Language;
  should_escalate: boolean;
  escalation_reason: string;
  explanation: string;
};

export type CropScanResponse = {
  diagnosis_id: number;
  diagnosis: Diagnosis;
  escalated: boolean;
  issue_id: number | null;
  escalation_error: string | null;
};

export type PriorityAlert = {
  issue_id: number;
  status: string;
  urgent: boolean;
  problem: string;
  crop: string;
  severity: string;
  confidence: number | null;
  recommendation: string;
  escalation_reason: string;
  farmer: { name: string; phone: string; public_id: string };
  location: string;
  created_at: string;
  recommended_action: string;
};

export type AuthUser = {
  public_id: string;
  phone_number: string;
  full_name: string;
  user_level: string;
};

export type FieldHotspot = {
  label: string;
  x: number;
  y: number;
  intensity: number;
};

export type FieldCrop = {
  name: string;
  location: string;
  health: string;
};

export type FieldReport = {
  crop: string;
  problem: string;
  confidence: number;
  severity: string;
  area_affected_pct: number;
  disease_spreading: string;
  hotspots: FieldHotspot[];
  crops_located: FieldCrop[];
  recommendation: string;
  summary: string;
  language: Language;
  engine?: string;
};

export type FieldScanResponse = {
  scan_id: number;
  report: FieldReport;
  nano_verified: boolean;
};
