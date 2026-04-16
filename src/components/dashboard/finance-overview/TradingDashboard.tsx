"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Share2,
  PlusCircle,
  Wallet,
} from "lucide-react";
import { AccountStatusCard } from "./WinstreakCard";
import { MetricCard } from "./MetricCards";
import { GaugeCard } from "./WinrateGauges";
import { PnLSummary } from "./PnLSummary";
import { EquityEvolution } from "./PeriodReturns";
import { CapitalFlows } from "./CapitalFlows";
import { TradeStats } from "./TradeStats";
import { tradeCopierService } from "@/services/trade-copier.service";
import { tradeCopierAdapter } from "@/lib/trade-copier-adapter";
import { FinancialDashboardResponse } from "@/types/dashboard";
import Link from "next/link";
import { HistoryTable } from "./HistoryTable";
import { useSession } from "next-auth/react";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { PnLConversionCard } from "./PnLConversionCard";

const TradingDashboard = () => {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superadmin";

  const [data, setData] = useState<FinancialDashboardResponse | null>(null);
  const [hasAccounts, setHasAccounts] = useState(false);
  const [hasApprovedCopy, setHasApprovedCopy] = useState<boolean | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<string>("me");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [traderOptions, setTraderOptions] = useState([{ value: "me", label: "Cargando Traders..." }]);
  
  // 1. Initial Load: Fetch Accounts and determining primary active account
  useEffect(() => {
    const fetchAccs = async () => {
      try {
        let tcAccounts: any[] = [];

        if (session?.user?.role === "user") {
          // 1. Fetch Approved Copy Relations for standard users
          const copyRes = await tradeCopierService.getCopyRequests();
          const approved = copyRes.requests?.some((r: any) => r.status === "APPROVED");
          setHasApprovedCopy(!!approved);

          // 2. Users: check local DB only — they don't have external credentials
          const localRes = await tradeCopierService.getAccountsLocal();
          tcAccounts = localRes.data?.accounts || [];
        } else {
          // Traders/SuperAdmins: fetch from external API
          setHasApprovedCopy(true); // Always true for Traders/Admins
          const payload: any = {};
          if (selectedTrader !== "all" && selectedTrader !== "me") {
             payload.targetUserId = selectedTrader;
          }
          const tcAccountsRes = await tradeCopierService.getAccounts(payload);
          tcAccounts = tcAccountsRes.data?.accounts || [];
        }

        if (tcAccounts.length > 0) {
          setAccountsList(tcAccounts);
          setHasAccounts(true);

          if (!selectedAccount) {
            // INIT LOGIC: Find Master, Sort by Last Update Descending
            const masters = tcAccounts.filter((a: any) => Number(a.type) === 0);
            if (masters.length > 0) {
              const sortedMasters = [...masters].sort(
                (a, b) =>
                  new Date(b.lastUpdate || 0).getTime() -
                  new Date(a.lastUpdate || 0).getTime(),
              );
              setSelectedAccount(sortedMasters[0].account_id);
            } else {
              setSelectedAccount(tcAccounts[0].account_id);
            }
          }
        } else {
           // If a specific trader has no accounts, empty the state but don't mark as globally "has no accounts" unless it's "me" and empty
          setAccountsList([]);
          if (selectedTrader === "me" || selectedTrader === "all") {
             setHasAccounts(false);
          }
          setSelectedAccount("");
          setLoading(false); // Stop loading skeleton — show empty state
        }
      } catch (err) {
        console.error("Error al obtener cuentas:", err);
        setHasAccounts(false);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccs();
  }, [selectedTrader, session?.user?.role]);

  // Handle Dynamic Traders
  useEffect(() => {
    if (!isSuperAdmin) return;
    const loadTraders = async () => {
      try {
        const res = await fetch("/api/v1/traders");
        if (res.ok) {
           const data = await res.json();
           const opts = [
             { value: "me", label: "Mis Cuentas" },
             ...data.traders.map((t: any) => ({
               value: t.id,
               label: `Trader: ${t.name || t.email}`
             }))
           ];
           setTraderOptions(opts);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadTraders();
  }, [isSuperAdmin]);

  // 2. Fetch specific account data when selected account changes
  useEffect(() => {
    if (!selectedAccount || loadingAccounts) return;

    const fetchActData = async () => {
      setLoading(true);
      try {
        // Find the selected account from the list for real-time data
        const currentAcc = accountsList.find(
          (a) => a.account_id === selectedAccount,
        );

        if (selectedAccount !== "all_accounts") {
           if (currentAcc) {
             // Create empty financial with real account data already merged
             setData(tradeCopierAdapter.createEmptyFinancial(currentAcc));
           }
        } else if (data === null) {
           // Initialize with a generic empty data for "all_accounts" if no data is present yet
           const genericAcc = { name: "Todas las Cuentas", type: 0, balance: 0, equity: 0, ccy: "USD" };
           setData(tradeCopierAdapter.createEmptyFinancial(genericAcc));
        }

        const basePayload: any = {};
        if (selectedTrader !== "all" && selectedTrader !== "me") {
           basePayload.targetUserId = selectedTrader;
        }

        if (selectedAccount === "all_accounts") {
           basePayload.global = true;
        } else {
           basePayload.account_id = selectedAccount;
        }

        const [reportRes, historyRes] = await Promise.all([
          tradeCopierService.getReporting(basePayload),
          tradeCopierService.getPositionsClosed(basePayload),
        ]);

        let closedPositions: any[] = [];

        if (
          historyRes.status === "success" &&
          historyRes.data?.closedPositions
        ) {
          closedPositions = historyRes.data.closedPositions;
          setHistory(closedPositions);
        }

        if (selectedAccount === "all_accounts") {
          const reports = reportRes.status === "success" && reportRes.data?.reporting ? reportRes.data.reporting : [];
          const dFrom = reportRes?.data?.meta?.day_from || "N/A";
          const dTo = reportRes?.data?.meta?.day_to || "N/A";

          const globalData = tradeCopierAdapter.aggregatePortfolio(
            accountsList,
            reports,
            closedPositions,
            dFrom,
            dTo
          );
          setData(globalData);
        } else {
          // single account logic
          if (
            reportRes.status === "success" &&
            reportRes.data?.reporting?.length > 0
          ) {
            // Find the exact report for the selected account, fallback to [0] just in case
            const myReport = reportRes.data.reporting.find(
              (r: any) => r.account_id === selectedAccount
            ) || reportRes.data.reporting[0];

            // Build financial from reporting data
            let financial = tradeCopierAdapter.toFinancial(myReport);

            // Extract meta range
            if (reportRes.data.meta) {
              financial.meta.day_from = reportRes.data.meta.day_from || "N/A";
              financial.meta.day_to = reportRes.data.meta.day_to || "N/A";
            }

            // Merge real-time account data
            if (currentAcc) {
              financial = tradeCopierAdapter.mergeAccountData(financial, currentAcc);
            }

            // Compute trade stats from closed positions
            financial.trade_stats = tradeCopierAdapter.computeTradeStatsFromHistory(closedPositions);
            financial.summary.total_trades = {
              won: financial.trade_stats.won_trades,
              lost: financial.trade_stats.lost_trades,
              total: financial.trade_stats.total_trades,
            };

            setData(financial);
          } else if (currentAcc) {
            // No reporting data but we have account data — show what we can
            const fallback = tradeCopierAdapter.createEmptyFinancial(currentAcc);
            fallback.trade_stats = tradeCopierAdapter.computeTradeStatsFromHistory(closedPositions);
            fallback.summary.total_trades = {
              won: fallback.trade_stats.won_trades,
              lost: fallback.trade_stats.lost_trades,
              total: fallback.trade_stats.total_trades,
            };
            setData(fallback);
          }
        }
      } catch (err) {
        console.error("Fetch Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActData();
  }, [selectedAccount, loadingAccounts, selectedTrader, accountsList]);

  const filteredAccountsForDropdown = accountsList;

  const accountOptions = useMemo(() => {
    const opts = filteredAccountsForDropdown.map((a) => ({
      value: a.account_id,
      label: `${a.name} (${Number(a.type) === 0 ? "MASTER" : "SLAVE"})`,
    }));
    
    // Add 'all' option if multiple accounts exist for this context
    if (opts.length > 0) {
      opts.unshift({ value: "all_accounts", label: "Todas las cuentas" });
    }
    
    return opts;
  }, [filteredAccountsForDropdown]);

  const handleTraderChange = (traderVal: string) => {
    setSelectedTrader(traderVal);
    setSelectedAccount(""); // specific accounts depend on trader, wipe it directly
    // This triggers the useEffect that sets accounts and selects the first one optionally
  };

  // ... rest of the useMemo and handlers ...
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      window.location.reload();
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-foreground max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="h-10 w-64 bg-slate-200 dark:bg-primary/10 rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 w-48 bg-slate-100 dark:bg-primary/5 rounded-md animate-pulse"></div>
          </div>
          <div className="h-12 w-[180px] bg-slate-100 dark:bg-primary/5 border border-border rounded-xl animate-pulse"></div>
        </div>

        {/* Top 5 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 mt-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[180px] w-full bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"
            ></div>
          ))}
        </div>

        {/* Main Body Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Stats & Returns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="h-[220px] w-full bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"></div>
            <div className="h-[260px] w-full bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"></div>
            <div className="h-[300px] w-full bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"></div>
          </div>

          {/* Right Column (Audit & Tables) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="h-[340px] w-full bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"></div>
            <div className="h-[500px] w-full bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-foreground">
      {hasAccounts && hasApprovedCopy && data ? (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Resumen <span className="text-primary">Financiero</span>
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${data.account_info.state === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  Última Sync:{" "}
                  {data.meta.last_sync
                    ? new Date(data.meta.last_sync).toLocaleString("es-ES")
                    : "Pendiente"}
                </span>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-secondary/50 flex items-center gap-1.5 border border-transparent hover:border-border ${isSyncing ? "animate-pulse" : ""}`}
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
            <div className="flex items-center gap-3 flex-wrap relative z-30">
              <div className="flex items-center gap-1 glass-widget rounded-[1.25rem] py-1.5 px-2 pb-2.5 border border-border bg-background/40 backdrop-blur-md shadow-sm">
                <div className={`w-2 h-2 rounded-full ml-2 mr-1 shrink-0 ${data.account_info.state === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>

                {isSuperAdmin && accountsList.length > 0 && (
                  <div className="flex items-center">
                    <div className="">
                      <ModernSelect
                        value={selectedTrader}
                        onChange={(val) => handleTraderChange(val as string)}
                        options={traderOptions}
                        className="bg-transparent border-none hover:bg-white/5 h-10 w-full !min-h-0 text-sm font-medium outline-none rounded-xl focus:ring-0 px-2"
                      />
                    </div>
                    <div className="w-px h-6 bg-border/50 mx-1.5"></div>
                  </div>
                )}

                {accountsList.length > 0 && (
                  <div className="w-[260px]">
                    <ModernSelect
                      value={selectedAccount}
                      onChange={(val) => setSelectedAccount(val as string)}
                      options={accountOptions}
                      className="bg-transparent border-none hover:bg-white/5 h-10 w-full !min-h-0 text-sm font-bold outline-none rounded-xl focus:ring-0 px-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ TOP ROW: 5 Cards with REAL data ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* 1. Account Status — balance, equity, state, open trades */}
            <AccountStatusCard
              name={data.account_info.name}
              balance={data.account_info.balance}
              equity={data.account_info.equity}
              freeMargin={data.account_info.free_margin}
              openTrades={data.account_info.open_trades}
              state={data.account_info.state}
              currency={data.meta.currency}
            />

            {/* 2. PnL del periodo — from reporting (pnlUSD) */}
            <MetricCard
              title="Ganancia/Pérdida"
              value={data.summary.performance.pnl}
              label={data.meta.currency}
              max={Math.abs(data.summary.performance.pnl) || 100}
              delay="0.1s"
            />

            {/* 3. Performance % — from reporting (performance) */}
            <MetricCard
              title="Performance"
              value={`${data.summary.performance.performance_percent >= 0 ? "+" : ""}${data.summary.performance.performance_percent.toFixed(2)}%`}
              label="Rendimiento del Periodo"
              delay="0.2s"
            />

            {/* 4. Equity vs Balance gauge — derived from account data */}
            <GaugeCard
              label="Equity / Balance"
              value={data.account_info.equity}
              max={data.account_info.balance > 0 ? data.account_info.balance : 1}
              color={data.account_info.equity >= data.account_info.balance ? "#10b981" : "#ef4444"}
              delay="0.3s"
            />

            {/* 5. Free Margin gauge — from account data */}
            <GaugeCard
              label="Margen Libre"
              value={data.account_info.free_margin}
              max={data.account_info.equity > 0 ? data.account_info.equity : 1}
              color="#3b82f6"
              delay="0.4s"
            />
          </div>

          {/* ═══ MAIN BODY ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
              {/* PnL Summary — uses real reporting data */}
              <PnLSummary
                gains={{
                  percent: data.technical_stats.performance_percent,
                  absolute: data.summary.performance.pnl,
                }}
                netPnL={data.summary.performance.pnl}
                delay="0.5s"
              />

              {/* Currency PnL Conversion — New widget replacement */}
              <PnLConversionCard
                pnlUSD={data.technical_stats.pnl_usd}
                pnlEUR={data.technical_stats.pnl_eur}
                delay="0.6s"
              />

              {/* Trade Stats — computed from closedPositions */}
              <TradeStats
                tradeStats={data.trade_stats}
                risk={{
                  current_equity: data.summary.risk.current_equity,
                  current_balance: data.summary.risk.current_balance,
                  highest_balance: data.summary.risk.highest_balance,
                }}
                delay="0.7s"
              />

              {/* Capital Flows — deposit_withdrawal from reporting */}
              <CapitalFlows
                depositWithdrawal={data.capital_flows.deposit_withdrawal}
                currency={data.meta.currency}
                delay="0.8s"
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-8 space-y-8 flex flex-col h-full">
              {/* Equity Evolution — Relocated for better visibility */}
              <EquityEvolution
                equityStart={data.technical_stats.equity_start}
                equityEnd={data.technical_stats.equity_end}
                hwm={data.technical_stats.hwm}
                currency={data.meta.currency}
                delay="0.9s"
              />

              {/* History Table — ✅ Works when there are closed positions */}
              <HistoryTable positions={history} className="flex-1" />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 relative overflow-hidden animate-fade-in-up">
          {/* Decorative Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-breathe" />

          <div className="glass-widget widget-hover relative p-10 md:p-14 flex flex-col items-center justify-center text-center space-y-8 max-w-xl overflow-hidden group">
            {/* Animated border glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-breathe" />
              <div className="relative w-28 h-28 neumorphic-outset rounded-full flex items-center justify-center">
                <Share2 className="w-12 h-12 text-primary" />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-2 border border-border shadow-lg mt-auto">
                  <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Conditional messaging based on whether they have accounts or just waiting for approval */}
            {session?.user?.role === "user" ? (
              !hasAccounts ? (
                /* START COPYING STATE (No accounts linked yet) */
                <div className="space-y-5 relative z-10 flex flex-col items-center stat-fade-in">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Bienvenido a IT Trade
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Empieza a Copiar
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-[90%] mx-auto">
                    Registra tu cuenta de broker en el módulo de{" "}
                    <strong className="text-foreground">Cuentas</strong> y
                    explora nuestro{" "}
                    <strong className="text-foreground">
                      Directorio de Traders
                    </strong>{" "}
                    para empezar a copiar estrategias profesionales en tiempo
                    real.
                  </p>

                  <div className="w-full pt-4 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/dashboard/copy-trader/accounts"
                      className="neumorphic-button group/btn flex-1 flex items-center justify-center gap-3 text-foreground py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300"
                    >
                      <Wallet className="w-5 h-5" />
                      Registrar Cuenta
                    </Link>
                    <Link
                      href="/dashboard/copy-trader/traders"
                      className="group/btn flex-1 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <PlusCircle className="w-5 h-5 transition-transform group-hover/btn:rotate-90" />
                      Explorar Traders
                    </Link>
                  </div>
                </div>
              ) : (
                /* WAITING FOR APPROVAL STATE (Has account but no approved copy request) */
                <div className="space-y-5 relative z-10 flex flex-col items-center stat-fade-in">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Pendiente de Aprobación
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Sincronización en Proceso
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-[90%] mx-auto">
                    Has vinculado tu cuenta correctamente, pero{" "}
                    <strong className="text-foreground">
                      la relación de copia aún no ha sido aprobada
                    </strong>.
                    Estamos preparando el entorno. Se habilitarán los reportes
                    tan pronto como se active la copia.
                  </p>
                  <div className="w-full pt-4">
                    <div className="glass-widget-darker flex items-center justify-center gap-3 text-amber-400 py-4 px-6 font-bold text-base">
                      <RefreshCw className="w-5 h-5 animate-spin-slow" />
                      Esperando Aprobación de Copia
                    </div>
                  </div>
                </div>
              )
            ) : session?.user?.role === "trader" ? (
              <div className="space-y-5 relative z-10 flex flex-col items-center stat-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Pendiente de Activación
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Portafolio en Espera
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[90%] mx-auto">
                  Tus cuentas aún no han sido configuradas en el ecosistema.
                  Se{" "}
                  <strong className="text-foreground">
                    notificará a la administración
                  </strong>{" "}
                  para activar tu portafolio y habilitar la visualización de
                  rendimiento.
                </p>
                <div className="w-full pt-4">
                  <div className="glass-widget-darker flex items-center justify-center gap-3 text-amber-400 py-4 px-6 font-bold text-base">
                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                    Esperando Configuración Administrativa
                  </div>
                </div>
              </div>
            ) : (
              /* superadmin — original CTA */
              <div className="space-y-5 relative z-10 flex flex-col items-center stat-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operaciones Sincronizadas
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Automatiza tu Cuenta
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[90%] mx-auto">
                  Únete a la red institucional de{" "}
                  <strong className="text-foreground">
                    Operaciones Compartidas
                  </strong>
                  . Sincroniza y vincula tu cuenta con nuestros servidores para
                  empezar a recibir operaciones y visualizar todo tu rendimiento
                  en tiempo real.
                </p>
                <div className="w-full pt-4">
                  <Link
                    href="/dashboard/configuracion"
                    className="group/btn w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PlusCircle className="w-6 h-6 transition-transform group-hover/btn:rotate-90" />
                    Vincular Cuenta al Servidor
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TradingDashboard;
