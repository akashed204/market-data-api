"use client";

import { useEffect } from "react";
import { getAllLiveQuotes } from "@/services/analytics";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { TickMessage } from "@/types/market";

export function useLiveQuotesBootstrap() {
  const updateQuotesBatch = useWatchlistStore((state) => state.updateQuotesBatch);

  useEffect(() => {
    let cancelled = false;
    getAllLiveQuotes()
      .then((payload) => {
        if (cancelled) return;
        updateQuotesBatch((payload.data || []) as TickMessage[]);
      })
      .catch(() => {
        // Live quotes are optional at first render; websocket becomes the source of truth.
      });
    return () => {
      cancelled = true;
    };
  }, [updateQuotesBatch]);
}
