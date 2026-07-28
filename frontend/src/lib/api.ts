import type { AuthUser, CropScanResponse, FieldScanResponse, Language, PriorityAlert } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const TOKEN_KEY = "ehinga_access";
const REFRESH_KEY = "ehinga_refresh";
const USER_KEY = "ehinga_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function saveSession(access: string, refresh: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(", ")
          : data.message || `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return data as T;
}

export async function login(identifier: string, password: string, officer = false) {
  const path = officer ? "/auth/officer/login/" : "/auth/login/";
  const data = await api<{ access: string; refresh: string; user: AuthUser }>(path, {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  saveSession(data.access, data.refresh, data.user);
  return data.user;
}

export async function cropScan(params: {
  image?: File | Blob | null;
  text?: string;
  language: Language;
  landId?: number;
  autoEscalate?: boolean;
}) {
  const form = new FormData();
  if (params.image) form.append("image", params.image, "crop.jpg");
  if (params.text) form.append("text", params.text);
  form.append("language", params.language);
  form.append("auto_escalate", String(params.autoEscalate ?? true));
  if (params.landId) form.append("land_id", String(params.landId));
  return api<CropScanResponse>("/ai/crop-scan/", { method: "POST", body: form });
}

export async function fieldScan(params: {
  video?: File | Blob | null;
  frames?: Blob[];
  text?: string;
  language: Language;
  nanoHint?: Record<string, unknown>;
}) {
  const form = new FormData();
  if (params.video) form.append("video", params.video, "field.webm");
  (params.frames || []).forEach((frame, i) => form.append(`frame${i}`, frame, `frame${i}.jpg`));
  if (params.text) form.append("text", params.text);
  form.append("language", params.language);
  if (params.nanoHint) form.append("nano_hint", JSON.stringify(params.nanoHint));
  return api<FieldScanResponse>("/ai/field-scan/", { method: "POST", body: form });
}

export async function escalateDiagnosis(diagnosisId: number, landId?: number) {
  return api<{ escalated: boolean; issue_id: number | null }>("/ai/escalate/", {
    method: "POST",
    body: JSON.stringify({ diagnosis_id: diagnosisId, land_id: landId }),
  });
}

export async function transcribeVoice(audio: Blob, language: Language) {
  const form = new FormData();
  form.append("audio", audio, "voice.webm");
  form.append("language", language);
  return api<{ transcript: string; language: string }>("/ai/voice/transcribe/", {
    method: "POST",
    body: form,
  });
}

export async function fetchPriorityFeed() {
  return api<{ results: PriorityAlert[] }>("/ai/officer/priority-feed/");
}
