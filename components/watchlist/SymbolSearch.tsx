"use client";

import { Search } from "lucide-react";

export function SymbolSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search symbols, tokens, watchlists"
        className="h-10 w-full rounded-md border border-terminal-line bg-terminal-bg pl-9 pr-3 text-sm text-terminal-text outline-none focus:border-terminal-teal"
      />
    </label>
  );
}
