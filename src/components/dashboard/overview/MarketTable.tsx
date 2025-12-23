"use client";

import { RefreshCcw, Search, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { useMarketData } from "@/components/dashboard/overview/providers/MarketDataProvider";

const limits = [25, 50, 100, 250];

export function MarketTable() {
  const {
    snapshot,
    visibleInstruments,
    query,
    setQuery,
    limit,
    setLimit,
    showOnlyTradable,
    setShowOnlyTradable,
    selectedSymbol,
    setSelectedSymbol,
    selectedInstrument,
    isLoading,
    error,
    refetch,
    lastUpdated,
  } = useMarketData();

  const totals = snapshot
    ? [
        { label: "Símbolos", value: snapshot.totalSymbols },
        { label: "Tradables", value: snapshot.tradableCount },
        { label: "Sin liquidez", value: snapshot.zeroLiquidityCount },
        { label: "Spread medio", value: `${snapshot.averageSpread.toFixed(2)} pips` },
      ]
    : [];

  const stateLabel = useMemo(() => {
    if (isLoading) return "Actualizando mercado…";
    if (error) return "Error al sincronizar";
    return lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString()}` : "Sin actualizar";
  }, [error, isLoading, lastUpdated]);

  return (
    <div className="rounded-2xl border border-[#2a3050] bg-[#0b0f1e] p-6 text-white shadow-xl">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-blue-300">Mercado MT5</p>
          <h2 className="text-2xl font-semibold">Visión de Símbolos</h2>
          <p className="text-xs text-slate-500">{stateLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar símbolo o descripción"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64 rounded-2xl border border-[#2a3050] bg-[#050816] py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="rounded-2xl border border-[#2a3050] bg-[#050816] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            {limits.map((value) => (
              <option key={value} value={value}>
                Top {value}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowOnlyTradable((prev) => !prev)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition ${
              showOnlyTradable
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                : "border-[#2a3050] bg-[#050816] text-slate-300 hover:border-[#3a4060]"
            }`}
          >
            <Sparkles size={16} />
            {showOnlyTradable ? "Solo tradables" : "Todos"}
          </button>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl border border-[#2a3050] bg-[#050816] px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isLoading ? "animate-spin text-blue-400" : ""} />
            Sync
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {totals.length ? (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {totals.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#161c33] bg-[#0f1426] p-4 text-sm text-slate-400"
            >
              <p>{card.label}</p>
              <p className="text-2xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#161c33]">
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full divide-y divide-[#161c33] text-sm">
            <thead className="bg-[#0f152a] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Símbolo</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-right">Bid</th>
                <th className="px-4 py-3 text-right">Ask</th>
                <th className="px-4 py-3 text-right">Spread (pts)</th>
                <th className="px-4 py-3 text-right">Spread (pips)</th>
                <th className="px-4 py-3 text-right">Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161c33] bg-[#050816]">
              {isLoading && !visibleInstruments.length ? (
                [...Array(limit)].map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-3 w-24 rounded bg-[#111831]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3 w-40 rounded bg-[#111831]" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-16 rounded bg-[#111831]" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-16 rounded bg-[#111831]" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-[#111831]" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-[#111831]" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-[#111831]" />
                    </td>
                  </tr>
                ))
              ) : visibleInstruments.length ? (
                visibleInstruments.map((instrument) => {
                  const isSelected = selectedSymbol === instrument.symbol;
                  return (
                    <tr
                      key={instrument.symbol}
                      onClick={() => setSelectedSymbol(instrument.symbol)}
                      className={`cursor-pointer transition ${
                        isSelected ? "bg-[#11203f]" : "hover:bg-[#0f152a] focus-within:bg-[#0f152a]"
                      }`}
                      aria-selected={isSelected}
                    >
                      <td className="px-4 py-3 font-semibold text-white">{instrument.symbol}</td>
                      <td className="px-4 py-3 text-slate-400">{instrument.description}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-blue-200">
                        {instrument.bid.toFixed(instrument.digits)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-200">
                        {instrument.ask.toFixed(instrument.digits)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{instrument.spread.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{instrument.spreadPips.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{instrument.contractSize}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No hay resultados para los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
