import { StatsCardGrid } from "@/components/dashboard/overview/StatsCardGrid";
import { GainsSection } from "@/components/dashboard/overview/GainsSection";
import { BalanceCard } from "@/components/dashboard/overview/BalanceCard";
import { ActivityPanel } from "@/components/dashboard/overview/ActivityPanel";
import { PerformanceDonut } from "@/components/dashboard/overview/PerformanceDonut";
import { AreaChartWidget } from "@/components/dashboard/overview/AreaChart";
import { TradingChart } from "@/components/dashboard/overview/TradingChart";
import { statsData } from "@/components/dashboard/overview/data";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050816] p-4 text-white md:p-8">
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
            <div className="border-b border-[#2a3050] p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-2xl border border-[#2a3050] bg-[#0a0e1a] px-4 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 font-semibold text-white">
                    B
                  </div>
                  <span className="font-semibold text-white">BTC/USD</span>
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                    5x
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-[#2a3050] bg-[#0a0e1a] px-4 py-2">
                  <span>1m</span>
                </div>
              </div>
            </div>
            <div className="h-96 p-6">
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
            <p className="mt-4 text-center text-xs text-slate-500">Distribución de ingresos por segmento</p>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-[#2a3050] bg-[#11152a] p-6">
            <p className="text-sm text-slate-400">Serie comparativa (6 meses)</p>
            <div className="h-48">
              <AreaChartWidget />
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">Evolución acumulada</p>
          </div>
        </div>
      </div>
    </div>
  );
}
