"use client";

import { create } from "zustand";
import type { ConnectionStatus } from "@/types/market";

type WebSocketState = {
  status: ConnectionStatus;
  lastMessageAt?: number;
  reconnects: number;
  latencyMs: number;
  subscribedSymbols: string[];
  setStatus: (status: ConnectionStatus) => void;
  markMessage: () => void;
  markReconnect: () => void;
  setLatency: (latencyMs: number) => void;
  setSubscribedSymbols: (symbols: string[]) => void;
};

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: "idle",
  reconnects: 0,
  latencyMs: 0,
  subscribedSymbols: [],
  setStatus: (status) => set({ status }),
  markMessage: () => set({ lastMessageAt: Date.now() }),
  markReconnect: () => set((state) => ({ reconnects: state.reconnects + 1 })),
  setLatency: (latencyMs) => set({ latencyMs }),
  setSubscribedSymbols: (subscribedSymbols) => set({ subscribedSymbols }),
}));
