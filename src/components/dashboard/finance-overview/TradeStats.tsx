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
      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Trade Stats
      </h3>
      <div className="space-y-3 text-xs md:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Win rate (%)</span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold">
            {tradeStats.winRate}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Profit Factor</span>
          <span className="font-bold text-foreground">
            {tradeStats.profitFactor}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Avg Win / Avg Loss</span>
          <span className="font-bold text-foreground">{tradeStats.avgWinLoss}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Avg Duration</span>
          <span className="font-bold text-foreground">{tradeStats.avgDuration}</span>
        </div>

        <div className="h-px bg-border my-2" />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Current Equity</span>
          <span className="font-bold text-foreground">
            ${risk.currentEquity.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Current Balance</span>
          <span className="font-bold text-foreground">
            ${risk.currentBalance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Highest Balance</span>
          <span className="font-bold text-foreground">
            ${risk.highestBalance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
