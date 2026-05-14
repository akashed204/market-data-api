"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useReplay } from "@/hooks/useReplay";

export function ReplayControls() {
  const { replayMode, replaySpeed, setReplayMode, setReplaySpeed } = useReplay();

  return (
    <section className="rounded-lg border border-terminal-line bg-terminal-panel p-4 shadow-terminal">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-terminal-text">Replay Controls</h2>
          <p className="text-sm text-terminal-muted">UI state is replay-safe; backend replay engine remains authoritative.</p>
        </div>
        <button
          type="button"
          onClick={() => setReplayMode(!replayMode)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-terminal-line px-3 text-xs font-semibold text-terminal-text"
        >
          {replayMode ? <Pause size={14} /> : <Play size={14} />}
          {replayMode ? "Pause" : "Replay"}
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <RotateCcw size={16} className="text-terminal-muted" />
        <input
          aria-label="Replay speed"
          type="range"
          min="0.25"
          max="10"
          step="0.25"
          value={replaySpeed}
          onChange={(event) => setReplaySpeed(Number(event.target.value))}
          className="w-full"
        />
        <span className="w-14 text-right font-mono text-sm text-terminal-text">{replaySpeed}x</span>
      </div>
    </section>
  );
}
