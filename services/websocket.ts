import { DEFAULT_WS_GROUP, WS_URL, getStoredApiKey } from "@/lib/env";

export function buildWebSocketUrl(symbols?: string[], group = DEFAULT_WS_GROUP) {
  void symbols;
  void group;
  const params = new URLSearchParams();
  const apiKey = getStoredApiKey();
  if (apiKey) params.set("api_key", apiKey);
  const query = params.toString();
  return query ? `${WS_URL}?${query}` : WS_URL;
}

export function encodeSubscribe(symbols: string[]) {
  return JSON.stringify({ type: "subscribe", symbols: symbols.map((symbol) => symbol.toUpperCase()) });
}

export function encodeUnsubscribe(symbols: string[]) {
  return JSON.stringify({ type: "unsubscribe", symbols: symbols.map((symbol) => symbol.toUpperCase()) });
}

export function encodeSubscribeGroup(group: string) {
  return JSON.stringify({ type: "subscribe_group", group });
}

export function encodePing() {
  return JSON.stringify({ type: "ping", ts: Date.now() / 1000 });
}

export function encodePong() {
  return JSON.stringify({ type: "pong", ts: Date.now() / 1000 });
}
