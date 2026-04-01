"use client";

import React, { useEffect, useState } from "react";
import { RefreshCcw, Search, LayoutGrid, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";

interface OpenPosition {
  symbol: string;
  type: string;
  lots: number;
  open_price: number;
  current_price: number;
  profit: number;
  account_id: string;
  ticket: string;
}

export function MarketTable() {
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await tradeCopierService.getPositionsOpen();
      if (res.status === "success" && res.data?.openPositions) {
        setPositions(res.data.openPositions);
      } else {
        // Fallback for empty or different structure
        setPositions([]);
      }
    } catch (err) {
      console.error("Failed to fetch open positions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const filteredPositions = positions.filter(p => 
    p.symbol.toLowerCase().includes(query.toLowerCase()) ||
    p.account_id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="glass-widget widget-hover p-6 text-foreground">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <LayoutGrid className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Posiciones Abiertas</h2>
            <p className="text-xs text-muted-foreground">Monitor en tiempo real de operaciones activas</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por símbolo o cuenta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={fetchPositions}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:border-primary disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={loading ? "animate-spin text-primary" : ""}
            />
            Sync
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/20">
        <div className="max-h-[500px] overflow-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border/50 text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Símbolo</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-right">Lote</th>
                <th className="px-6 py-4 text-right">Precio Apertura</th>
                <th className="px-6 py-4 text-right">Precio Actual</th>
                <th className="px-6 py-4 text-right">Beneficio</th>
                <th className="px-6 py-4 text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 bg-transparent">
              {loading && positions.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 w-full rounded bg-muted/20" />
                    </td>
                  </tr>
                ))
              ) : filteredPositions.length > 0 ? (
                filteredPositions.map((pos, idx) => (
                  <tr
                    key={`${pos.ticket}-${idx}`}
                    className="hover:bg-secondary/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {pos.symbol}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ACC: {pos.account_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        pos.type.toLowerCase().includes('buy') 
                          ? 'bg-emerald-500/20 text-emerald-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {pos.lots.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {pos.open_price.toLocaleString(undefined, { minimumFractionDigits: 5 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-blue-500">
                      {pos.current_price.toLocaleString(undefined, { minimumFractionDigits: 5 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 font-mono font-bold">
                        <span className={pos.profit >= 0 ? "text-emerald-500" : "text-red-500"}>
                          {pos.profit >= 0 ? "+" : ""}{pos.profit.toFixed(2)}
                        </span>
                        {pos.profit >= 0 ? (
                          <TrendingUp size={14} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={14} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground/50 font-mono text-[10px]">
                      #{pos.ticket}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground bg-secondary/10">
                    <div className="flex flex-col items-center gap-3">
                      <LayoutGrid className="w-10 h-10 opacity-20" />
                      <p className="font-medium italic">No hay posiciones abiertas en este momento.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
