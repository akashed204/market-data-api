"use client";

import { create } from "zustand";
import type { LiveQuote, SymbolRecord, TickMessage } from "@/types/market";

type WatchlistState = {
  symbols: SymbolRecord[];
  watchlists: Record<string, string[]>;
  selectedSymbol: string;

  quotes: Record<string, LiveQuote>;

  setSymbols: (
    symbols: SymbolRecord[],
    watchlists: Record<string, string[]>
  ) => void;

  selectSymbol: (symbol: string) => void;

  removeSymbolLocal: (symbol: string) => void;

  updateQuotesBatch: (ticks: TickMessage[]) => void;

  applyTickBatch: (ticks: TickMessage[]) => void;

  markStaleQuotes: () => void;

  // FIXED: added missing type definition
  markAllStale: () => void;
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  symbols: [],

  watchlists: {},

  selectedSymbol: "TATASTEEL",

  quotes: {},

  setSymbols: (symbols, watchlists) =>
    set((state) => ({
      symbols,
      watchlists,
      selectedSymbol:
        state.selectedSymbol ||
        symbols[0]?.symbol ||
        "TATASTEEL",
    })),

  selectSymbol: (symbol) =>
    set({
      selectedSymbol: symbol.toUpperCase(),
    }),

  removeSymbolLocal: (symbol) =>
    set((state) => {
      const normalized = symbol.toUpperCase();

      const symbols = state.symbols.filter(
        (item) => item.symbol !== normalized
      );

      const quotes = { ...state.quotes };

      delete quotes[normalized];

      return {
        symbols,
        quotes,
      };
    }),

  updateQuotesBatch: (ticks) =>
    set((state) => {
      const quotes = { ...state.quotes };

      for (const tick of ticks) {
        const symbol = String(
          tick.symbol || ""
        ).toUpperCase();

        if (!symbol) continue;

        const previous = quotes[symbol];

        const ltp = toNumber(
          tick.ltp,
          previous?.ltp ?? 0
        );

        const ts = toNumber(
          tick.ts ?? tick.timestamp,
          Date.now() / 1000
        );

        quotes[symbol] = {
          symbol,

          exchange:
            tick.exchange ||
            previous?.exchange ||
            "NSE",

          ltp,

          change: toNumber(
            tick.change,
            previous?.change ?? 0
          ),

          changePercent: toNumber(
            tick.change_percent,
            previous?.changePercent ?? 0
          ),

          volume: toNumber(
            tick.volume,
            previous?.volume ?? 0
          ),

          vwap: toNumber(
            tick.vwap,
            previous?.vwap ?? 0
          ),

          high: toNumber(
            tick.high,
            Math.max(previous?.high ?? 0, ltp)
          ),

          low: toNumber(
            tick.low,
            previous?.low || ltp
          ),

          ts,

          // frontend live/stale tracking
          lastUpdateMs: Date.now(),

          previousLtp: previous?.ltp,

          direction: previous
            ? ltp > previous.ltp
              ? "up"
              : ltp < previous.ltp
              ? "down"
              : "flat"
            : "flat",

          stale: false,
        };
      }

      return { quotes };
    }),

  applyTickBatch: (ticks) =>
    get().updateQuotesBatch(ticks),

  // auto stale detection
  markStaleQuotes: () => {
    const nowMs = Date.now();

    const quotes = { ...get().quotes };

    for (const [symbol, quote] of Object.entries(quotes)) {
      const last =
        (quote as any).lastUpdateMs
          ? (quote as any).lastUpdateMs
          : (quote.ts || 0) * 1000;

      quotes[symbol] = {
        ...(quote as any),
        stale: nowMs - last > 15_000,
      } as any;
    }

    set({ quotes });
  },

  // FIXED: disconnect-safe stale state
  markAllStale: () => {
    const quotes = { ...get().quotes };

    for (const [symbol, quote] of Object.entries(quotes)) {
      quotes[symbol] = {
        ...(quote as any),
        stale: true,
      } as any;
    }

    set({ quotes });
  },
}));
