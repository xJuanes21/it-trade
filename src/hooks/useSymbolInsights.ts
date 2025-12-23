"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { mt5Api } from "@/lib/api/mt5-client";
import type { HistoryRequest } from "@/lib/api/mt5-client";
import type { MarketCandle, MarketSymbolDetail } from "@/types/market";

type UseSymbolInsightsOptions = {
  symbol: string | null;
  timeframe?: HistoryRequest["timeframe"];
  bars?: number;
  autoFetch?: boolean;
};

type UseSymbolInsightsReturn = {
  detail: MarketSymbolDetail | null;
  candles: MarketCandle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const DEFAULT_TIMEFRAME: HistoryRequest["timeframe"] = "M15";
const DEFAULT_BARS = 120;

export function useSymbolInsights({
  symbol,
  timeframe = DEFAULT_TIMEFRAME,
  bars = DEFAULT_BARS,
  autoFetch = true,
}: UseSymbolInsightsOptions): UseSymbolInsightsReturn {
  const [detail, setDetail] = useState<MarketSymbolDetail | null>(null);
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setDetail(null);
      setCandles([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    const currentRequest = Date.now();
    requestRef.current = currentRequest;

    try {
      const [info, history] = await Promise.all([
        mt5Api.getSymbolInfo(symbol),
        mt5Api.getHistory({ symbol, timeframe, bars }),
      ]);

      if (requestRef.current !== currentRequest) return;

      setDetail(info);
      setCandles(history);
    } catch (err) {
      if (requestRef.current !== currentRequest) return;
      setError(err instanceof Error ? err.message : "Error al obtener datos del símbolo");
    } finally {
      if (requestRef.current === currentRequest) {
        setIsLoading(false);
      }
    }
  }, [symbol, timeframe, bars]);

  useEffect(() => {
    if (!autoFetch) return;
    fetchData();
  }, [autoFetch, fetchData]);

  return {
    detail,
    candles,
    isLoading,
    error,
    refetch: fetchData,
  };
}
