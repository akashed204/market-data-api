export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8020";
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || API_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/ws/live";
export const DEFAULT_WS_GROUP = process.env.NEXT_PUBLIC_WS_GROUP || "production_nse";
export const API_KEY_STORAGE_KEY = "charu.market.apiKey";

export function getStoredApiKey() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

export function setStoredApiKey(value: string) {
  if (typeof window === "undefined") return;
  const clean = value.trim();
  if (clean) window.localStorage.setItem(API_KEY_STORAGE_KEY, clean);
  else window.localStorage.removeItem(API_KEY_STORAGE_KEY);
}
