"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";

interface RankingEntry {
  account_id: string;
  name: string;
  profit: number;
  roi: number;
  drawdown: number;
  equity: number;
  type: number;
}

export function RankingTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        // 1. Fetch reporting data with global flag for the Home Ranking
        const reportResponse = await tradeCopierService.getReporting({
          global: true,
        } as any);

        if (
          reportResponse.status !== "success" ||
          !reportResponse.data?.reporting
        ) {
          throw new Error("Failed to load ranking data");
        }

        // 2. Fetch local accounts to get the "proper name" as requested by user
        const accountsResponse = await tradeCopierService.getAccounts();
        const accountNames = new Map(
          (accountsResponse.data?.accounts || []).map((a: any) => [
            a.account_id,
            a.name,
          ]),
        );

        // 3. Map and sort by Profit (Ranking) - Updated per real API response
        const mappedRanking: RankingEntry[] = reportResponse.data.reporting.map(
          (rep: any) => {
            // Calculate DD if not provided: (1 - Equity / HWM) * 100
            const calcDD =
              rep.hwm > 0
                ? Math.max(0, (1 - rep.equity_end / rep.hwm) * 100)
                : 0;

            return {
              account_id: rep.account_id,
              name:
                rep.name ||
                accountNames.get(rep.account_id) ||
                `Account ${rep.account_id}`,
              profit:
                typeof rep.pnlUSD === "number"
                  ? rep.pnlUSD
                  : parseFloat(rep.pnlUSD || rep.profit || "0"),
              roi:
                typeof rep.performance === "number"
                  ? rep.performance
                  : parseFloat(rep.performance || rep.roi || "0"),
              drawdown:
                typeof rep.drawdown === "number" && rep.drawdown !== 0
                  ? rep.drawdown
                  : calcDD,
              equity:
                typeof rep.equity_end === "number"
                  ? rep.equity_end
                  : parseFloat(rep.equity_end || "0"),
              type: typeof rep.type === "number" ? rep.type : 0,
            };
          },
        );

        // Sort by profit descending
        mappedRanking.sort((a, b) => b.profit - a.profit);

        setRanking(mappedRanking);
      } catch (err: any) {
        console.error("Ranking fetch error:", err);
        setError("No se pudo cargar el ranking de cuentas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="glass-widget p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">
          Calculando Ranking...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-widget p-8 flex flex-col items-center justify-center min-h-[300px] border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-8 h-8 text-destructive mb-4" />
        <p className="text-destructive font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-xs underline text-muted-foreground hover:text-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="glass-widget widget-hover p-6 text-foreground overflow-hidden">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <Trophy className="text-yellow-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ranking Global</h2>
            <p className="text-xs text-muted-foreground">
              Top traders y cuentas con mejor rendimiento
            </p>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border/50">
              <th className="px-4 py-3 text-left font-medium">Pos</th>
              <th className="px-4 py-3 text-left font-medium">Cuenta</th>
              <th className="px-4 py-3 text-right font-medium">Profit</th>
              <th className="px-4 py-3 text-right font-medium">ROI</th>
              <th className="px-4 py-3 text-right font-medium">Capital</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {ranking.length > 0 ? (
              ranking.map((account, index) => (
                <tr
                  key={account.account_id}
                  className="hover:bg-secondary/30 transition-colors group"
                >
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`
                      flex items-center justify-center w-6 h-6 rounded-lg font-bold text-[10px] mx-auto
                      ${
                        index === 0
                          ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                          : index === 1
                            ? "bg-slate-300 text-black shadow-lg shadow-slate-300/20"
                            : index === 2
                              ? "bg-orange-400 text-black shadow-lg shadow-orange-400/20"
                              : "bg-secondary text-muted-foreground"
                      }
                    `}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {account.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            account.type === 0
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          }`}
                        >
                          {account.type === 0 ? "Master" : "Slave"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        #{account.account_id}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-mono font-bold ${account.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {account.profit >= 0 ? "+" : ""}$
                    {account.profit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={`font-bold ${account.roi >= 0 ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {account.roi >= 0 ? "+" : ""}
                        {account.roi.toFixed(2)}%
                      </span>
                      {account.roi >= 0 ? (
                        <TrendingUp size={12} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={12} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-muted-foreground font-bold">
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
                  className="px-4 py-20 text-center text-muted-foreground bg-secondary/5"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Trophy className="w-12 h-12 opacity-10" />
                    <p className="font-medium text-lg">
                      Sin historial operativo
                    </p>
                    <p className="text-sm max-w-xs mx-auto">
                      Vincule sus cuentas en la sección de Modelos para comenzar
                      a trackear su rendimiento global.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
