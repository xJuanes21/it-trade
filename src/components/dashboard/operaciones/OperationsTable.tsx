"use client";

import { useState } from "react";
import { Edit2, Plus, Star, TrendingUp, TrendingDown, Menu, MoreHorizontal, Info } from "lucide-react";

type Trend = "up" | "down";

type PortfolioRow = {
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
  sparkline: number[];
  trend: Trend;
  favorite: boolean;
  color: string;
};

const portfolioData: PortfolioRow[] = [
  { rank: 2, name: "Tether", symbol: "USDT", price: 1.0, change24h: 0.22, change7d: -3.22, marketCap: 218533780, volume: 5763203118, sparkline: [55,58,60,58,55,52,48,45,42,40,38,35], trend: "down", favorite: true, color: "#26A17B" },
  { rank: 1, name: "Bitcoin", symbol: "BTC", price: 26735.59, change24h: -5.12, change7d: 1.12, marketCap: 23621421545, volume: 2487902497, sparkline: [40,42,45,48,52,55,58,62,65,68,70,72], trend: "up", favorite: true, color: "#F7931A" },
  { rank: 8, name: "SushiSwap", symbol: "SUSHI", price: 0.8802, change24h: 0.6, change7d: 3.60, marketCap: 8050630845, volume: 236620186, sparkline: [35,38,42,45,48,52,55,60,63,68,72,75], trend: "up", favorite: true, color: "#FA52A0" },
  { rank: 9, name: "Bitstamp", symbol: "BIT", price: 0.1802, change24h: 0.8, change7d: -1.90, marketCap: 1050630844, volume: 236620186, sparkline: [65,62,58,55,52,48,45,42,38,35,32,30], trend: "down", favorite: false, color: "#00C851" },
  { rank: 11, name: "Gemini", symbol: "GUSD", price: 0.909802, change24h: 2.60, change7d: 3.80, marketCap: 4150560455, volume: 236620186, sparkline: [30,35,40,45,50,55,60,65,68,72,75,78], trend: "up", favorite: false, color: "#00DCFA" },
  { rank: 12, name: "Medibloc", symbol: "MED", price: 2.44502, change24h: -0.08, change7d: 10.40, marketCap: 810610480, volume: 236620186, sparkline: [40,42,45,50,55,60,65,68,70,73,76,78], trend: "up", favorite: false, color: "#4A90E2" },
  { rank: 3, name: "Kucoin", symbol: "KU", price: 0.0090102, change24h: 1.30, change7d: -6.90, marketCap: 530845, volume: 60620186, sparkline: [70,68,65,62,58,55,52,48,45,42,38,35], trend: "down", favorite: false, color: "#23AF91" },
];

function MiniSparkline({ data, trend }: { data: number[]; trend: Trend }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100" height="40" viewBox="0 0 100 100" className="overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trend === "up" ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trend === "up" ? "#10b981" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill={`url(#gradient-${trend})`} />
      <polyline points={points} fill="none" stroke={trend === "up" ? "#10b981" : "#ef4444"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function OperationsTable() {
  const [portfolio] = useState<PortfolioRow[]>(portfolioData);

  const currentBalance = 2777308.0;
  const changeAmount = -1200.78;
  const changePercent = -1.89;
  const change24h = "24H";

  const allTimeProfit = 324.82;
  const allTimeProfitPercent = 2.52;
  const bestPerformer = { amount: 627.82, percent: 10.52 };
  const worstPerformer = { amount: -87.32, percent: -1.23 };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return `$${Math.round(num / 1_000_000_000)}B`;
    if (num >= 1_000_000) return `$${Math.round(num / 1_000_000)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header with Balance */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                Current balance
                <Info size={14} className="text-muted-foreground" />
              </p>
              <h1 className="text-5xl font-bold text-foreground mb-3">
                ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-red-400 text-lg font-medium">
                  ${Math.abs(changeAmount).toFixed(2)} ({changePercent}%)
                </span>
                <span className="text-muted-foreground text-sm">{change24h}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-[#374151] hover:bg-[#4b5563] text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2">
                <Edit2 size={18} />
                Edit
              </button>
              <button className="bg-primary hover:bg-accent text-primary-foreground px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2">
                <Plus size={18} />
                Add transaction
              </button>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">All time profit</p>
                <p className="text-green-400 text-lg font-bold">
                  {allTimeProfitPercent}% (+${allTimeProfit})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Best performer</p>
                <p className="text-green-400 text-lg font-bold">
                  10.52% (+$627.82)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <TrendingDown size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Worst performer</p>
                <p className="text-red-400 text-lg font-bold">
                  -1.23% ($-87.32)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f1420] rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_250px_120px_100px_100px_150px_150px_150px_80px] gap-4 px-6 py-4 border-b border-[#1a1f35] text-muted-foreground text-sm">
            <div className="text-center">#</div>
            <div>Name</div>
            <div>Price</div>
            <div>24h</div>
            <div>7D</div>
            <div className="flex items-center gap-1">
              Market cap
              <Info size={12} />
            </div>
            <div className="flex items-center gap-1">
              Volume
              <Info size={12} />
            </div>
            <div>Last 7 days</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div>
            {portfolio.map((coin) => (
              <div
                key={coin.symbol}
                className="grid grid-cols-[50px_250px_120px_100px_100px_150px_150px_150px_80px] gap-4 px-6 py-4 border-b border-[#1a1f35] hover:bg-[#151a2e] transition-colors items-center"
              >
                {/* Rank with Star */}
                <div className="flex items-center gap-2 justify-center">
                  <button className={`${coin.favorite ? "text-yellow-400" : "text-gray-700"} hover:text-yellow-400 transition-colors`}>
                    <Star size={16} fill={coin.favorite ? "currentColor" : "none"} />
                  </button>
                  <span className="text-foreground text-sm font-medium">{coin.rank}</span>
                </div>

                {/* Name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: coin.color }}
                  >
                    {coin.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{coin.name}</p>
                    <p className="text-muted-foreground text-xs">{coin.symbol}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-foreground font-medium">${coin.price >= 1 ? coin.price.toLocaleString() : coin.price}</div>

                {/* 24H Change */}
                <div className={`flex items-center gap-1 font-medium ${coin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h)}%
                </div>

                {/* 7D Change */}
                <div className={`flex items-center gap-1 font-medium ${coin.change7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {coin.change7d >= 0 ? "▲" : "▼"} {Math.abs(coin.change7d)}%
                </div>

                {/* Market Cap */}
                <div className="text-foreground">{formatNumber(coin.marketCap)}</div>

                {/* Volume */}
                <div className="text-foreground">{formatNumber(coin.volume)}</div>

                {/* Sparkline */}
                <div className="flex items-center">
                  <MiniSparkline data={coin.sparkline} trend={coin.trend} />
                </div>

                {/* Actions */}
                <div className="flex gap-1 justify-center">
                  <button className="bg-[#1a1f35] hover:bg-[#252b45] text-muted-foreground hover:text-foreground p-2 rounded-lg transition-all">
                    <Menu size={16} />
                  </button>
                  <button className="bg-[#1a1f35] hover:bg-[#252b45] text-muted-foreground hover:text-foreground p-2 rounded-lg transition-all">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
