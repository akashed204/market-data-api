"use client";

import { useEffect } from "react";
import { getMarketProfile } from "@/services/analytics";
import { useAnalyticsStore } from "@/store/analyticsStore";

export function useMarketProfile(symbol: string) {
  const profile = useAnalyticsStore((state) => state.profiles[symbol.toUpperCase()]);
  const upsertProfile = useAnalyticsStore((state) => state.upsertProfile);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    getMarketProfile(symbol)
      .then((payload) => {
        if (!cancelled) upsertProfile(payload);
      })
      .catch(() => {
        // The live websocket will populate this when the profile engine has a session.
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, upsertProfile]);

  return profile;
}

