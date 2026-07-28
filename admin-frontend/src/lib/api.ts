import { useAuthStore } from "./auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8010/api/v1";

interface Envelope<T> {
  status: "success" | "error";
  status_code: number;
  data: T | null;
  message: string | null;
  errors: unknown;
}

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refresh, setAccess, logout } = useAuthStore.getState();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) {
          logout();
          return null;
        }
        const body = await res.json();
        const newAccess = body.access as string;
        setAccess(newAccess);
        return newAccess;
      })
      .catch(() => {
        logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  isForm?: boolean;
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = "GET", body, isForm = false, skipAuth = false } = options;
  const { access } = useAuthStore.getState();

  const headers: Record<string, string> = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (access && !skipAuth) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 401 && !skipAuth && !isRetry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return request<T>(path, options, true);
    }
  }

  const text = await res.text();
  const parsed: Envelope<T> | null = text ? JSON.parse(text) : null;

  if (!res.ok || parsed?.status === "error") {
    const message = parsed?.message ?? res.statusText ?? "Request failed.";
    throw new ApiError(message, res.status, parsed?.errors ?? null);
  }

  return (parsed?.data as T) ?? (null as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Partial<RequestOptions>) =>
    request<T>(path, { method: "POST", body, ...options }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
};
