"use client";

import React from "react";
import { ArrowDownUp } from "lucide-react";

interface CapitalFlowsProps {
  depositWithdrawal: number;
  currency: string;
  delay?: string;
}

export const CapitalFlows = ({
  depositWithdrawal,
  currency,
  delay = "0.5s",
}: CapitalFlowsProps) => {
  const isPositive = depositWithdrawal > 0;
  const isNeutral = depositWithdrawal === 0;

  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
        Flujo de Capital
      </h3>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isNeutral ? 'bg-muted/20' : isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`}>
          <ArrowDownUp className={`w-4 h-4 ${
            isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-500' : 'text-red-500'
          }`} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">
            Depósitos / Retiros Neto
          </p>
          <p className={`text-lg font-bold font-mono ${
            isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isPositive ? "+" : ""}{depositWithdrawal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </p>
        </div>
      </div>
      <p className="text-[9px] text-muted-foreground italic mt-3">
        Balance neto de depósitos y retiros del periodo reportado.
      </p>
    </div>
  );
};
