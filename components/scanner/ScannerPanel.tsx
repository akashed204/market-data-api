"use client";

import { useEffect } from "react";
import { getBreakoutScan, getMomentumScan, getVwapDeviationScan } from "@/services/analytics";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useWatchlistStore } from "@/store/watchlistStore";

export function ScannerPanel() {
  const scanner = useAnalyticsStore((state) => state.scanner);
  const setScanner = useAnalyticsStore((state) => state.setScanner);
  const selectSymbol = useWatchlistStore((state) => state.selectSymbol);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const [momentum, breakout, vwap] = await Promise.allSettled([getMomentumScan(), getBreakoutScan(), getVwapDeviationScan()]);
      if (cancelled) return;
      if (momentum.status === "fulfilled") setScanner("Momentum", momentum.value);
      if (breakout.status === "fulfilled") setScanner("Breakout", breakout.value);
      if (vwap.status === "fulfilled") setScanner("VWAP Deviation", vwap.value);
    }
    refresh();
    const interval = window.setInterval(refresh, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [setScanner]);

  return (
    <section className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
      <h2 className="text-base font-semibold text-terminal-text">Scanner Engine</h2>
      <div className="mt-4 grid gap-4">
        {Object.entries(scanner).map(([name, payload]) => (
          <div key={name}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-terminal-text">{name}</h3>
              <span className="text-xs text-terminal-muted">{payload.count} hits</span>
            </div>
            <div className="space-y-1">
              {(payload.results || []).slice(0, 5).map((item) => (
                <button
                  key={`${name}-${item.symbol}`}
                  type="button"
                  onClick={() => selectSymbol(item.symbol)}
                  className="flex w-full items-center justify-between rounded-md border border-terminal-line bg-terminal-bg px-3 py-2 text-left text-sm hover:border-terminal-cyan/40"
                >
                  <span className="font-semibold text-terminal-text">{item.symbol}</span>
                  <span className="font-mono text-terminal-muted">{item.direction || item.side || item.change_pct || item.deviation || item.range || "-"}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

