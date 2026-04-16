"use client";

import React from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useGlobalRanking } from "@/hooks/useGlobalRanking";

export function RankingTable() {
  const { loading, error, ranking } = useGlobalRanking();

  // Skeleton for loading state
  const SkeletonRow = ({ index }: { index: number }) => (
    <tr
      key={index}
      className="animate-pulse border-b border-white/5 last:border-0"
    >
      <td className="px-4 py-4 text-center">
        <div className="h-8 w-8 bg-white/10 rounded-xl mx-auto" />
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-white/10 rounded-lg" />
          <div className="h-2 w-20 bg-white/5 rounded-full" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-16 bg-white/10 rounded-lg ml-auto" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-12 bg-white/20 rounded-lg ml-auto shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-20 bg-white/10 rounded-lg ml-auto" />
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="glass-widget p-6 text-foreground h-[650px] flex flex-col border border-white/5 overflow-hidden">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center animate-pulse">
              <Trophy className="text-white/10 w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-48 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-2 w-32 bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1">
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="px-4 py-4 border-b border-white/5 last:border-0 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-white/10 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded-lg" />
                    <div className="h-2 w-20 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="h-5 w-16 bg-white/10 rounded-lg" />
                  <div className="h-5 w-12 bg-white/20 rounded-lg" />
                  <div className="h-5 w-20 bg-white/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary/30 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
              Sincronizando Ranking Global
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state inside the component structure
  const renderBody = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive/60" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-foreground">
              Información No Disponible
            </p>
            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
              No se pudo establecer conexión con el motor de reporting.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground px-6 py-3 rounded-2xl font-bold transition-all border border-white/10 hover:scale-[1.02]"
          >
            <Loader2 className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Reintentar Conexión
          </button>
        </div>
      );
    }

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground/50 border-b border-border/50">
            <th className="px-4 py-3 text-left font-black uppercase text-[10px] tracking-widest">
              Pos
            </th>
            <th className="px-4 py-3 text-left font-black uppercase text-[10px] tracking-widest">
              Cuenta
            </th>
            <th className="px-4 py-3 text-center font-black uppercase text-[10px] tracking-widest">
              Cuentas Relacionadas
            </th>
            <th className="px-4 py-3 text-right font-black uppercase text-[10px] tracking-widest">
              Profit
            </th>
            <th className="px-4 py-3 text-right font-black uppercase text-[10px] tracking-widest">
              ROI
            </th>
            <th className="px-4 py-3 text-right font-black uppercase text-[10px] tracking-widest">
              Capital
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {ranking.length > 0 ? (
            ranking.map((account, index) => (
              <tr
                key={account.rankingId}
                className="hover:bg-primary/5 transition-colors group cursor-default"
              >
                <td className="px-4 py-4 text-center">
                  <span
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-xl font-black text-[11px] mx-auto transition-transform group-hover:scale-110
                    ${
                      index === 0
                        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                        : index === 1
                          ? "bg-slate-300 text-black shadow-lg shadow-slate-300/20"
                          : index === 2
                            ? "bg-orange-400 text-black shadow-lg shadow-orange-400/20"
                            : "bg-white/5 text-muted-foreground border border-white/5"
                    }
                  `}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {account.ownerName || account.name}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase border ${
                          account.type === 0
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}
                      >
                        {account.type === 0 ? "Master" : "Slave"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono tracking-tighter opacity-70">
                      ID: {account.account_id}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full text-[11px] font-black min-w-[32px] transition-transform group-hover:scale-110">
                      {account.accountCount}
                    </span>
                  </div>
                </td>
                <td
                  className={`px-4 py-4 text-right font-mono font-black text-base ${account.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}
                >
                  {account.profit >= 0 ? "+" : "-"}$
                  {Math.abs(account.profit).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`font-black text-base ${account.roi >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {account.roi >= 0 ? "+" : ""}
                      {account.roi.toFixed(2)}%
                    </span>
                    {account.roi >= 0 ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-muted-foreground font-black opacity-80">
                  $
                  {account.equity.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-32 text-center text-muted-foreground animate-fade-in-up"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xl text-foreground">
                      Sin Datos Operativos
                    </p>
                    <p className="text-sm max-w-[280px] mx-auto opacity-60">
                      Vincule sus cuentas en el módulo de Cuentas para comenzar
                      a visualizar el ranking global.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="glass-widget widget-hover p-6 text-foreground h-[650px] flex flex-col overflow-hidden">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/5 ring-1 ring-yellow-500/20">
            <Trophy className="text-yellow-500 w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">
              Ranking Global
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Top traders con mayor rentabilidad histórica
            </p>
          </div>
        </div>
      </header>

      <div className="overflow-auto flex-1 custom-scrollbar">
        {renderBody()}
      </div>
    </div>
  );
}
