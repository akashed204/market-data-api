"use client";

import { useWatchlistStore } from "@/store/watchlistStore";
import { useWebSocketStore } from "@/store/websocketStore";

export function ActiveSubscriptions() {
  const symbols = useWatchlistStore((state) => state.symbols);
  const quotes = useWatchlistStore((state) => state.quotes);
  const subscribed = useWebSocketStore((state) => state.subscribedSymbols);

  return (
    <section className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-terminal-text">Active Subscriptions</h2>
        <span className="text-xs text-terminal-muted">{subscribed.length || symbols.length} routed</span>
      </div>
      <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-auto">
        {symbols.slice(0, 80).map((item) => {
          const live = Boolean(quotes[item.symbol] && !quotes[item.symbol].stale);
          return (
            <span
              key={`${item.exchange}:${item.symbol}`}
              className={`rounded border px-2 py-1 text-[11px] ${live ? "border-terminal-green/30 bg-terminal-green/10 text-terminal-green" : "border-terminal-line bg-terminal-bg text-terminal-muted"}`}
            >
              {item.symbol}
            </span>
          );
        })}
      </div>
    </section>
  );
}

