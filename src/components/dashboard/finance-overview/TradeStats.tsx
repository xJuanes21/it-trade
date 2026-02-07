import React from "react";

interface TradeStatsProps {
  tradeStats: {
    winRate: number;
    profitFactor: number;
    avgWinLoss: string;
    avgDuration: string;
  };
  risk: {
    currentEquity: number;
    currentBalance: number;
    highestBalance: number;
  };
  delay?: string;
}

export const TradeStats = ({
  tradeStats,
  risk,
  delay = "0.55s",
}: TradeStatsProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-center"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
        Trade Stats
      </h3>
      <div className="space-y-3 text-xs md:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Win rate (%)</span>
          <span className="text-emerald-400 font-bold">
            {tradeStats.winRate}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Profit Factor</span>
          <span className="font-bold text-white">
            {tradeStats.profitFactor}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Avg Win / Avg Loss</span>
          <span className="font-bold text-white">{tradeStats.avgWinLoss}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Avg Duration</span>
          <span className="font-bold text-white">{tradeStats.avgDuration}</span>
        </div>

        <div className="h-px bg-slate-700/50 my-2" />

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Current Equity</span>
          <span className="font-bold text-white">
            ${risk.currentEquity.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Current Balance</span>
          <span className="font-bold text-white">
            ${risk.currentBalance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Highest Balance</span>
          <span className="font-bold text-white">
            ${risk.highestBalance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
