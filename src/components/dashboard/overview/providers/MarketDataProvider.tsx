"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useMt5Symbols } from "@/hooks/useMt5Symbols";
import { buildActivityFeed } from "@/lib/services/mt5-market";
import type {
  MarketActivityEntry,
  MarketInstrument,
  MarketSnapshot,
} from "@/types/market";

type MarketDataContextValue = {
  snapshot: MarketSnapshot | null;
  instruments: MarketInstrument[];
  visibleInstruments: MarketInstrument[];
  activityFeed: MarketActivityEntry[];
  selectedSymbol: string | null;
  setSelectedSymbol: Dispatch<SetStateAction<string | null>>;
  selectedInstrument: MarketInstrument | null;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  showOnlyTradable: boolean;
  setShowOnlyTradable: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
};

const MarketDataContext = createContext<MarketDataContextValue | undefined>(undefined);

type Props = {
  children: React.ReactNode;
  initialLimit?: number;
  activitySize?: number;
  autoFetch?: boolean;
};

export function MarketDataProvider({
  children,
  initialLimit = 25,
  activitySize = 20,
  autoFetch,
}: Props) {
  const { snapshot, isLoading, error, refetch, lastUpdated } = useMt5Symbols({
    autoFetch,
  });
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(initialLimit);
  const [showOnlyTradable, setShowOnlyTradable] = useState(true);
  const [activitySeed, setActivitySeed] = useState(() => Date.now());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const instruments = snapshot?.instruments ?? [];

  const visibleInstruments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = instruments.filter((instrument) => {
      if (showOnlyTradable && !instrument.tradable) return false;
      if (!normalizedQuery) return true;
      return (
        instrument.symbol.toLowerCase().includes(normalizedQuery) ||
        instrument.description.toLowerCase().includes(normalizedQuery)
      );
    });

    return filtered.slice(0, limit);
  }, [instruments, query, limit, showOnlyTradable]);

  const activityFeed = useMemo(
    () => buildActivityFeed(instruments, activitySize, activitySeed),
    [activitySeed, activitySize, instruments],
  );

  const selectedInstrument = useMemo(() => {
    if (!selectedSymbol) return null;
    return instruments.find((instrument) => instrument.symbol === selectedSymbol) ?? null;
  }, [instruments, selectedSymbol]);

  useEffect(() => {
    if (!instruments.length) {
      setSelectedSymbol(null);
      return;
    }
    if (selectedSymbol && instruments.some((instrument) => instrument.symbol === selectedSymbol)) {
      return;
    }
    const fallback = instruments.find((instrument) => instrument.tradable) ?? instruments[0];
    setSelectedSymbol(fallback?.symbol ?? null);
  }, [instruments, selectedSymbol]);

  const handleRefetch = async () => {
    await refetch();
    setActivitySeed(Date.now());
  };

  const value: MarketDataContextValue = {
    snapshot,
    instruments,
    visibleInstruments,
    activityFeed,
    selectedSymbol,
    setSelectedSymbol,
    selectedInstrument,
    query,
    setQuery,
    limit,
    setLimit,
    showOnlyTradable,
    setShowOnlyTradable,
    isLoading,
    error,
    refetch: handleRefetch,
    lastUpdated,
  };

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error("useMarketData must be used within a MarketDataProvider");
  }
  return context;
}
