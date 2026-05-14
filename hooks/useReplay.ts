"use client";

import { useAnalyticsStore } from "@/store/analyticsStore";

export function useReplay() {
  const replayMode = useAnalyticsStore((state) => state.replayMode);
  const replaySpeed = useAnalyticsStore((state) => state.replaySpeed);
  const setReplayMode = useAnalyticsStore((state) => state.setReplayMode);
  const setReplaySpeed = useAnalyticsStore((state) => state.setReplaySpeed);

  return {
    replayMode,
    replaySpeed,
    setReplayMode,
    setReplaySpeed,
  };
}
