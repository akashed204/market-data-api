"use client";

import { Wifi, WifiOff } from "lucide-react";
import type { ConnectionStatus } from "@/types/market";

const labels: Record<ConnectionStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  live: "Live",
  stale: "Stale",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  error: "Error",
};

export function StatusPill({ status }: { status: ConnectionStatus }) {
  const live = status === "live";
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold",
        live
          ? "border-terminal-green/40 bg-terminal-green/15 text-terminal-green"
          : "border-terminal-amber/40 bg-terminal-amber/10 text-terminal-amber",
      ].join(" ")}
    >
      {live ? <Wifi size={14} /> : <WifiOff size={14} />}
      {labels[status]}
    </span>
  );
}

