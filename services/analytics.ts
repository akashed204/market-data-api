import { get } from "@/services/api";
import type { MarketProfile, ScannerPayload } from "@/types/market";

export function getMarketProfile(symbol: string) {
  return get<MarketProfile>(`/market-profile/live/${encodeURIComponent(symbol)}`);
}

export function getMarketContext(symbol: string) {
  return get<MarketProfile>(`/market-profile/context/${encodeURIComponent(symbol)}`);
}

export function getMomentumScan(limit = 20) {
  return get<ScannerPayload>(`/scanner/momentum?limit=${limit}`);
}

export function getBreakoutScan(limit = 20) {
  return get<ScannerPayload>(`/scanner/breakout?limit=${limit}`);
}

export function getVwapDeviationScan(limit = 20) {
  return get<ScannerPayload>(`/scanner/vwap-deviation?limit=${limit}`);
}

export function getRuntimeMetrics() {
  return get<Record<string, unknown>>("/metrics/runtime");
}

export function getAllLiveQuotes() {
  return get<{ count: number; data: unknown[] }>("/live/quotes");
}

