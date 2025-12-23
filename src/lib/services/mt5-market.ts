import type { SymbolSummary } from "@/lib/api/mt5-client";
import type { MarketActivityEntry, MarketInstrument, MarketSnapshot } from "@/types/market";

const ZERO_THRESHOLD = 0.0000001;

const activityColors = [
  "#F97316",
  "#2563EB",
  "#10B981",
  "#A855F7",
  "#F43F5E",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
];

export function mapSymbolToMarketInstrument(symbol: SymbolSummary): MarketInstrument {
  const mid = symbol.bid && symbol.ask ? (symbol.bid + symbol.ask) / 2 : 0;
  const spreadPips = symbol.spread / 10 ** (symbol.digits ?? 0);
  const tradable = symbol.bid > ZERO_THRESHOLD && symbol.ask > ZERO_THRESHOLD;

  return {
    symbol: symbol.name,
    description: symbol.description,
    bid: symbol.bid,
    ask: symbol.ask,
    spread: symbol.spread,
    digits: symbol.digits,
    point: symbol.point,
    contractSize: symbol.trade_contract_size,
    mid,
    spreadPips,
    tradable,
  };
}

export function buildMarketSnapshot(instruments: MarketInstrument[]): MarketSnapshot {
  const totalSymbols = instruments.length;
  const tradableCount = instruments.filter((item) => item.tradable).length;
  const zeroLiquidityCount = totalSymbols - tradableCount;

  const averageSpread =
    instruments.reduce((acc, item) => acc + item.spreadPips, 0) / Math.max(totalSymbols, 1);

  const topSpreads = [...instruments]
    .sort((a, b) => b.spreadPips - a.spreadPips)
    .slice(0, 5);

  return {
    instruments,
    totalSymbols,
    tradableCount,
    zeroLiquidityCount,
    averageSpread,
    topSpreads,
  };
}

export function buildActivityFeed(
  instruments: MarketInstrument[],
  size: number,
  seed = Date.now(),
): MarketActivityEntry[] {
  if (!size) return [];
  const tradables = instruments.filter((instrument) => instrument.tradable);
  if (!tradables.length) return [];

  const feed: MarketActivityEntry[] = [];
  let cursor = seed;

  for (let i = 0; i < size; i++) {
    cursor = (cursor * 9301 + 49297) % 233280; // simple deterministic LCG
    const index = cursor % tradables.length;
    const instrument = tradables[index];
    const action = cursor % 2 === 0 ? "Buy" : "Sell";
    const priceNoise = ((cursor % 1000) - 500) / 10 ** instrument.digits;
    const price = Number(
      Math.max(0, (action === "Buy" ? instrument.ask : instrument.bid) + priceNoise).toFixed(
        instrument.digits,
      ),
    );

    feed.push({
      id: `${instrument.symbol}-${i}`,
      symbol: instrument.symbol,
      description: instrument.description,
      action,
      price,
      color: activityColors[i % activityColors.length],
      precision: instrument.digits,
    });
  }

  return feed;
}
