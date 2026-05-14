"use client";

import { useMarketProfile } from "@/hooks/useMarketProfile";
import { formatCompact, formatNumber, formatTime } from "@/lib/format";

function value(profile: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const found = profile[key];
    if (found !== undefined && found !== null && found !== "") return found;
  }
  return undefined;
}

function Level({ label, value: level, accent }: { label: string; value?: number; accent?: string }) {
  return (
    <div className="rounded-md border border-terminal-line bg-terminal-bg p-3">
      <div className="text-[11px] uppercase text-terminal-muted">{label}</div>
      <div className={`mt-1 font-mono text-xl font-semibold ${accent || "text-terminal-text"}`}>{formatNumber(level)}</div>
    </div>
  );
}

export function MarketProfilePanel({ symbol }: { symbol: string }) {
  const profile = useMarketProfile(symbol);
  const data = (profile || {}) as Record<string, unknown>;
  const ib = (data.ib || {}) as Record<string, unknown>;
  const singlePrints = Array.isArray(profile?.single_prints) ? profile.single_prints : [];
  const rows: Array<[string, unknown]> = [
    ["IB High", value(ib, "high") ?? profile?.ib_high],
    ["IB Low", value(ib, "low") ?? profile?.ib_low],
    ["IB Range", value(ib, "range") ?? profile?.ib_range],
    ["IB Type", value(ib, "type") ?? profile?.ib_type],
    ["Open Type", profile?.open_type ?? profile?.opening_type],
    ["Day Type", profile?.day_type],
    ["Shape", profile?.profile_shape],
    ["Balance", profile?.balance_state],
    ["Rotational Factor", profile?.rotational_factor],
    ["Session High", profile?.session_high],
    ["Session Low", profile?.session_low],
    ["Volume", formatCompact(profile?.volume)],
  ];

  return (
    <section className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-terminal-text">Market Profile</h2>
          <p className="text-sm text-terminal-muted">{symbol || "No symbol selected"}</p>
        </div>
        <div className="text-right text-xs text-terminal-muted">{formatTime(Number(profile?.last_update))}</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Level label="POC" value={Number(profile?.poc)} accent="text-terminal-cyan" />
        <Level label="VAH" value={Number(profile?.vah)} accent="text-terminal-green" />
        <Level label="VAL" value={Number(profile?.val)} accent="text-terminal-red" />
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {rows.map(([label, item]) => (
          <div key={String(label)} className="flex items-center justify-between gap-3 border-b border-terminal-line/70 py-2">
            <span className="text-terminal-muted">{label}</span>
            <span className="text-right font-mono text-terminal-text">{typeof item === "number" ? formatNumber(item) : String(item ?? "-")}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-terminal-line bg-terminal-bg p-3">
          <div className="text-[11px] uppercase text-terminal-muted">Range Extension</div>
          <div className="mt-2 flex justify-between font-mono text-sm">
            <span className="text-terminal-green">Up {formatNumber(profile?.range_extension?.up)}</span>
            <span className="text-terminal-red">Down {formatNumber(profile?.range_extension?.down)}</span>
          </div>
        </div>
        <div className="rounded-md border border-terminal-line bg-terminal-bg p-3">
          <div className="text-[11px] uppercase text-terminal-muted">Excess</div>
          <div className="mt-2 flex justify-between text-sm">
            <span>High {profile?.excess_high ? "Yes" : "No"}</span>
            <span>Low {profile?.excess_low ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-terminal-line bg-terminal-bg p-3">
        <div className="text-[11px] uppercase text-terminal-muted">Single Prints</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {singlePrints.length ? (
            singlePrints.slice(0, 8).map((print, index) => {
              const low = Array.isArray(print) ? print[0] : print.price_low;
              const high = Array.isArray(print) ? print[1] : print.price_high;
              return (
                <span key={`${low}-${high}-${index}`} className="rounded border border-terminal-amber/30 bg-terminal-amber/10 px-2 py-1 font-mono text-xs text-terminal-amber">
                  {formatNumber(low)}-{formatNumber(high)}
                </span>
              );
            })
          ) : (
            <span className="text-sm text-terminal-muted">No single prints in current payload</span>
          )}
        </div>
      </div>
    </section>
  );
}
