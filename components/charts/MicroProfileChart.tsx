"use client";

import { useWatchlistStore } from "@/store/watchlistStore";

export function MicroProfileChart() {
  const selectedSymbol = useWatchlistStore((state) => state.selectedSymbol);
  const quote = useWatchlistStore((state) => state.quotes[selectedSymbol]);
  const low = quote?.low || 0;
  const high = quote?.high || 0;
  const ltp = quote?.ltp || 0;
  const position = high > low ? Math.min(100, Math.max(0, ((ltp - low) / (high - low)) * 100)) : 50;

  return (
    <section className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-terminal-text">Live Market Grid</h2>
        <span className="text-sm text-terminal-muted">{selectedSymbol}</span>
      </div>
      <div className="mt-5 h-44 rounded-md border border-terminal-line bg-terminal-bg p-4">
        <div className="relative h-full">
          <div className="absolute inset-y-0 left-0 right-0 top-1/2 h-px bg-terminal-line" />
          <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-terminal-muted">
            <span>Low {low || "-"}</span>
            <span>High {high || "-"}</span>
          </div>
          <div className="absolute bottom-8 top-4 w-px bg-terminal-cyan shadow-teal" style={{ left: `${position}%` }} />
          <div className="absolute top-2 -translate-x-1/2 rounded border border-terminal-cyan/40 bg-terminal-cyan/10 px-2 py-1 font-mono text-xs text-terminal-cyan" style={{ left: `${position}%` }}>
            {ltp || "-"}
          </div>
        </div>
      </div>
    </section>
  );
}

