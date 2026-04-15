"use client";

import React from "react";
import { Wallet, TrendingUp, Activity, Wifi, WifiOff } from "lucide-react";

interface AccountStatusCardProps {
  name: string;
  balance: number;
  equity: number;
  freeMargin: number;
  openTrades: number;
  state: string;
  currency: string;
}

export const AccountStatusCard = ({
  name,
  balance,
  equity,
  freeMargin,
  openTrades,
  state,
  currency,
}: AccountStatusCardProps) => {
  const isConnected = state === "CONNECTED";
  const equityDelta = equity - balance;
  const equityDeltaPercent = balance > 0 ? ((equityDelta / balance) * 100) : 0;

  return (
    <div className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isConnected ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {isConnected
              ? <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              : <WifiOff className="w-3.5 h-3.5 text-red-500" />
            }
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Estado
            </h3>
            <span className={`text-[10px] font-bold ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
              {isConnected ? "Conectada" : "Desconectada"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-primary" />
            <span className="text-sm font-bold text-foreground">{openTrades}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Open Trades</div>
        </div>
      </div>

      {/* Balance & Equity */}
      <div className="space-y-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Balance</span>
          </div>
          <span className="text-base font-bold font-mono text-foreground text-right w-full">
            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-muted-foreground font-sans">{currency}</span>
          </span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Equity</span>
          </div>
          <span className="text-base font-bold font-mono text-primary text-right w-full">
            {equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs opacity-70 font-sans">{currency}</span>
          </span>
        </div>
      </div>

      {/* Footer: Equity delta */}
      <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">P&L Flotante</span>
        <span className={`text-xs font-bold font-mono ${equityDelta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {equityDelta >= 0 ? "+" : ""}{equityDelta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-[9px] ml-1 opacity-70">
            ({equityDeltaPercent >= 0 ? "+" : ""}{equityDeltaPercent.toFixed(2)}%)
          </span>
        </span>
      </div>
    </div>
  );
};
