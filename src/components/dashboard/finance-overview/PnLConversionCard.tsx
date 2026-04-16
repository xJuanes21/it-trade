"use client";

import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PnLConversionCardProps {
  pnlUSD: number;
  pnlEUR: number;
  delay?: string;
}

export const PnLConversionCard = ({
  pnlUSD,
  pnlEUR,
  delay = "0.55s",
}: PnLConversionCardProps) => {
  const formatCurrency = (val: number, fractionDigits = 2) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  };

  const getPnLColor = (val: number) => {
    return val >= 0 ? "text-emerald-500" : "text-red-500";
  };

  return (
    <div
      className="glass-widget widget-hover p-6 stat-fade-in relative overflow-hidden h-full flex flex-col justify-between"
      style={{ animationDelay: delay }}
    >
      <div className="space-y-6">
        {/* USD Section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-[11px] font-black text-blue-400 tracking-tighter">USD</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              PNL EN USD
            </div>
            <div className={cn("text-2xl font-black font-mono tracking-tighter", getPnLColor(pnlUSD))}>
              {pnlUSD >= 0 ? "+" : ""}{formatCurrency(pnlUSD)}
            </div>
          </div>
        </div>

        {/* EUR Section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-[11px] font-black text-amber-500 tracking-tighter">EUR</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              PNL EN EUR
            </div>
            <div className={cn("text-2xl font-black font-mono tracking-tighter", getPnLColor(pnlEUR))}>
              {pnlEUR >= 0 ? "+" : ""}{formatCurrency(pnlEUR, 3)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-white/5 flex items-start gap-2 italic">
        <Info size={14} className="text-muted-foreground shrink-0 mt-0.5 opacity-60" />
        <p className="text-[10px] leading-relaxed text-muted-foreground/70">
          Las conversiones a USD/EUR son calculadas por el Servidor de IT TRADE al momento del snapshot.
        </p>
      </div>
    </div>
  );
};
