"use client";
import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Share2, Calendar, Filter } from "lucide-react";
import { WinstreakCard } from "./WinstreakCard";
import { MetricCard } from "./MetricCards";
import { GaugeCard } from "./WinrateGauges";
import { PnLSummary } from "./PnLSummary";
import { PeriodReturns } from "./PeriodReturns";
import { CapitalFlows } from "./CapitalFlows";
import { TradeStats } from "./TradeStats";
import { EquityCurve, PnLDistribution } from "./Charts";
import { TradingCalendar } from "./TradingCalendar";
import { dashboardService } from "@/services/dashboard.service";
import { FinancialDashboardResponse } from "@/types/dashboard";
import { AccountConnectModal } from "@/components/dashboard/config/AccountConnectModal";
import { toast } from "sonner";

const TradingDashboard = () => {
  const [data, setData] = useState<FinancialDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Accounts
        const accounts = await dashboardService.getAccounts();

        if (!accounts || accounts.length === 0) {
          setShowConnectModal(true);
          setLoading(false);
          return;
        }

        const activeLogin = accounts[0].login;

        // 2. Fetch Financial Data
        const response =
          await dashboardService.getFinancialDashboard(activeLogin);
        setData(response);
      } catch (error) {
        console.error("Error al obtener datos financieros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await dashboardService.syncAccount();
      toast.success("Sincronización completada", {
        description: "Tus datos financieros se han actualizado correctamente.",
      });
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error("Error de sincronización", {
        description: error.message || "No se pudo actualizar los datos.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAccountConnected = () => {
    setShowConnectModal(false);
    window.location.reload();
  };

  const handleCloseModal = () => {
    setShowConnectModal(false);
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

    // Simple logic to group by 7 days for now, assuming calendar is ordered
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
      <div className="min-h-screen bg-[#060818] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="animate-pulse text-blue-400">
            Cargando Resumen Financiero...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {showConnectModal && (
        <AccountConnectModal
          onSuccess={handleAccountConnected}
          onClose={handleCloseModal}
        />
      )}

      {!data && !showConnectModal && (
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
          <div className="glass-widget widget-hover p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Conexión Requerida</h3>
            <p className="text-slate-400 mb-8">
              Para visualizar el resumen financiero, necesitas conectar una
              cuenta de MT5 válida.
            </p>
            <a
              href="/dashboard/configuracion"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors w-full justify-center"
            >
              Ir a Configuración
            </a>
            <button
              onClick={() => setShowConnectModal(true)}
              className="mt-4 text-sm text-slate-500 hover:text-white transition-colors"
            >
              Volver a intentar aquí
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Resumen <span className="text-blue-400">Financiero</span>
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Última Sync:{" "}
                    {new Date(data.meta.last_sync).toLocaleString("es-ES")}
                  </span>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5 flex items-center gap-1.5 border border-transparent hover:border-white/10 ${isSyncing ? "animate-pulse" : ""}`}
                    title="Sincronizar ahora"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    <span className="text-[11px] font-medium uppercase tracking-wider">
                      {isSyncing ? "Sincronizando..." : "Sincronizar"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 glass-widget !rounded-xl px-4 py-2 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-sm font-semibold">REAL</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {data.meta.account_id}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl p-1 border border-slate-800">
                  <button className="glass-widget !rounded-lg p-2 hover:bg-white/5 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="glass-widget !rounded-lg p-2 hover:bg-white/5 transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="glass-widget !rounded-lg px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Mes Actual</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 1: 5 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <WinstreakCard
                current={data.summary.win_streak.current}
                best={data.summary.win_streak.best}
                losses={data.summary.win_streak.losses}
                wonDays={data.summary.total_trades.won} // Note: API says won_days but maps to won trades in legacy? Checking naming
                lostTrades={data.summary.total_trades.lost}
              />
              <MetricCard
                title="Ganancia/Pérdida Diaria"
                value={data.summary.performance.day_win}
                label="Sesión Actual"
                max={data.summary.performance.day_win || 100}
                delay="0.1s"
              />
              <MetricCard
                title="Promedio Ganancia/Pérdida"
                value={data.summary.performance.avg_win}
                label="Promedio Histórico"
                max={10} // Arbitrary max for now
                delay="0.2s"
              />
              <GaugeCard
                label="Winrate Diario"
                value={data.summary.performance.daily_winrate}
                max={100}
                color="#3b82f6"
                delay="0.3s"
              />
              <GaugeCard
                label="Winrate Total"
                value={data.summary.performance.total_winrate}
                max={100}
                color="#8b5cf6"
                delay="0.4s"
              />
            </div>

            {/* Optimized Vertical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Unified Sidebar (4/12) */}
              <div className="lg:col-span-4 space-y-6">
                <PnLSummary
                  gains={{ percent: 0, absolute: 0 }} // Missing from this specific endpoint response? Check structure
                  netPnL={0} // Missing
                  delay="0.5s"
                />
                {/* Note: PeriodReturns is missing from /financial endpoint based on provided definition.
                We might need to calculate it or ask backend. For now, hiding or passing defaults.
            */}
                <PeriodReturns
                  periodReturns={{
                    daily: 0,
                    weekly: 0,
                    monthly: 0,
                    annualized: 0,
                  }}
                  delay="0.6s"
                />
                <TradeStats
                  tradeStats={{
                    winRate: data.trade_stats.win_rate,
                    profitFactor: data.trade_stats.profit_factor,
                    avgWinLoss: data.trade_stats.avg_win_loss_ratio,
                    avgDuration: data.trade_stats.avg_duration,
                  }}
                  risk={{
                    currentEquity: data.summary.risk.current_equity,
                    currentBalance: data.summary.risk.current_balance,
                    highestBalance: data.summary.risk.highest_balance,
                  }}
                  delay="0.7s"
                />
                <CapitalFlows capitalFlows={data.capital_flows} delay="0.8s" />
              </div>

              {/* RIGHT COLUMN: Main Content Group (8/12) */}
              <div className="lg:col-span-8 space-y-8">
                <TradingCalendar
                  calendarData={data.calendar}
                  weekTotals={weekTotals} // Calculated
                  monthTotal={monthTotal} // Calculated
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <EquityCurve data={equityCurveData} />
                  <PnLDistribution data={dailyPnLData} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TradingDashboard;
