import type { MarketProfile, TickMessage } from "@/types/market";

export type WebSocketInboundMessage =
  | TickMessage
  | MarketProfile
  | {
      type?: string;
      symbol?: string;
      ts?: number;
      timestamp?: number;
      [key: string]: unknown;
    };

export type WebSocketMetrics = {
  bufferedMessages: number;
  flushSize: number;
  droppedFrames: number;
  latencyMs: number;
};
