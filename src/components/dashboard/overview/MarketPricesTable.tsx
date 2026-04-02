"use client";

import { RefreshCcw, Search, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { useMarketData } from "@/components/dashboard/overview/providers/MarketDataProvider";

const limits = [25, 50, 100, 250];

export function MarketPricesTable() {
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
        {
          label: "Spread medio",
          value: `${snapshot.averageSpread.toFixed(2)} pips`,
        },
      ]
    : [];

  const stateLabel = useMemo(() => {
    if (isLoading) return "Actualizando mercado…";
    if (error) return "Error al sincronizar";
    return lastUpdated
      ? `Actualizado ${lastUpdated.toLocaleTimeString()}`
      : "Sin actualizar";
  }, [error, isLoading, lastUpdated]);

  return (
    <div className="glass-widget widget-hover overflow-hidden h-[650px] flex flex-col p-6 text-foreground">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-primary">Mercado IT TRADE</p>
          <h2 className="text-2xl font-semibold">Visión de Símbolos</h2>
          <p className="text-xs text-muted-foreground">{stateLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar símbolo o descripción"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-64 rounded-2xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            <Sparkles size={16} />
            {showOnlyTradable ? "Solo tradables" : "Todos"}
          </button>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={isLoading ? "animate-spin text-primary" : ""}
            />
            Sync
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {totals.length ? (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {totals.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"
            >
              <p>{card.label}</p>
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border flex-1">
        <div className="h-full overflow-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
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
            <tbody className="divide-y divide-border bg-card">
              {isLoading && !visibleInstruments.length ? (
                [...Array(limit)].map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-3 w-24 rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-3 w-40 rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-16 rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-16 rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-muted" />
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
                        isSelected
                          ? "bg-primary/20"
                          : "hover:bg-secondary focus-within:bg-secondary"
                      }`}
                      aria-selected={isSelected}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {instrument.symbol}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {instrument.description}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-blue-600 dark:text-blue-300">
                        {instrument.bid.toFixed(instrument.digits)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                        {instrument.ask.toFixed(instrument.digits)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {instrument.spread.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {instrument.spreadPips.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {instrument.contractSize}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
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
