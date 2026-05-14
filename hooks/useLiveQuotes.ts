"use client";

import { useEffect } from "react";
import { getAllLiveQuotes } from "@/services/analytics";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { TickMessage } from "@/types/market";

export function useLiveQuotesBootstrap() {
  const applyTickBatch = useWatchlistStore((state) => state.applyTickBatch);

  useEffect(() => {
    let cancelled = false;
    getAllLiveQuotes()
      .then((payload) => {
        if (cancelled) return;
        applyTickBatch((payload.data || []) as TickMessage[]);
      })
      .catch(() => {
        // Live quotes are optional at first render; websocket becomes the source of truth.
      });
    return () => {
      cancelled = true;
    };
  }, [applyTickBatch]);
}

