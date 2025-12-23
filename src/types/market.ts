import type { HistoryCandle, SymbolDetail } from "@/lib/api/mt5-client";

export type MarketInstrument = {
  symbol: string;
  description: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  point: number;
  contractSize: number;
  mid: number;
  spreadPips: number;
  tradable: boolean;
};

export type MarketSnapshot = {
  instruments: MarketInstrument[];
  totalSymbols: number;
  tradableCount: number;
  zeroLiquidityCount: number;
  averageSpread: number;
  topSpreads: MarketInstrument[];
};

export type MarketActivityEntry = {
  id: string;
  symbol: string;
  description: string;
  action: "Buy" | "Sell";
  price: number;
  color: string;
  precision: number;
};

export type MarketCandle = HistoryCandle;
export type MarketSymbolDetail = SymbolDetail;
