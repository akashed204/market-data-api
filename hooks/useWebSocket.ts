"use client";

import { useEffect, useMemo } from "react";
import { encodePing, encodePong, encodeSubscribe, encodeSubscribeGroup, encodeUnsubscribe, buildWebSocketUrl } from "@/services/websocket";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useWebSocketStore } from "@/store/websocketStore";
import type { MarketProfile, TickMessage } from "@/types/market";
import type { WebSocketInboundMessage } from "@/types/websocket";

const FLUSH_MS = 100;
const STALE_MS = 20_000;
const HEARTBEAT_MS = 15_000;
const MAX_BUFFER_SIZE = 5_000;
const STRICT_MODE_CLOSE_GRACE_MS = 600;
const MAX_BACKOFF_MS = 30_000;

type Options = {
  symbols?: string[];
  group?: string;
  enabled?: boolean;
};

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let flushTimer: number | null = null;
let heartbeatTimer: number | null = null;
let staleTimer: number | null = null;
let closeTimer: number | null = null;
let consumerCount = 0;
let reconnectAttempt = 0;
let droppedFrames = 0;
let lastMessageAt = Date.now();
let desiredGroup: string | undefined;
let desiredSymbols = new Set<string>();
let subscribedSymbols = new Set<string>();
let tickBuffer: TickMessage[] = [];
let profileBuffer: MarketProfile[] = [];

type TickBatchMessage = {
  type: "batch";
  ticks?: TickMessage[];
  ts?: number;
};

