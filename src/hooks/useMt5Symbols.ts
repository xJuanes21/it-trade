"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { mt5Api } from "@/lib/api/mt5-client";
import { buildMarketSnapshot, mapSymbolToMarketInstrument } from "@/lib/services/mt5-market";
import type { MarketSnapshot } from "@/types/market";

type UseMt5SymbolsOptions = {
  autoFetch?: boolean;
};

type UseMt5SymbolsReturn = {
  snapshot: MarketSnapshot | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
};

export function useMt5Symbols(options?: UseMt5SymbolsOptions): UseMt5SymbolsReturn {
  const mountedRef = useRef(true);
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSymbols = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const symbols = await mt5Api.getSymbols();
      if (!mountedRef.current) return;

      const instruments = symbols.map(mapSymbolToMarketInstrument);
      const nextSnapshot = buildMarketSnapshot(instruments);
      setSnapshot(nextSnapshot);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error desconocido al consultar MT5.");
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (options?.autoFetch === false) return;
    fetchSymbols();
  }, [fetchSymbols, options?.autoFetch]);

  return {
    snapshot,
    isLoading,
    error,
    refetch: fetchSymbols,
    lastUpdated,
  };
}
