"use client";

import React from "react";
import { TrendingUp, TrendingDown, ArrowRight, Trophy } from "lucide-react";

interface EquityEvolutionProps {
  equityStart: number;
  equityEnd: number;
  hwm: number;
  currency: string;
  delay?: string;
}

export const EquityEvolution = ({
  equityStart,
  equityEnd,
  hwm,
  currency,
  delay = "0.35s",
}: EquityEvolutionProps) => {
  const delta = equityEnd - equityStart;
  const deltaPercent = equityStart > 0 ? ((delta / equityStart) * 100) : 0;
  const isPositive = delta >= 0;

  // How close is equity_end to hwm?
  const hwmDistance = hwm > 0 && equityEnd > 0
    ? ((equityEnd / hwm) * 100)
    : 0;

  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in h-full"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Evolución de Equity
      </h3>

      {/* Start → End flow */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex-1 bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="text-[10px] text-muted-foreground uppercase font-medium mb-1">
            Inicial
          </div>
          <div className="text-base font-bold font-mono text-foreground">
            {equityStart.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5 px-1">
          <ArrowRight className={`w-4 h-4 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
          <span className={`text-[9px] font-mono font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? "+" : ""}{deltaPercent.toFixed(2)}%
          </span>
        </div>

        <div className={`flex-1 rounded-lg p-3 border ${isPositive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className={`text-[10px] uppercase font-medium mb-1 ${isPositive ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
            Final
          </div>
          <div className={`text-base font-bold font-mono ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {equityEnd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* HWM bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-1 text-primary/70">
            <Trophy className="w-3 h-3" />
            <span className="font-bold uppercase tracking-tight">HWM</span>
          </div>
          <span className="font-mono font-bold text-primary">
            {hwm.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700"
            style={{ width: `${Math.min(hwmDistance, 100)}%` }}
          />
        </div>
        <p className="text-[9px] text-muted-foreground text-right">
          {hwmDistance.toFixed(1)}% del máximo histórico
        </p>
      </div>
    </div>
  );
};
