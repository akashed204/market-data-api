"use client";

import { Activity, Database, Gauge, RadioTower } from "lucide-react";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useWebSocketStore } from "@/store/websocketStore";

function metricValue(value: unknown) {
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value;
  return "-";
}

export function MetricStrip() {
  const runtime = useAnalyticsStore((state) => state.runtime);
  const quoteCount = useWatchlistStore((state) => Object.keys(state.quotes).length);
  const reconnects = useWebSocketStore((state) => state.reconnects);

  const items = [
    { label: "Live TPS", value: runtime.live_ticks_per_sec, icon: Activity },
    { label: "Queue", value: runtime.queue_depth, icon: Gauge },
    { label: "Quotes", value: quoteCount, icon: RadioTower },
    { label: "Reconnects", value: reconnects, icon: Database },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-terminal-muted">{item.label}</span>
            <item.icon size={16} className="text-terminal-cyan" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-terminal-text">{metricValue(item.value)}</div>
        </div>
      ))}
    </section>
  );
}
