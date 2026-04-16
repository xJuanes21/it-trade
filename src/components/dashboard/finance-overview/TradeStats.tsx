"use client";

import React from "react";

interface TradeStatsProps {
  tradeStats: {
    win_rate: number;
    profit_factor: number;
    avg_win: number;
    avg_loss: number;
    avg_win_loss_ratio: string;
    avg_duration: string;
    total_trades: number;
    won_trades: number;
    lost_trades: number;
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
  const hasHistory = tradeStats.total_trades > 0;

  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-center"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Estadísticas de Trading
      </h3>

      {hasHistory ? (
        <div className="space-y-3 text-xs md:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Win rate (%)</span>
            <span className={`font-bold ${tradeStats.win_rate >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
              {tradeStats.win_rate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Profit Factor</span>
            <span className={`font-bold ${tradeStats.profit_factor >= 1 ? 'text-foreground' : 'text-red-500'}`}>
              {tradeStats.profit_factor === Infinity ? "∞" : tradeStats.profit_factor.toFixed(2)}
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
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Total Operaciones</span>
            <span className="font-bold text-foreground">
              {tradeStats.total_trades}
              <span className="text-[10px] text-muted-foreground ml-1">
                ({tradeStats.won_trades}W / {tradeStats.lost_trades}L)
              </span>
            </span>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Equidad Actual</span>
            <span className="font-bold text-foreground font-mono">
              {risk.current_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Balance Actual</span>
            <span className="font-bold text-foreground font-mono">
              {risk.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Balance Máximo (HWM)</span>
            <span className="font-bold text-foreground font-mono">
              {risk.highest_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs md:text-sm">
          {/* Show equity/balance from account data even without trade history */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Equidad Actual</span>
            <span className="font-bold text-foreground font-mono">
              {risk.current_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Balance Actual</span>
            <span className="font-bold text-foreground font-mono">
              {risk.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Balance Máximo (HWM)</span>
            <span className="font-bold text-foreground font-mono">
              {risk.highest_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-px bg-border my-2" />
          <p className="text-[10px] text-muted-foreground text-center italic py-2">
            Las estadísticas de trading se calcularán cuando haya operaciones cerradas.
          </p>
        </div>
      )}
    </div>
  );
};
