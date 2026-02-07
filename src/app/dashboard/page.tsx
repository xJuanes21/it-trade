"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ActivityPanel } from "@/components/dashboard/overview/ActivityPanel";
import { MarketTable } from "@/components/dashboard/overview/MarketTable";
import { MarketDataProvider } from "@/components/dashboard/overview/providers/MarketDataProvider";
import { TradingChart } from "@/components/dashboard/overview/TradingChart";
import { DashboardHeader } from "@/components/dashboard/overview/DashboardHeader";
import {
  TradeCountChart,
  ProfitChart,
} from "@/components/dashboard/overview/DashboardCharts";
import { WinstreakPanel } from "@/components/dashboard/overview/WinstreakPanel";
import { SymbolsTraded } from "@/components/dashboard/overview/SymbolsTraded";
import { PnLSummary } from "@/components/dashboard/finance-overview/PnLSummary";
import { PeriodReturns } from "@/components/dashboard/finance-overview/PeriodReturns";
import { dashboardService } from "@/services/dashboard.service";
import { OperationalDashboardResponse } from "@/types/dashboard";
import { AccountConnectModal } from "@/components/dashboard/config/AccountConnectModal";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<OperationalDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // 1. Fetch Accounts to identify active login
        const accounts = await dashboardService.getAccounts();

        if (!accounts || accounts.length === 0) {
          setShowConnectModal(true);
          setLoading(false);
          return;
        }

        // Use the first account as the active one
        // In the future, we can add a selector or persist selection
        const activeLogin = accounts[0].login;

        // 2. Fetch Dashboard Data using active login
        const response =
          await dashboardService.getOperationalDashboard(activeLogin);
        setData(response);
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await dashboardService.syncAccount();
      toast.success("Sincronización completada", {
        description: "Tus datos de MT5 se han actualizado correctamente.",
      });
      // Reload page to refresh all data
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error("Error de sincronización", {
        description: error.message || "No se pudo actualizar la cuenta.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAccountConnected = () => {
    setShowConnectModal(false);
    setLoading(true);
    // Reload dashboard logic
    window.location.reload();
  };

  const handleCloseModal = () => {
    setShowConnectModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060818] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="animate-pulse text-blue-400">
            Cargando Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-[#060818] text-white">
        {showConnectModal && (
          <AccountConnectModal
            onSuccess={handleAccountConnected}
            onClose={handleCloseModal}
          />
        )}

        {data ? (
          <>
            <DashboardHeader
              userName={session?.user?.name || data.header.user_name}
              lastSync={data.header.last_sync}
              accountType={data.header.account_status}
              onSync={handleSync}
              isSyncing={isSyncing}
            />

            <main className="p-4 md:p-6 lg:p-8">
              <div className="mx-auto max-w-[1640px]">
                {/* Primary Grid Layout: Left (3) | Middle (6) | Right (3) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT COLUMN (3/12) */}
                  <div className="lg:col-span-3 space-y-6">
                    <PnLSummary
                      gains={{
                        percent: data.finance_summary.gains_percent,
                        absolute: 0,
                      }} // Absolute not in lite response, can be calc or fetched
                      netPnL={data.finance_summary.net_pnl}
                      delay="0.1s"
                    />
                    <WinstreakPanel metrics={data.metrics} />
                    <PeriodReturns
                      periodReturns={data.finance_summary.period_returns}
                      delay="0.2s"
                    />
                  </div>

                  {/* MIDDLE COLUMN (6/12) */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Upper Middle: Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TradeCountChart data={data.charts.trade_count} />
                      <ProfitChart data={data.charts.daily_profit} />
                    </div>

                    {/* Main Middle: Trading Chart */}
                    <TradingChart />
                  </div>

                  {/* RIGHT COLUMN (3/12) */}
                  <div className="lg:col-span-3 space-y-6">
                    <SymbolsTraded data={data.charts.top_symbols} />
                    <ActivityPanel />
                  </div>
                </div>

                {/* NEW FULL WIDTH ROW: Market Table */}
                <div className="mt-8">
                  <MarketTable />
                </div>
              </div>
            </main>
          </>
        ) : (
          !showConnectModal && (
            <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
              <div className="glass-dark rounded-2xl p-8 max-w-md w-full text-center border border-slate-700/50">
                {/* Note: I need to import Share2 or use a generic icon. Since Share2 was in TradingDashboard, I'll use simple text or assume imports if I can add them. 
                      Wait, previous imports didn't have Share2. I should add it.
                  */}
                <h3 className="text-xl font-bold mb-2">Conexión Requerida</h3>
                <p className="text-slate-400 mb-8">
                  Para visualizar el dashboard, necesitas conectar una cuenta de
                  MT5 válida.
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
          )
        )}
      </div>

      <style jsx global>{`
        .glass-dark {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(10px);
        }
        .glass-darker {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(71, 85, 105, 0.2);
        }
      `}</style>
    </MarketDataProvider>
  );
}
