"use client";

import { RefreshCcw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getRuntimeMetrics } from "@/services/analytics";
import { addSymbol, listSymbols, removeSymbol } from "@/services/subscriptions";
import { useLiveQuotesBootstrap } from "@/hooks/useLiveQuotes";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toUserMessage } from "@/services/api";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useWebSocketStore } from "@/store/websocketStore";
import type { AddSymbolRequest, SymbolRecord } from "@/types/market";
import { ApiKeyControl } from "@/components/layout/ApiKeyControl";
import { StatusPill } from "@/components/layout/StatusPill";
import { MetricStrip } from "@/components/dashboard/MetricStrip";
import { AddSymbolModal } from "@/components/watchlist/AddSymbolModal";
import { LiveWatchlist } from "@/components/watchlist/LiveWatchlist";
import { MarketProfilePanel } from "@/components/market-profile/MarketProfilePanel";
import { ScannerPanel } from "@/components/scanner/ScannerPanel";
import { ReplayControls } from "@/components/realtime/ReplayControls";
import { ActiveSubscriptions } from "@/components/realtime/ActiveSubscriptions";
import { MicroProfileChart } from "@/components/charts/MicroProfileChart";

export function DashboardShell() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const symbols = useWatchlistStore((state) => state.symbols);
  const setSymbols = useWatchlistStore((state) => state.setSymbols);
  const removeSymbolLocal = useWatchlistStore((state) => state.removeSymbolLocal);
  const selectedSymbol = useWatchlistStore((state) => state.selectedSymbol);
  const status = useWebSocketStore((state) => state.status);
  const setRuntime = useAnalyticsStore((state) => state.setRuntime);

  const socketSymbols = useMemo(() => symbols.map((item) => item.symbol), [symbols]);
  useWebSocket({ symbols: socketSymbols.length ? socketSymbols : undefined, enabled: true });
  useLiveQuotesBootstrap();

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [symbolPayload, runtimePayload] = await Promise.all([listSymbols(), getRuntimeMetrics()]);
      setSymbols(
        (symbolPayload.active_symbols || []).map((item) => ({
          ...item,
          symbol: item.symbol.toUpperCase(),
          exchange: item.exchange || "NSE",
          instrument_type: item.instrument_type || "EQUITY",
        })),
        symbolPayload.watchlists || {},
      );
      setRuntime(runtimePayload);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  }, [setRuntime, setSymbols]);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  async function handleAdd(payload: AddSymbolRequest) {
    await addSymbol(payload);
    await refresh();
  }

  async function handleRemove(record: SymbolRecord) {
    removeSymbolLocal(record.symbol);
    try {
      await removeSymbol(record.symbol, record.exchange);
      await refresh();
    } catch (err) {
      setError(toUserMessage(err));
      await refresh();
    }
  }

  return (
    <main className="terminal-grid min-h-screen p-4 text-terminal-text md:p-6">
      <div className="mx-auto flex max-w-[1760px] flex-col gap-4">
        <header className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-terminal-teal/30 bg-terminal-teal/15 p-2 text-terminal-teal">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal text-terminal-text md:text-3xl">Institutional Market Analytics</h1>
                <p className="text-sm text-terminal-muted">FastAPI primary-writer runtime, SQLite WAL, deterministic replay, websocket analytics.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <StatusPill status={status} />
              <ApiKeyControl onSave={refresh} />
              <button
                type="button"
                onClick={refresh}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-terminal-line px-3 text-xs font-semibold text-terminal-text hover:border-terminal-cyan/40"
              >
                <RefreshCcw size={14} className={busy ? "animate-spin" : ""} />
                Refresh
              </button>
              <AddSymbolModal onSubmit={handleAdd} busy={busy} />
            </div>
          </div>
          {error ? <div className="mt-3 rounded-md border border-terminal-red/30 bg-terminal-red/10 px-3 py-2 text-sm text-terminal-red">{error}</div> : null}
        </header>

        <MetricStrip />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
          <LiveWatchlist onRemove={handleRemove} />
          <div className="grid content-start gap-4">
            <MarketProfilePanel symbol={selectedSymbol} />
            <MicroProfileChart />
            <ReplayControls />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
          <ScannerPanel />
          <ActiveSubscriptions />
        </div>
      </div>
    </main>
  );
}
