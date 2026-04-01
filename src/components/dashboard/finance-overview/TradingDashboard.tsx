"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Share2, Calendar, Filter, PlusCircle, Wallet } from "lucide-react";
import { WinstreakCard } from "./WinstreakCard";
import { MetricCard } from "./MetricCards";
import { GaugeCard } from "./WinrateGauges";
import { PnLSummary } from "./PnLSummary";
import { PeriodReturns } from "./PeriodReturns";
import { CapitalFlows } from "./CapitalFlows";
import { TradeStats } from "./TradeStats";
import { EquityCurve, PnLDistribution } from "./Charts";
import { TradingCalendar } from "./TradingCalendar";
import { RankingTable } from "../overview/RankingTable";
import { tradeCopierService } from "@/services/trade-copier.service";
import { tradeCopierAdapter } from "@/lib/trade-copier-adapter";
import { FinancialDashboardResponse } from "@/types/dashboard";
import { toast } from "sonner";
import Link from "next/link";
import { TechnicalAudit } from "./TechnicalAudit";
import { HistoryTable } from "./HistoryTable";

const TradingDashboard = () => {
  const [data, setData] = useState<FinancialDashboardResponse | null>(null);
  const [hasAccounts, setHasAccounts] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Trade Copier Accounts
        const tcAccountsRes = await tradeCopierService.getAccounts();
        const tcAccounts = tcAccountsRes.data?.accounts || [];

        if (tcAccounts.length > 0) {
          setHasAccounts(true);
          const activeAccountId = tcAccounts[0].account_id;
          
          // Set fallback data immediately so dashboard appears
          setData(tradeCopierAdapter.createEmptyFinancial(tcAccounts[0]));

          // Parallel fetch for reporting and history
          const [reportRes, historyRes] = await Promise.all([
            tradeCopierService.getReporting({ account_id: activeAccountId }),
            tradeCopierService.getPositionsClosed({ account_id: activeAccountId })
          ]);
          
          if (reportRes.status === "success" && reportRes.data?.reporting?.length > 0) {
            const mappedData = tradeCopierAdapter.toFinancial(reportRes.data.reporting[0]);
            setData(mappedData);
          }

          if (historyRes.status === "success" && historyRes.data?.closedPositions) {
            setHistory(historyRes.data.closedPositions);
          }
        } else {
          setHasAccounts(false);
        }
      } catch (error) {
        console.error("Error al obtener datos del Servidor de IT TRADE:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ... rest of the useMemo and handlers ...
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      window.location.reload();
    } finally {
      setIsSyncing(false);
    }
  };

  const equityCurveData = useMemo(() => {
    if (!data?.charts?.equity_curve) return [];
    return data.charts.equity_curve.map((point) => ({
      day: new Date(point.date).toLocaleDateString("es-ES"),
      equity: point.equity,
    }));
  }, [data]);

  const dailyPnLData = useMemo(() => {
    if (!data?.charts?.daily_pnl_distribution) return [];
    return data.charts.daily_pnl_distribution.map((point) => ({
      day: new Date(point.date).toLocaleDateString("es-ES"),
      pnl: point.pnl,
      color: point.color,
    }));
  }, [data]);

  const weekTotals = useMemo(() => {
    if (!data?.calendar) return [];
    const weeks: any[] = [];
    let weekSum = 0;
    let weekPercent = 0;

    data.calendar.forEach((day: any, idx) => {
      weekSum += day.pnl || 0;
      weekPercent += day.percent || 0;

      if ((idx + 1) % 7 === 0 || idx === data.calendar.length - 1) {
        weeks.push({
          total: weekSum.toFixed(2),
          percent: weekPercent.toFixed(2),
          isNegative: weekSum < 0,
        });
        weekSum = 0;
        weekPercent = 0;
      }
    });
    return weeks;
  }, [data]);

  const monthTotal = useMemo(() => {
    if (!data?.calendar) return { total: "0.00", percent: "0.00" };
    const total = data.calendar.reduce((sum, day) => sum + (day.pnl || 0), 0);
    const percent = data.calendar.reduce(
      (sum, day) => sum + (day.percent || 0),
      0,
    );
    return { total: total.toFixed(2), percent: percent.toFixed(2) };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <div className="animate-pulse text-primary font-medium tracking-tight">Sincronizando Resumen Financiero...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-foreground">
      {hasAccounts && data ? (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Resumen <span className="text-primary">Financiero</span>
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Última Sync: {data.meta.last_sync ? new Date(data.meta.last_sync).toLocaleString("es-ES") : "Pendiente"}
                </span>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-secondary/50 flex items-center gap-1.5 border border-transparent hover:border-border ${isSyncing ? "animate-pulse" : ""}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  <span className="text-[11px] font-medium uppercase tracking-wider">{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 glass-widget !rounded-xl px-4 py-2 border border-border">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-semibold uppercase">{data.meta.broker} {data.meta.server}</span>
                <span className="text-xs text-muted-foreground font-mono">{data.meta.account_id}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-xl p-1 border border-border">
                <button className="glass-widget !rounded-lg p-2 hover:bg-muted/50 transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="glass-widget !rounded-lg p-2 hover:bg-muted/50 transition-colors"><Filter className="w-4 h-4" /></button>
                <button className="glass-widget !rounded-lg px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Mes Actual</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <WinstreakCard
              current={data.summary.win_streak.current}
              best={data.summary.win_streak.best}
              losses={data.summary.win_streak.losses}
              wonDays={data.summary.total_trades.won}
              lostTrades={data.summary.total_trades.lost}
            />
            <MetricCard
              title="Ganancia/Pérdida Diaria"
              value={data.summary.performance.day_win}
              label={data.meta.currency}
              max={data.summary.performance.day_win || 100}
              delay="0.1s"
            />
            <MetricCard
              title="Promedio Ganancia"
              value={data.summary.performance.avg_win}
              label="Por Operación"
              max={100}
              delay="0.2s"
            />
            <GaugeCard label="Winrate Diario" value={data.summary.performance.daily_winrate} max={100} color="#3b82f6" delay="0.3s" />
            <GaugeCard label="Winrate Total" value={data.summary.performance.total_winrate} max={100} color="#8b5cf6" delay="0.4s" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <PnLSummary
                gains={{ percent: data.technical_stats.performance_percent, absolute: data.summary.performance.day_win }}
                netPnL={data.summary.performance.day_win}
                delay="0.5s"
              />
              <PeriodReturns
                periodReturns={{ daily: data.summary.performance.day_win, weekly: 0, monthly: 0, annualized: 0 }}
                delay="0.6s"
              />
              <TradeStats
                tradeStats={data.trade_stats}
                risk={{
                  current_equity: data.summary.risk.current_equity,
                  current_balance: data.summary.risk.current_balance,
                  highest_balance: data.summary.risk.highest_balance,
                }}
                delay="0.7s"
              />
              <CapitalFlows capitalFlows={data.capital_flows} delay="0.8s" />
            </div>

            <div className="lg:col-span-8 space-y-8">
              <TechnicalAudit stats={data.technical_stats} currency={data.meta.currency} delay="0.9s" />
              
              <TradingCalendar calendarData={data.calendar} weekTotals={weekTotals} monthTotal={monthTotal} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EquityCurve data={equityCurveData} />
                <PnLDistribution data={dailyPnLData} />
              </div>

              <HistoryTable positions={history} />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
          <div className="glass-widget p-12 flex flex-col items-center justify-center text-center space-y-8 max-w-lg border-primary/20 bg-primary/5">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">
              <Wallet className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold tracking-tight">Análisis Financiero</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Para acceder a las estadísticas detalladas y gráficas de rendimiento, debes vincular tu cuenta con el <strong>Servidor de IT TRADE</strong>.
              </p>
            </div>
            <div className="w-full pt-4">
              <Link 
                href="/dashboard/copy-trader/accounts"
                className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle size={24} /> Vincular con Servidor de IT TRADE
              </Link>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TradingDashboard;
