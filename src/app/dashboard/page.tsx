import { ActivityPanel } from "@/components/dashboard/overview/ActivityPanel";
import { AreaChartWidget } from "@/components/dashboard/overview/AreaChart";
import { BalanceCard } from "@/components/dashboard/overview/BalanceCard";
import { GainsSection } from "@/components/dashboard/overview/GainsSection";
import { MarketTable } from "@/components/dashboard/overview/MarketTable";
import { MarketDataProvider } from "@/components/dashboard/overview/providers/MarketDataProvider";
import { PerformanceDonut } from "@/components/dashboard/overview/PerformanceDonut";
import { StatsCardGrid } from "@/components/dashboard/overview/StatsCardGrid";
import { TradingChart } from "@/components/dashboard/overview/TradingChart";
import { statsData } from "@/components/dashboard/overview/data";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <MarketDataProvider>
      <div className="min-h-screen p-4 text-white md:p-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
          <header>
            <p className="text-sm text-blue-300">Resumen General</p>
            <h1 className="text-3xl font-semibold">Panel Operativo</h1>
          </header>

          <StatsCardGrid stats={statsData} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <GainsSection />
            </div>
            <BalanceCard />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#2a3050] bg-[#11152a] lg:col-span-2">
              <div className="h-full ">
                <TradingChart />
              </div>
            </div>
            <ActivityPanel />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#2a3050] bg-[#11152a] p-6">
              <p className="text-sm text-slate-400">January - June 2024</p>
              <div className="h-48">
                <PerformanceDonut />
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                Distribución de ingresos por segmento
              </p>
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-[#2a3050] bg-[#11152a] p-6">
              <p className="text-sm text-slate-400">
                Serie comparativa (6 meses)
              </p>
              <div className="h-48">
                <AreaChartWidget />
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                Evolución acumulada
              </p>
            </div>
          </div>

          <MarketTable />
        </div>
      </div>
    </MarketDataProvider>
  );
}
