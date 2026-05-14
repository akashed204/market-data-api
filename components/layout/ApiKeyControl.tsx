"use client";

import { KeyRound, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredApiKey, setStoredApiKey } from "@/lib/env";

export function ApiKeyControl({ onSave }: { onSave?: () => void }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(getStoredApiKey());
  }, []);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <KeyRound size={17} className="shrink-0 text-terminal-muted" />
      <input
        aria-label="API key"
        type="password"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="X-API-Key"
        className="h-9 w-44 rounded-md border border-terminal-line bg-terminal-bg px-3 text-xs text-terminal-text outline-none focus:border-terminal-teal md:w-64"
      />
      <button
        type="button"
        onClick={() => {
          setStoredApiKey(value);
          onSave?.();
        }}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-terminal-line bg-terminal-panel px-3 text-xs font-semibold text-terminal-text hover:border-terminal-teal/50"
      >
        <Save size={14} />
        Save
      </button>
    </div>
  );
}

