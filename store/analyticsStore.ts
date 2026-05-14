"use client";

import { create } from "zustand";
import type { MarketProfile, ScannerPayload } from "@/types/market";

type AnalyticsState = {
  profiles: Record<string, MarketProfile>;
  scanner: Record<string, ScannerPayload>;
  runtime: Record<string, unknown>;
  replayMode: boolean;
  replaySpeed: number;
  upsertProfile: (profile: MarketProfile) => void;
  setScanner: (key: string, payload: ScannerPayload) => void;
  setRuntime: (runtime: Record<string, unknown>) => void;
  setReplayMode: (enabled: boolean) => void;
  setReplaySpeed: (speed: number) => void;
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  profiles: {},
  scanner: {},
  runtime: {},
  replayMode: false,
  replaySpeed: 1,
  upsertProfile: (profile) =>
    set((state) => ({
      profiles: {
        ...state.profiles,
        [profile.symbol.toUpperCase()]: {
          ...profile,
          last_update: profile.last_update || Date.now() / 1000,
        },
      },
    })),
  setScanner: (key, payload) => set((state) => ({ scanner: { ...state.scanner, [key]: payload } })),
  setRuntime: (runtime) => set({ runtime }),
  setReplayMode: (replayMode) => set({ replayMode }),
  setReplaySpeed: (replaySpeed) => set({ replaySpeed }),
}));

