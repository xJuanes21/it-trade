import React from "react";

interface TradeStatsProps {
  tradeStats: {
    win_rate: number;
    profit_factor: number;
    avg_win_loss_ratio: string;
    avg_duration: string;
  };
  risk: {
    current_equity: number;
    current_balance: number;
    highest_balance: number;
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
        Estadísticas de Trading
      </h3>
      <div className="space-y-3 text-xs md:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Win rate (%)</span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold">
            {tradeStats.win_rate.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Profit Factor</span>
          <span className="font-bold text-foreground">
            {tradeStats.profit_factor.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Avg Win / Avg Loss</span>
          <span className="font-bold text-foreground">{tradeStats.avg_win_loss_ratio}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Duración Promedio</span>
          <span className="font-bold text-foreground">{tradeStats.avg_duration}</span>
        </div>

        <div className="h-px bg-border my-2" />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Equidad Actual</span>
          <span className="font-bold text-foreground">
            {risk.current_equity.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Balance Actual</span>
          <span className="font-bold text-foreground">
            {risk.current_balance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Balance Máximo (HWM)</span>
          <span className="font-bold text-foreground">
            {risk.highest_balance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
