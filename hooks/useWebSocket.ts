"use client";

import { useEffect, useMemo, useRef } from "react";
import { encodePong, encodeSubscribe, buildWebSocketUrl } from "@/services/websocket";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useWebSocketStore } from "@/store/websocketStore";
import type { MarketProfile, TickMessage } from "@/types/market";

const FLUSH_MS = 80;
const STALE_MS = 20_000;
const HEARTBEAT_MS = 15_000;

type Options = {
  symbols?: string[];
  group?: string;
  enabled?: boolean;
};

export function useWebSocket({ symbols, group, enabled = true }: Options = {}) {
  const applyTickBatch = useWatchlistStore((state) => state.applyTickBatch);
  const markStaleQuotes = useWatchlistStore((state) => state.markStaleQuotes);
  const upsertProfile = useAnalyticsStore((state) => state.upsertProfile);
  const setStatus = useWebSocketStore((state) => state.setStatus);
  const markMessage = useWebSocketStore((state) => state.markMessage);
  const markReconnect = useWebSocketStore((state) => state.markReconnect);
  const setSubscribedSymbols = useWebSocketStore((state) => state.setSubscribedSymbols);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const flushTimer = useRef<number | null>(null);
  const heartbeatTimer = useRef<number | null>(null);
  const staleTimer = useRef<number | null>(null);
  const ticksRef = useRef<TickMessage[]>([]);
  const attemptRef = useRef(0);
  const lastMessageRef = useRef(Date.now());

  const symbolKey = useMemo(() => (symbols || []).map((symbol) => symbol.toUpperCase()).sort().join(","), [symbols]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    let closedByEffect = false;

    const flushTicks = () => {
      if (!ticksRef.current.length) return;
      const batch = ticksRef.current;
      ticksRef.current = [];
      applyTickBatch(batch);
    };

    const scheduleFlush = () => {
      if (flushTimer.current) return;
      flushTimer.current = window.setTimeout(() => {
        flushTimer.current = null;
        flushTicks();
      }, FLUSH_MS);
    };

    const connect = () => {
      setStatus(attemptRef.current === 0 ? "connecting" : "reconnecting");
      const url = buildWebSocketUrl(symbols, group);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        lastMessageRef.current = Date.now();
        setStatus("live");
        if (symbols?.length) {
          ws.send(encodeSubscribe(symbols));
          setSubscribedSymbols(symbols.map((symbol) => symbol.toUpperCase()));
        }
      };

      ws.onmessage = (event) => {
        lastMessageRef.current = Date.now();
        markMessage();
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "ping") {
            ws.send(encodePong());
            return;
          }
          if (payload.type === "tick" && payload.symbol) {
            ticksRef.current.push(payload);
            scheduleFlush();
            return;
          }
          if (payload.type === "market_profile" && payload.symbol) {
            upsertProfile(payload as MarketProfile);
          }
        } catch {
          // Diagnostic frames from proxies are ignored.
        }
      };

      ws.onerror = () => setStatus("error");

      ws.onclose = () => {
        flushTicks();
        if (closedByEffect) return;
        setStatus("disconnected");
        markReconnect();
        attemptRef.current += 1;
        const backoff = Math.min(30_000, 1_000 * 2 ** Math.min(attemptRef.current, 5));
        reconnectTimer.current = window.setTimeout(connect, backoff);
      };
    };

    connect();

    heartbeatTimer.current = window.setInterval(() => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping", ts: Date.now() / 1000 }));
    }, HEARTBEAT_MS);

    staleTimer.current = window.setInterval(() => {
      markStaleQuotes();
      if (Date.now() - lastMessageRef.current > STALE_MS && wsRef.current?.readyState === WebSocket.OPEN) {
        setStatus("stale");
      }
    }, 5_000);

    return () => {
      closedByEffect = true;
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      if (flushTimer.current) window.clearTimeout(flushTimer.current);
      if (heartbeatTimer.current) window.clearInterval(heartbeatTimer.current);
      if (staleTimer.current) window.clearInterval(staleTimer.current);
      wsRef.current?.close();
    };
  }, [
    applyTickBatch,
    enabled,
    group,
    markMessage,
    markReconnect,
    markStaleQuotes,
    setStatus,
    setSubscribedSymbols,
    symbolKey,
    symbols,
    upsertProfile,
  ]);
}