function devLog(message: string, metrics?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[ws] ${message}`, metrics || "");
  }
}

function normalizeSymbols(symbols?: string[]) {
  return Array.from(new Set((symbols || []).map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))).sort();
}

function sendFrame(frame: string) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(frame);
  }
}

function clearTimer(timer: number | null, clear: (timer: number) => void) {
  if (timer) clear(timer);
}

function recordSubscribedSymbols() {
  useWebSocketStore.getState().setSubscribedSymbols(Array.from(subscribedSymbols).sort());
}

function applySubscriptions() {
  if (socket?.readyState !== WebSocket.OPEN) return;

  const nextSymbols = desiredSymbols;
  const added = Array.from(nextSymbols).filter((symbol) => !subscribedSymbols.has(symbol));
  const removed = Array.from(subscribedSymbols).filter((symbol) => !nextSymbols.has(symbol));

  if (removed.length) {
    sendFrame(encodeUnsubscribe(removed));
    removed.forEach((symbol) => subscribedSymbols.delete(symbol));
  }

  if (added.length) {
    sendFrame(encodeSubscribe(added));
    added.forEach((symbol) => subscribedSymbols.add(symbol));
  } else if (!nextSymbols.size && desiredGroup && !subscribedSymbols.size) {
    sendFrame(encodeSubscribeGroup(desiredGroup));
  }

  recordSubscribedSymbols();
  devLog("subscription sync", { added: added.length, removed: removed.length, subscribed: subscribedSymbols.size });
}

function flushBuffers() {
  flushTimer = null;
  if (!tickBuffer.length && !profileBuffer.length) return;

  const startedAt = performance.now();
  const bufferedMessages = tickBuffer.length + profileBuffer.length;
  const ticks = tickBuffer;
  const profiles = profileBuffer;
  tickBuffer = [];
  profileBuffer = [];

  if (ticks.length) {
    useWatchlistStore.getState().updateQuotesBatch(ticks);
  }
  for (const profile of profiles) {
    useAnalyticsStore.getState().upsertProfile(profile);
  }

  const latencyMs = Math.round(performance.now() - startedAt);
  useWebSocketStore.getState().recordFlush({
    bufferedMessages,
    flushSize: ticks.length + profiles.length,
    droppedFrames,
    latencyMs,
  });
  devLog("flush", { ticks: ticks.length, profiles: profiles.length, droppedFrames, latencyMs });
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = window.setTimeout(flushBuffers, FLUSH_MS);
}

function enqueueTick(payload: TickMessage) {
  if (tickBuffer.length >= MAX_BUFFER_SIZE) {
    tickBuffer.shift();
    droppedFrames += 1;
  }
  tickBuffer.push(payload);
  scheduleFlush();
}

function enqueueTickBatch(payloads: TickMessage[]) {
  if (!payloads.length) return;
  const overflow = tickBuffer.length + payloads.length - MAX_BUFFER_SIZE;
  if (overflow > 0) {
    tickBuffer.splice(0, Math.min(overflow, tickBuffer.length));
    droppedFrames += overflow;
  }
  tickBuffer.push(...payloads);
  scheduleFlush();
}

function enqueueProfile(payload: MarketProfile) {
  if (profileBuffer.length >= MAX_BUFFER_SIZE) {
    profileBuffer.shift();
    droppedFrames += 1;
  }
  profileBuffer.push(payload);
  scheduleFlush();
}

function scheduleReconnect() {
  if (reconnectTimer || consumerCount <= 0) return;
  reconnectAttempt += 1;
  const backoff = Math.min(MAX_BACKOFF_MS, 1_000 * 2 ** Math.min(reconnectAttempt, 5));
  useWebSocketStore.getState().markReconnect();
  useWebSocketStore.getState().setStatus("disconnected");
  devLog("reconnect scheduled", { reconnectAttempt, backoff });
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, backoff);
}

function handleMessage(event: MessageEvent<string>) {
  lastMessageAt = Date.now();

  let payload: WebSocketInboundMessage;
  try {
    payload = JSON.parse(event.data) as WebSocketInboundMessage;
  } catch {
    return;
  }

  if (payload.type === "ping") {
    sendFrame(encodePong());
    return;
  }

  if (payload.type === "pong") {
    return;
  }

  if (payload.type === "batch") {
    const batch = payload as TickBatchMessage;
    const ticks = Array.isArray(batch.ticks)
      ? batch.ticks.filter((tick): tick is TickMessage => Boolean(tick && tick.symbol))
      : [];
    enqueueTickBatch(ticks);
    return;
  }

  if (payload.type === "tick" && payload.symbol) {
    enqueueTick(payload as TickMessage);
    return;
  }

  if (payload.type === "market_profile" && payload.symbol) {
    enqueueProfile(payload as MarketProfile);
  }
}

function connect() {
  if (typeof window === "undefined" || consumerCount <= 0) return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    applySubscriptions();
    return;
  }

  clearTimer(closeTimer, window.clearTimeout);
  closeTimer = null;
  useWebSocketStore.getState().setStatus(reconnectAttempt === 0 ? "connecting" : "reconnecting");

  socket = new WebSocket(buildWebSocketUrl());
  socket.onopen = () => {
    reconnectAttempt = 0;
    lastMessageAt = Date.now();
    subscribedSymbols = new Set();
    useWebSocketStore.getState().setStatus("live");
    applySubscriptions();
    devLog("open");
  };
  socket.onmessage = handleMessage;
  socket.onerror = () => {
    useWebSocketStore.getState().setStatus("error");
  };
  socket.onclose = () => {
    socket = null;
    subscribedSymbols = new Set();
    recordSubscribedSymbols();
    flushBuffers();
    scheduleReconnect();
  };
}

function startTimers() {
  if (!heartbeatTimer) {
    heartbeatTimer = window.setInterval(() => {
      sendFrame(encodePing());
      if (Date.now() - lastMessageAt > STALE_MS && socket?.readyState === WebSocket.OPEN) {
        useWebSocketStore.getState().setStatus("stale");
        socket.close();
      }
    }, HEARTBEAT_MS);
  }

  if (!staleTimer) {
    staleTimer = window.setInterval(() => {
      useWatchlistStore.getState().markStaleQuotes();
    }, 5_000);
  }
}

function stopIfUnused() {
  if (consumerCount > 0 || closeTimer) return;
  closeTimer = window.setTimeout(() => {
    if (consumerCount > 0) return;

    clearTimer(reconnectTimer, window.clearTimeout);
    clearTimer(flushTimer, window.clearTimeout);
    clearTimer(heartbeatTimer, window.clearInterval);
    clearTimer(staleTimer, window.clearInterval);
    reconnectTimer = null;
    flushTimer = null;
    heartbeatTimer = null;
    staleTimer = null;
    desiredSymbols = new Set();
    desiredGroup = undefined;
    subscribedSymbols = new Set();
    tickBuffer = [];
    profileBuffer = [];
    recordSubscribedSymbols();
    useWebSocketStore.getState().setStatus("idle");
    socket?.close();
    socket = null;
  }, STRICT_MODE_CLOSE_GRACE_MS);
}

function updateDesiredSubscription(symbols?: string[], group?: string) {
  desiredSymbols = new Set(normalizeSymbols(symbols));
  desiredGroup = desiredSymbols.size ? undefined : group;
  applySubscriptions();
}

export function useWebSocket({ symbols, group, enabled = true }: Options = {}) {
  const symbolKey = useMemo(() => normalizeSymbols(symbols).join(","), [symbols]);

  useEffect(() => {
    if (!enabled) {
      updateDesiredSubscription([], undefined);
      return;
    }

    consumerCount += 1;
    clearTimer(closeTimer, window.clearTimeout);
    closeTimer = null;
    updateDesiredSubscription(symbolKey ? symbolKey.split(",") : [], group);
    startTimers();
    connect();

    return () => {
      consumerCount = Math.max(0, consumerCount - 1);
      stopIfUnused();
    };
  }, [enabled, group, symbolKey]);
}
