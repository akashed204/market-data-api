import { get, post } from "@/services/api";
import type { AddSymbolRequest, SymbolRecord } from "@/types/market";

export type SymbolListResponse = {
  count: number;
  active_symbols: SymbolRecord[];
  watchlists: Record<string, string[]>;
  metrics: Record<string, number | string | boolean>;
};

export function listSymbols() {
  return get<SymbolListResponse>("/symbols/list");
}

export function addSymbol(payload: AddSymbolRequest) {
  return post("/symbols/add", payload);
}

export function removeSymbol(symbol: string, exchange?: string) {
  return post("/symbols/remove", { symbol, exchange });
}

