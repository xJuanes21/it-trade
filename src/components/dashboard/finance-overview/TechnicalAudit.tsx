"use client";

import React from "react";
import { Shield, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle, Info } from "lucide-react";

interface TechnicalStatsProps {
  stats: {
    equity_start: number;
    equity_end: number;
    hwm: number;
    deposit_withdrawal: number;
    pnl_usd: number;
    pnl_eur: number;
    performance_percent: number;
  };
  currency: string;
  delay?: string;
}

export function TechnicalAudit({ stats, currency, delay }: TechnicalStatsProps) {
  const isPositive = stats.performance_percent >= 0;

  return (
    <div 
      className="glass-widget widget-hover p-6 text-foreground"
      style={{ animationDelay: delay }}
    >
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Auditoría Técnica</h3>
            <p className="text-xs text-muted-foreground">Métricas de equidad y límites de cuenta</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        }`}>
          Performance: {isPositive ? "+" : ""}{stats.performance_percent.toFixed(2)}%
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Equity Start */}
        <div className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <ArrowDownCircle size={14} />
            <span className="text-xs font-medium uppercase">Equity Inicial</span>
          </div>
          <p className="text-xl font-mono font-bold">
            {stats.equity_start.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
          </p>
        </div>

        {/* Equity End */}
        <div className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <ArrowUpCircle size={14} />
            <span className="text-xs font-medium uppercase">Equity Final</span>
          </div>
          <p className="text-xl font-mono font-bold text-primary">
            {stats.equity_end.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
          </p>
        </div>

        {/* High Water Mark */}
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary/70">
            <TrendingUp size={14} />
            <span className="text-xs font-bold uppercase tracking-tight">High Water Mark (HWM)</span>
          </div>
          <p className="text-xl font-mono font-bold text-primary">
            {stats.hwm.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
          </p>
        </div>

        {/* Deposits/Withdrawals */}
        <div className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Wallet size={14} />
            <span className="text-xs font-medium uppercase">Flujo Capital</span>
          </div>
          <p className={`text-xl font-mono font-bold ${stats.deposit_withdrawal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.deposit_withdrawal >= 0 ? "+" : ""}{stats.deposit_withdrawal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4 bg-secondary/10 p-4 rounded-xl">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center font-bold text-xs text-indigo-500">
            USD
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">PnL en USD</p>
            <p className={`text-lg font-mono font-bold ${stats.pnl_usd >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {stats.pnl_usd >= 0 ? "+" : ""}{stats.pnl_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-secondary/10 p-4 rounded-xl">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center font-bold text-xs text-amber-500">
            EUR
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">PnL en EUR</p>
            <p className={`text-lg font-mono font-bold ${stats.pnl_eur >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {stats.pnl_eur >= 0 ? "+" : ""}{stats.pnl_eur.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground italic px-2">
        <Info size={12} />
        <span>Las conversiones a USD/EUR son calculadas por el Servidor de IT TRADE al momento del snapshot.</span>
      </div>
    </div>
  );
}
