"use client";

import React from "react";
import { TrendingUp, TrendingDown, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const deltaPercent = equityStart > 0 ? (delta / equityStart) * 100 : 0;
  const isPositive = delta >= 0;

  // How close is equity_end to hwm?
  const hwmDistance = hwm > 0 && equityEnd > 0 ? (equityEnd / hwm) * 100 : 0;

  const formatValue = (val: number) =>
    val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      className="glass-widget-darker widget-hover p-6 stat-fade-in relative overflow-hidden"
      style={{ animationDelay: delay }}
    >
      {/* Background subtle glow */}
      <div
        className={cn(
          "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none",
          isPositive ? "bg-emerald-500" : "bg-red-500",
        )}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Evolución de Equity
            </h3>
            <div
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500",
              )}
            >
              {isPositive ? "+" : ""}
              {deltaPercent.toFixed(2)}%
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                Equity Inicial
              </span>
              <div className="text-xl font-black font-mono tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left">
                {formatValue(equityStart)} <span className="text-xs text-muted-foreground/50">{currency}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                PnL Periodo
              </span>
              <div className={cn("text-xl font-black font-mono tracking-tighter", isPositive ? "text-emerald-500" : "text-red-500")}>
                {isPositive ? "+" : ""}{formatValue(delta)} <span className="text-xs opacity-50">{currency}</span>
              </div>
            </div>

            <div className="space-y-1 col-span-2 md:col-span-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                Equity Final
              </span>
              <div className={cn("text-2xl font-black font-mono tracking-tighter", isPositive ? "text-emerald-400" : "text-red-400")}>
                {formatValue(equityEnd)} <span className="text-xs opacity-50">{currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Improved HWM Visualizer */}
        <div className="w-full md:w-[240px] shrink-0 bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-primary/10 border border-primary/20">
                <Trophy className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase text-primary tracking-wider">HWM</span>
            </div>
            <span className="text-xs font-black font-mono text-primary">
              {formatValue(hwm)}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(hwmDistance, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/60">
              <span>Rendimiento</span>
              <span className="text-primary">{hwmDistance.toFixed(1)}% del Máximo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
