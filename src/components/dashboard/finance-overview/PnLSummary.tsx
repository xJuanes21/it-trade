import React from "react";
import { cn } from "@/lib/utils";

interface PnLSummaryProps {
  gains: { percent: number; absolute: number };
  netPnL: number;
  delay?: string;
}

export const PnLSummary = ({
  gains,
  netPnL,
  delay = "0.25s",
}: PnLSummaryProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-widest opacity-60">
            Gain %
          </div>
          <div className={cn(
            "text-xl md:text-2xl font-black tracking-tight",
            gains.percent >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {gains.percent >= 0 ? "+" : "-"}{Math.abs(gains.percent).toFixed(2)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-widest opacity-60">
            NET P&L
          </div>
          <div className={cn(
            "text-xl md:text-2xl font-black tracking-tight",
            netPnL >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {netPnL >= 0 ? "+" : "-"}${Math.abs(netPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      <div className={cn(
        "text-[10px] font-bold uppercase tracking-wider",
        gains.absolute >= 0 ? "text-emerald-500" : "text-red-500"
      )}>
        {gains.absolute >= 0 ? "+" : "-"}${Math.abs(gains.absolute).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="opacity-50 text-[8px]">Abs</span>
      </div>
    </div>
  );
};
