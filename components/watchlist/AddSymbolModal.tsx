"use client";

import { Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { AddSymbolRequest } from "@/types/market";

const initialForm: AddSymbolRequest = {
  exchange: "NSE",
  symbol: "",
  token: "",
  instrument_type: "EQUITY",
  expiry: "",
  strike: 0,
  option_type: "",
  watchlist_name: "default",
};

export function AddSymbolModal({ onSubmit, busy }: { onSubmit: (payload: AddSymbolRequest) => Promise<void>; busy?: boolean }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({ ...form, symbol: form.symbol.toUpperCase().trim(), token: form.token.trim() });
    setForm(initialForm);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-terminal-teal px-3 text-xs font-bold text-[#06100f] hover:bg-terminal-green"
      >
        <Plus size={15} />
        Add Symbol
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={submit} className="w-full max-w-xl rounded-lg border border-terminal-line bg-terminal-panel p-5 shadow-terminal">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-terminal-text">Add Symbol</h2>
                <p className="mt-1 text-sm text-terminal-muted">Subscribe through the existing FastAPI symbol registry.</p>
              </div>
              <button type="button" aria-label="Close modal" onClick={() => setOpen(false)} className="rounded-md p-1 text-terminal-muted hover:text-terminal-text">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["exchange", "Exchange"],
                ["symbol", "Symbol"],
                ["token", "Token"],
                ["instrument_type", "Instrument type"],
                ["expiry", "Expiry"],
                ["option_type", "Option type"],
                ["watchlist_name", "Watchlist"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-semibold uppercase text-terminal-muted">
                  {label}
                  <input
                    required={key === "symbol" || key === "token"}
                    value={String(form[key as keyof AddSymbolRequest])}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border border-terminal-line bg-terminal-bg px-3 text-sm font-normal text-terminal-text outline-none focus:border-terminal-teal"
                  />
                </label>
              ))}
              <label className="text-xs font-semibold uppercase text-terminal-muted">
                Strike
                <input
                  type="number"
                  value={form.strike}
                  onChange={(event) => setForm((current) => ({ ...current, strike: Number(event.target.value) }))}
                  className="mt-1 h-10 w-full rounded-md border border-terminal-line bg-terminal-bg px-3 text-sm font-normal text-terminal-text outline-none focus:border-terminal-teal"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-md border border-terminal-line px-3 text-xs font-semibold text-terminal-text">
                Cancel
              </button>
              <button disabled={busy} className="h-9 rounded-md bg-terminal-teal px-3 text-xs font-bold text-[#06100f] disabled:opacity-60">
                {busy ? "Adding" : "Subscribe"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

