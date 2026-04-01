"use client";

import React from "react";
import { History, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface ClosedPosition {
  symbol: string;
  type: string;
  lots: number;
  open_price: number;
  close_price: number;
  profit: number;
  pips: number;
  time_open: string;
  time_close: string;
  ticket: string;
}

interface HistoryTableProps {
  positions: ClosedPosition[];
  loading?: boolean;
}

export function HistoryTable({ positions, loading }: HistoryTableProps) {
  return (
    <div className="glass-widget p-6 text-foreground">
      <header className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <History className="text-blue-500 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Historial de Operaciones</h3>
          <p className="text-xs text-muted-foreground">Registro de posiciones cerradas y resultados finales</p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border/50">
        <table className="min-w-full divide-y divide-border/30 text-sm">
          <thead className="bg-secondary/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">
            <tr>
              <th className="px-4 py-3 text-left">Ticket / Símbolo</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-right">Lotes</th>
              <th className="px-4 py-3 text-right">PnL</th>
              <th className="px-4 py-3 text-right">Pips</th>
              <th className="px-4 py-3 text-right">Duración</th>
              <th className="px-4 py-3 text-right">Cierre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-4 w-full rounded bg-muted/10" />
                  </td>
                </tr>
              ))
            ) : positions.length > 0 ? (
              positions.map((pos) => (
                <tr key={pos.ticket} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">#{pos.ticket}</span>
                      <span className="text-[10px] text-primary font-mono">{pos.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      pos.type.toLowerCase().includes('buy') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {pos.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-xs">
                    {pos.lots.toFixed(2)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono font-bold ${pos.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {pos.profit >= 0 ? "+" : ""}{pos.profit.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground">
                    {pos.pips.toFixed(1)}
                  </td>
                  <td className="px-4 py-4 text-right text-[10px] text-muted-foreground">
                    <div className="flex items-center justify-end gap-1">
                      <Clock size={10} />
                      {/* Calculation of duration could be done in adapter but showing closing time for now */}
                      <span>{pos.time_open.split(' ')[1]} → {pos.time_close.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-[10px] font-medium text-muted-foreground/70">
                    {pos.time_close.split(' ')[0]}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground italic bg-secondary/5">
                  No hay historial de operaciones disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
