export type ConnectionStatus = "idle" | "connecting" | "live" | "stale" | "reconnecting" | "disconnected" | "error";

export type TickMessage = {
  type: "tick";
  symbol: string;
  ltp: number;
  change?: number;
  change_percent?: number;
  volume?: number;
  vwap?: number;
  high?: number;
  low?: number;
  ts?: number;
  timestamp?: number;
  exchange?: string;
};

export type MarketProfile = {
  type?: "market_profile";
  symbol: string;
  poc?: number;
  vah?: number;
  val?: number;
  ib?: {
    high?: number;
    low?: number;
    range?: number;
    type?: string;
  };
  ib_high?: number;
  ib_low?: number;
  ib_range?: number;
  ib_type?: string;
  open_type?: string;
  opening_type?: string;
  day_type?: string;
  profile_shape?: string;
  balance_state?: string;
  rotational_factor?: number;
  range_extension?: {
    up?: number;
    down?: number;
  };
  single_prints?: Array<{ price_low?: number; price_high?: number } | [number, number]>;
  excess_high?: boolean;
  excess_low?: boolean;
  session_high?: number;
  session_low?: number;
  volume?: number;
  developing_poc?: number;
  value_migration?: string;
  last_update?: number;
};

export type LiveQuote = {
  symbol: string;
  exchange?: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  vwap: number;
  high: number;
  low: number;
  ts: number;
  previousLtp?: number;
  direction: "up" | "down" | "flat";
  stale?: boolean;
};

export type SymbolRecord = {
  exchange: string;
  symbol: string;
  token: string;
  instrument_type: string;
  expiry?: string | null;
  strike?: number | null;
  option_type?: string | null;
};

export type AddSymbolRequest = {
  exchange: string;
  symbol: string;
  token: string;
  instrument_type: string;
  expiry: string;
  strike: number;
  option_type: string;
  watchlist_name: string;
};

export type ScannerResult = {
  symbol: string;
  ltp: number;
  direction?: string;
  side?: string;
  change_pct?: number;
  deviation?: number;
  range?: number;
  vwap?: number;
  period_high?: number;
  period_low?: number;
};

export type ScannerPayload = {
  scan: string;
  count: number;
  results: ScannerResult[];
};

