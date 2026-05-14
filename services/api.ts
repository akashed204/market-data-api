import { API_URL, getStoredApiKey } from "@/lib/env";

type RequestOptions = RequestInit & { timeoutMs?: number };

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(typeof payload === "string" ? payload : `API request failed with status ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const apiKey = getStoredApiKey();
  if (apiKey) headers.set("X-API-Key", apiKey);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) throw new ApiError(response.status, payload);
    return payload as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function get<T>(path: string) {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function toUserMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "Backend timeout. FastAPI did not respond.";
  if (error instanceof ApiError) {
    const detail = (error.payload as { detail?: unknown })?.detail;
    if (typeof detail === "string") return detail;
    if (detail && typeof detail === "object" && "error" in detail) return String((detail as { error: string }).error);
    if (error.status === 401) return "Missing or invalid API key.";
    if (error.status === 404) return "No backend data is available for that request yet.";
    return `Request failed with status ${error.status}.`;
  }
  return error instanceof Error ? error.message : "Unexpected frontend error.";
}
