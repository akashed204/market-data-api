"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatCompact, formatNumber, formatTime } from "@/lib/format";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useWebSocketStore } from "@/store/websocketStore";
import { subscribeNow } from "@/hooks/useWebSocket";
import type { LiveQuote, SymbolRecord } from "@/types/market";
import { SymbolSearch } from "@/components/watchlist/SymbolSearch";

const MAX_VISIBLE_SUBSCRIPTIONS = 500;

function quoteFor(symbol: string, quotes: Record<string, LiveQuote>) {
  return quotes[symbol] || {
    symbol,
    ltp: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    vwap: 0,
    high: 0,
    low: 0,
    ts: 0,
    direction: "flat" as const,
    stale: true,
  };
}

const WatchlistRow = memo(function WatchlistRow({
  record,
  quote,
  selected,
  onSelect,
  onRemove,
}: {
  record: SymbolRecord;
  quote: LiveQuote;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const positive = quote.change >= 0;
  const wsStatus = useWebSocketStore((s) => s.status);

  const lastMs = (quote as any).lastUpdateMs ? (quote as any).lastUpdateMs : (quote.ts || 0) * 1000;
  const [secondsAgo, setSecondsAgo] = useState(() => Math.max(0, Math.floor((Date.now() - lastMs) / 1000)));
  const [isLive, setIsLive] = useState(() => wsStatus === "live" && secondsAgo < 5);

 useEffect(() => {
  const unsub = subscribeNow(() => {
    const now = Date.now();

    const newSec = Math.max(
      0,
      Math.floor((now - lastMs) / 1000)
    );

    const live =
      wsStatus === "live" &&
      now - lastMs < 5000;

    setSecondsAgo(prev =>
      prev !== newSec ? newSec : prev
    );

    setIsLive(prev =>
      prev !== live ? live : prev
    );
  });

  return () => {
    unsub();
  };
}, [lastMs, wsStatus]);
  return (
    <tr
      onClick={onSelect}
      className={[
        "cursor-pointer border-b border-terminal-line/70 text-sm hover:bg-white/5",
        selected ? "bg-terminal-cyan/10" : "",
        quote.direction === "up" ? "flash-up" : quote.direction === "down" ? "flash-down" : "",
      ].join(" ")}
    >
      <td className="sticky left-0 bg-inherit px-3 py-2 font-semibold text-terminal-text">
        <div>{record.symbol}</div>
        <div className="text-[11px] font-normal text-terminal-muted">{record.exchange}</div>
      </td>
      <td className="px-3 py-2 text-right font-mono">{quote.ltp ? formatNumber(quote.ltp) : "-"}</td>
      <td className={`px-3 py-2 text-right font-mono ${positive ? "text-terminal-green" : "text-terminal-red"}`}>
        {formatNumber(quote.change)}
      </td>
      <td className={`px-3 py-2 text-right font-mono ${positive ? "text-terminal-green" : "text-terminal-red"}`}>
        {formatNumber(quote.changePercent)}%
      </td>
      <td className="px-3 py-2 text-right font-mono">{formatCompact(quote.volume)}</td>
      <td className="px-3 py-2 text-right font-mono">{quote.vwap ? formatNumber(quote.vwap) : "-"}</td>
      <td className="px-3 py-2 text-right font-mono">{quote.high ? formatNumber(quote.high) : "-"}</td>
      <td className="px-3 py-2 text-right font-mono">{quote.low ? formatNumber(quote.low) : "-"}</td>
      <td className="px-3 py-2 text-right text-xs text-terminal-muted">{formatTime(quote.ts)}</td>
      <td className="px-3 py-2 text-right">
        {wsStatus === "disconnected" ? (
          <span className={`rounded px-2 py-1 text-[11px] bg-terminal-red/10 text-terminal-red`}>DISCONNECTED</span>
        ) : (
          <span
            className={`rounded px-2 py-1 text-[11px] ${isLive ? "bg-terminal-green/10 text-terminal-green animate-pulse" : "bg-terminal-amber/10 text-terminal-amber"}`}
          >
            {isLive ? "LIVE" : "STALE"}
            <span className="ml-2 text-[10px] text-terminal-muted">{secondsAgo}s</span>
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          aria-label={`Remove ${record.symbol}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="rounded-md p-1.5 text-terminal-muted hover:bg-terminal-red/10 hover:text-terminal-red"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
});

export function LiveWatchlist({ onRemove }: { onRemove: (record: SymbolRecord) => void }) {
  const [query, setQuery] = useState("");
  const symbols = useWatchlistStore((state) => state.symbols);
  const quotes = useWatchlistStore((state) => state.quotes);
  const selectedSymbol = useWatchlistStore((state) => state.selectedSymbol);
  const selectSymbol = useWatchlistStore((state) => state.selectSymbol);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return symbols;
    return symbols.filter((item) => Object.values(item).join(" ").toLowerCase().includes(normalized));
  }, [query, symbols]);

  const visibleSymbols = useMemo(() => filtered.slice(0, MAX_VISIBLE_SUBSCRIPTIONS).map((item) => item.symbol), [filtered]);
  useWebSocket({ symbols: visibleSymbols, enabled: visibleSymbols.length > 0 });

  return (
    <section className="min-h-[520px] rounded-lg border border-terminal-line bg-terminal-panel shadow-terminal">
      <div className="flex flex-col gap-3 border-b border-terminal-line p-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-terminal-text">Live Watchlist</h2>
          <p className="text-sm text-terminal-muted">{filtered.length} visible symbols, websocket-fed quotes</p>
        </div>
        <SymbolSearch value={query} onChange={setQuery} />
      </div>
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[1040px] table-fixed border-collapse">
          <thead className="sticky top-0 z-10 bg-terminal-rail text-[11px] uppercase text-terminal-muted">
            <tr>
              {["Symbol", "LTP", "Change", "Change %", "Volume", "VWAP", "High", "Low", "Time", "State", ""].map((head) => (
                <th key={head} className="px-3 py-2 text-right first:text-left">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <WatchlistRow
                key={`${record.exchange}:${record.symbol}`}
                record={record}
                quote={quoteFor(record.symbol, quotes)}
                selected={record.symbol === selectedSymbol}
                onSelect={() => selectSymbol(record.symbol)}
                onRemove={() => onRemove(record)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
