"use client";

import { ChevronDown, RefreshCcw, Search } from "lucide-react";
import Chart from "chart.js/auto";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSymbolInsights } from "@/hooks/useSymbolInsights";
import { useMarketData } from "@/components/dashboard/overview/providers/MarketDataProvider";
import type { HistoryRequest } from "@/lib/api/mt5-client";

const timeframeConfig: Record<
  HistoryRequest["timeframe"],
  { label: string; bars: number; description: string }
> = {
  M1: { label: "1m", bars: 60, description: "Corto" },
  M5: { label: "5m", bars: 60, description: "Intradía" },
  M15: { label: "15m", bars: 120, description: "Intradía amplio" },
  M30: { label: "30m", bars: 120, description: "Sesión" },
  H1: { label: "1h", bars: 120, description: "Swing" },
  H4: { label: "4h", bars: 90, description: "Multi-sesión" },
  D1: { label: "1d", bars: 90, description: "Diario" },
  W1: { label: "1w", bars: 52, description: "Semanal" },
  MN1: { label: "MN", bars: 36, description: "Mensual" },
};

const timeframeOrder: HistoryRequest["timeframe"][] = [
  "M1",
  "M5",
  "M15",
  "M30",
  "H1",
  "H4",
  "D1",
  "W1",
  "MN1",
];

export function TradingChart() {
  const { instruments, selectedSymbol, selectedInstrument, setSelectedSymbol } =
    useMarketData();
  const [timeframe, setTimeframe] =
    useState<HistoryRequest["timeframe"]>("M15");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const { detail, candles, isLoading, error, refetch } = useSymbolInsights({
    symbol: selectedSymbol,
    timeframe,
    bars: timeframeConfig[timeframe].bars,
  });

  const selectableInstruments = useMemo(
    () => instruments.filter((instrument) => instrument.tradable),
    [instruments],
  );
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [symbolQuery, setSymbolQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filteredSymbols = useMemo(() => {
    const query = symbolQuery.trim().toLowerCase();
    const list = query
      ? selectableInstruments.filter(
          (instrument) =>
            instrument.symbol.toLowerCase().includes(query) ||
            instrument.description.toLowerCase().includes(query),
        )
      : selectableInstruments;
    return list.slice(0, 120);
  }, [selectableInstruments, symbolQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(event.target as Node)) return;
      setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const labels = useMemo(() => {
    return candles.map((candle) => {
      const date = new Date(candle.time);
      if (["D1"].includes(timeframe)) {
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        });
      }
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    });
  }, [candles, timeframe]);

  const prices = candles.map((candle) => candle.close);
  const lastPrice = prices.at(-1) ?? 0;
  const firstPrice = prices[0] ?? 0;
  const priceChange = lastPrice - firstPrice;
  const changePercent = firstPrice ? (priceChange / firstPrice) * 100 : 0;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (!candles.length) return;

    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      canvasRef.current.height || 300,
    );
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.35)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: selectedSymbol ?? "Precio",
            data: prices,
            borderColor: priceChange >= 0 ? "#10b981" : "#ef4444",
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            pointRadius: 0,
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(10, 15, 35, 0.95)",
            titleColor: "#fff",
            bodyColor: "#9ca3af",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const candle = candles[context.dataIndex];
                return [
                  `O: ${candle.open.toFixed(5)}`,
                  `H: ${candle.high.toFixed(5)}`,
                  `L: ${candle.low.toFixed(5)}`,
                  `C: ${candle.close.toFixed(5)}`,
                  `Vol: ${candle.volume}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 8,
              color: "#6b7280",
              font: { size: 11 },
            },
          },
          y: {
            position: "right",
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: {
              color: "#6b7280",
              font: { size: 11 },
              callback: (value) => Number(value).toFixed(5),
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [candles, labels, priceChange, prices, selectedSymbol]);

  const selectedInitial = selectedSymbol?.slice(0, 1) ?? "—";
  const description =
    detail?.description ??
    selectedInstrument?.description ??
    "Selecciona un símbolo para cargar su histórico.";

  return (
    <div className="glass-widget widget-hover overflow-hidden h-[500px] flex flex-col">
      <div className="flex flex-col gap-4 border-b border-[#1a2242] p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xl font-bold">
              {selectedInitial}
            </div>
            <div className="relative flex-1 min-w-[240px]" ref={dropdownRef}>
              <p className="text-xs uppercase tracking-wide text-blue-300">
                Par seleccionado
              </p>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 glass-inset px-4 py-2 text-left text-lg font-semibold text-white transition hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none"
              >
                <span className="truncate">
                  {selectedInstrument
                    ? `${selectedInstrument.symbol} • ${selectedInstrument.description}`
                    : "Selecciona un símbolo"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen ? (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-[#1e2650] bg-[#050816]/95 p-3 shadow-2xl backdrop-blur">
                  <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/5 glass-inset px-3 py-2 text-sm text-slate-300">
                    <Search size={14} className="text-slate-500" />
                    <input
                      value={symbolQuery}
                      onChange={(event) => setSymbolQuery(event.target.value)}
                      placeholder="Buscar símbolo"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {filteredSymbols.length ? (
                      filteredSymbols.map((instrument) => {
                        const active = instrument.symbol === selectedSymbol;
                        return (
                          <button
                            key={instrument.symbol}
                            type="button"
                            onClick={() => {
                              setSelectedSymbol(instrument.symbol);
                              setDropdownOpen(false);
                              setSymbolQuery("");
                            }}
                            className={`flex w-full flex-col rounded-xl border px-3 py-2 text-left text-sm transition ${
                              active
                                ? "border-blue-500/50 bg-blue-500/10 text-white"
                                : "border-transparent glass-inset text-slate-200 hover:border-blue-500/30"
                            }`}
                          >
                            <span className="font-semibold">
                              {instrument.symbol}
                            </span>
                            <span className="text-xs text-slate-400">
                              {instrument.description}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="py-10 text-center text-xs text-slate-500">
                        No se encontraron símbolos.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {timeframeOrder.map((key) => (
              <button
                key={key}
                onClick={() => setTimeframe(key)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  timeframe === key
                    ? "border border-blue-500/50 bg-blue-500/20 text-blue-200"
                    : "border border-transparent glass-inset text-slate-400 hover:border-white/20"
                }`}
              >
                {timeframeConfig[key].label}
              </button>
            ))}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full border border-white/10 glass-inset px-3 py-1 text-xs text-slate-300 transition hover:border-blue-500 disabled:opacity-50"
            >
              <RefreshCcw
                size={14}
                className={isLoading ? "animate-spin text-blue-400" : ""}
              />
              Sync
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 px-6 py-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Último
          </p>
          <p className="text-2xl font-semibold text-white">
            {lastPrice.toFixed(5)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Variación
          </p>
          <p
            className={`text-2xl font-semibold ${priceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(5)} ({changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </p>
        </div>
        {detail ? (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Volumen mín.
              </p>
              <p className="text-2xl font-semibold text-white">
                {detail.volume_min}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Volumen máx.
              </p>
              <p className="text-2xl font-semibold text-white">
                {detail.volume_max}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex-1 min-h-[320px] rounded-2xl border border-white/5 glass-inset p-4">
        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-rose-300">
            {error}
          </div>
        ) : !selectedSymbol ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Selecciona un símbolo en el selector superior para ver su histórico.
          </div>
        ) : isLoading && !candles.length ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Cargando gráfico…
          </div>
        ) : candles.length ? (
          <canvas ref={canvasRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No hay datos históricos disponibles para {selectedSymbol}.
          </div>
        )}
      </div>
    </div>
  );
}
