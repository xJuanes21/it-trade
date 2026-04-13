"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ActivityPanel } from "@/components/dashboard/overview/ActivityPanel";
import { MarketTable } from "@/components/dashboard/overview/MarketTable";
import { MarketPricesTable } from "@/components/dashboard/overview/MarketPricesTable";
import { MarketDataProvider } from "@/components/dashboard/overview/providers/MarketDataProvider";
import { DashboardHeader } from "@/components/dashboard/overview/DashboardHeader";
import { RankingTable } from "@/components/dashboard/overview/RankingTable";
import { TradingChart } from "@/components/dashboard/overview/TradingChart";
import { AccountStatusPanel } from "@/components/dashboard/overview/AccountStatusPanel";

export default function OverviewPage() {
  const [clientTime, setClientTime] = useState("");
  const { data: session } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    setClientTime(new Date().toLocaleTimeString());
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      window.location.reload();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader
          userName={session?.user?.name || "IT Trader"}
          lastSync={clientTime || "--:--:--"}
          onSync={handleSync}
          isSyncing={isSyncing}
        />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1640px]">
            {/* Top Market Overview - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
              <div className="lg:col-span-8">
                <RankingTable />
              </div>
              <div className="lg:col-span-4">
                {session?.user?.role === "superadmin" ? (
                  <ActivityPanel />
                ) : (
                  <AccountStatusPanel />
                )}
              </div>
            </div>

            {/* Market Prices & Chart - Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
              <div className="xl:col-span-6">
                <MarketPricesTable />
              </div>
              <div className="xl:col-span-6">
                <TradingChart />
              </div>
            </div>

            {/* Open Positions - Row 3 */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">
                    Monitor de Operaciones
                  </h2>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse border border-border px-3 py-1 rounded-full">
                  Live Feed • All Accounts
                </div>
              </div>
              <MarketTable />
            </div>
          </div>
        </main>
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
