"use client";

import { ChevronDown, RefreshCcw } from "lucide-react";

import { useMarketData } from "@/components/dashboard/overview/providers/MarketDataProvider";

export function ActivityPanel() {
  const { activityFeed, isLoading, refetch } = useMarketData();

  return (
    <div className="rounded-2xl border border-[#2a3050] bg-[#11152a] p-6 text-white shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Actividad</h3>
          <p className="text-xs text-slate-500">Operaciones derivadas del snapshot actual</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-[#2a3050] bg-[#0d1121] px-3 py-1.5 text-sm text-slate-300 hover:border-[#3a4060]">
            Hoy
            <ChevronDown size={14} />
          </button>
          <button
            className="rounded-lg border border-[#2a3050] bg-[#0d1121] p-2 text-slate-300 transition hover:border-blue-500 disabled:opacity-50"
            onClick={() => refetch()}
            disabled={isLoading}
            aria-label="Refrescar actividad"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin text-blue-400" : ""} />
          </button>
        </div>
      </div>
      <div className="max-h-120 space-y-3 overflow-y-auto pr-1">
        {isLoading && !activityFeed.length
          ? [...Array(6)].map((_, index) => (
              <div
                key={`activity-skeleton-${index}`}
                className="flex items-center justify-between rounded-xl border border-[#2a3050] bg-[#0a0e1a] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#131a33]" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-[#131a33]" />
                    <div className="h-2 w-12 rounded bg-[#131a33]" />
                  </div>
                </div>
                <div className="h-3 w-12 rounded bg-[#131a33]" />
              </div>
            ))
          : null}

        {!isLoading && !activityFeed.length ? (
          <div className="rounded-xl border border-[#2a3050] bg-[#0a0e1a] p-4 text-sm text-slate-400">
            No hay actividad disponible para los símbolos actuales.
          </div>
        ) : null}

        {activityFeed.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-[#2a3050] bg-[#0a0e1a] p-4 text-sm text-slate-200 transition hover:border-[#3a4060]"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.symbol.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{item.symbol}</p>
                <p className={item.action === "Buy" ? "text-xs text-emerald-400" : "text-xs text-rose-400"}>
                  {item.action}
                </p>
              </div>
            </div>
            <p className={`font-semibold ${item.action === "Buy" ? "text-emerald-300" : "text-rose-300"}`}>
              ${item.price.toFixed(item.precision)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
