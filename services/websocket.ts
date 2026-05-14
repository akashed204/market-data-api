import { DEFAULT_WS_GROUP, WS_URL, getStoredApiKey } from "@/lib/env";

export function buildWebSocketUrl(symbols?: string[], group = DEFAULT_WS_GROUP) {
  const params = new URLSearchParams();
  const apiKey = getStoredApiKey();
  if (apiKey) params.set("api_key", apiKey);
  if (symbols?.length) params.set("symbols", symbols.map((symbol) => symbol.toUpperCase()).join(","));
  else if (group) params.set("group", group);
  const query = params.toString();
  return query ? `${WS_URL}?${query}` : WS_URL;
}

export function encodeSubscribe(symbols: string[]) {
  return JSON.stringify({ type: "subscribe", symbols: symbols.map((symbol) => symbol.toUpperCase()) });
}

export function encodePong() {
  return JSON.stringify({ type: "pong", ts: Date.now() / 1000 });
}
