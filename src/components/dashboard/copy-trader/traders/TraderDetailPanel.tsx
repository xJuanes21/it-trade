"use client";

import React from "react";
import { Activity, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "@/lib/copy-trader-types";
import { MetricCard } from "@/components/dashboard/finance-overview/MetricCards";
import { GaugeCard } from "@/components/dashboard/finance-overview/WinrateGauges";

interface TraderDetailPanelProps {
  selectedTrader: Account | null;
  traderData: any | null;
  isLoading: boolean;
  userRole: string;
  onClose: () => void;
  onCopy: () => void;
  isOpen: boolean;
  traderId: string; // Add this to handle impersonated fetches
}

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { tradeCopierService } from "@/services/trade-copier.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const TraderDetailPanel = ({
  selectedTrader,
  traderData,
  isLoading,
  userRole,
  onClose,
  onCopy,
  isOpen,
  traderId,
}: TraderDetailPanelProps) => {
  const chartColor = "#3b82f6";

  const [localAccounts, setLocalAccounts] = React.useState<Account[]>([]);
  const [traderManagedAccounts, setTraderManagedAccounts] = React.useState<Account[]>([]);
  const [isSyncingStats, setIsSyncingStats] = React.useState(false);
  const [showAccountSelector, setShowAccountSelector] = React.useState(false);

  // Check if user is already copying this trader
  const linkedAccount = React.useMemo(() => {
    return traderManagedAccounts.find(managed => 
      localAccounts.some(local => local.login === managed.login)
    );
  }, [localAccounts, traderManagedAccounts]);

  const isFollowing = !!linkedAccount;

  const fetchData = async () => {
    if (!isOpen || !traderId) return;
    
    setIsSyncingStats(true);
    try {
      // 1. Fetch user local accounts from Prisma
      const localRes = await tradeCopierService.getAccountsLocal();
      if (localRes.status === "success" && localRes.data?.accounts) {
        setLocalAccounts(localRes.data.accounts);
      }

      // 2. Fetch trader's accounts pool (impersonated)
      const traderRes = await tradeCopierService.getAccounts({ targetUserId: traderId });
      if (traderRes.status === "success" && traderRes.data?.accounts) {
        setTraderManagedAccounts(traderRes.data.accounts);
      }
    } catch (error) {
      console.error("Error fetching sync data:", error);
    } finally {
      setIsSyncingStats(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [isOpen, traderId]);

  const handleStopCopying = async () => {
    if (!linkedAccount) return;
    
    setIsSyncingStats(true);
    try {
      const res = await tradeCopierService.deleteAccount(linkedAccount.account_id || "", traderId);
      if (res.status === "success") {
        toast.success("Has dejado de copiar a este trader correctamente.");
        await fetchData(); // Refresh state
      } else {
        toast.error(res.message || "Error al dejar de copiar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSyncingStats(false);
    }
  };

  const handleStartCopying = async (localAccount: Account) => {
    setIsSyncingStats(true);
    setShowAccountSelector(false);
    try {
      // MANDAR SOLICITUD DE ASOCIACIÓN AL TRADER
      const res = await tradeCopierService.sendCopyRequest({
        slaveAccountId: localAccount.account_id || "",
        masterAccountId: selectedTrader?.account_id || "",
        traderId: traderId
      });

      if (res.status === "success") {
        toast.success(`Solicitud enviada al trader. Espera su aprobación para comenzar a copiar.`);
        await fetchData();
      } else {
        toast.error(res.message || "Error al enviar solicitud");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setIsSyncingStats(false);
    }
  };

  return (
    <div 
      className={cn(
        "absolute right-0 top-0 bottom-0 lg:static transition-all duration-1000 ease-in-out bg-background/98 backdrop-blur-3xl border border-border lg:rounded-3xl flex flex-col z-20 overflow-hidden shrink-0",
        isOpen ? "w-full lg:w-[60%] translate-x-0 opacity-100" : "w-0 translate-x-full lg:translate-x-0 opacity-0 pointer-events-none"
      )}
    >
      {selectedTrader && (
        <div className="flex flex-col h-full">
          {/* Compact Panel Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-foreground tracking-tight uppercase leading-none">{selectedTrader.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/80">{selectedTrader.broker}</span>
                  <div className="w-0.5 h-0.5 rounded-full bg-border" />
                  <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">{selectedTrader.server}</span>
                </div>
              </div>
            </div>
             <div className="flex items-center gap-4">
              {userRole === "user" && (
                 <button 
                  onClick={isFollowing ? handleStopCopying : () => setShowAccountSelector(true)}
                  disabled={isSyncingStats}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2",
                    isFollowing 
                      ? "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20"
                      : "bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border-primary/20"
                  )}
                >
                  {isSyncingStats ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {isFollowing ? "Dejar de Copiar" : "Copiar"}
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3 p-10">
                 <Activity className="w-6 h-6 text-primary animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando Portafolio...</p>
              </div>
            ) : traderData ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-700">
                
                {/* SECTION 1: PERFORMANCE CHART (Full Width) */}
                <div className="p-6 pb-0">
                   <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Crecimiento de Equity</p>
                         <h3 className="text-xl font-black tracking-tighter">Desempeño Institucional</h3>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Ganancia Neta (USD)</p>
                         <h4 className={cn(
                           "text-2xl font-black tracking-tighter",
                           (traderData.pnlUSD || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                         )}>
                           {(traderData.pnlUSD || 0) > 0 ? "+" : ""}{(traderData.pnlUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs">USD</span>
                         </h4>
                      </div>
                   </div>
                   
                   <div className="h-[220px] w-full mt-2 relative">
                      {(() => {
                        // Normalización de datos de la gráfica
                        const rawHistory = traderData.equity_history || traderData.history || traderData.pnl_history || [];
                        let currentEquity = traderData.equity_start || 0;
                        
                        const normalizedHistory = rawHistory.map((point: any) => {
                          // Si es historial de equity directo
                          if (point.equity !== undefined || point.value !== undefined) {
                            return {
                              date: point.date || point.time || "N/A",
                              equity: point.equity ?? point.value
                            };
                          }
                          // Si es historial de PnL, calculamos curva de equity acumulada
                          if (point.pnl !== undefined || point.profit !== undefined) {
                            currentEquity += (point.pnl ?? point.profit);
                            return {
                              date: point.date || point.time || "N/A",
                              equity: currentEquity
                            };
                          }
                          return null;
                        }).filter(Boolean);

                        if (normalizedHistory.length === 0) {
                          return (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-2xl border border-dashed border-border">
                              <p className="text-[10px] uppercase font-black tracking-widest opacity-40 text-center px-10">
                                Sin historial de rendimiento disponible para este periodo
                              </p>
                            </div>
                          );
                        }

                        return (
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={normalizedHistory}>
                                <defs>
                                   <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                                <XAxis 
                                  dataKey="date" 
                                  fontSize={9} 
                                  tickLine={false} 
                                  axisLine={false} 
                                  stroke="currentColor"
                                  strokeOpacity={0.3}
                                  tick={{ fontWeight: 800, fill: "currentColor", fillOpacity: 0.6 }}
                                />
                                <YAxis 
                                  domain={['auto', 'auto']}
                                  fontSize={9} 
                                  tickLine={false} 
                                  axisLine={false} 
                                  stroke="currentColor"
                                  strokeOpacity={0.3}
                                  tickFormatter={(val) => `$${val}`}
                                  tick={{ fontWeight: 800, fill: "currentColor", fillOpacity: 0.6 }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                  }}
                                  itemStyle={{ color: chartColor, fontWeight: 900, fontSize: '10px' }}
                                  labelStyle={{ color: 'var(--foreground)', fontWeight: 900, fontSize: '9px', marginBottom: '4px' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="equity" 
                                  stroke={chartColor} 
                                  strokeWidth={3}
                                  fillOpacity={1} 
                                  fill="url(#colorEquity)" 
                                />
                             </AreaChart>
                          </ResponsiveContainer>
                        );
                      })()}
                   </div>
                </div>

                <div className="h-px w-full bg-border mt-6" />

                {/* SECTION 2: COMPACT STATS GRID */}
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-4 glass-widget-darker widget-hover space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Balance Actual</p>
                      <p className="text-lg font-black tracking-tight">{traderData.equity_end || traderData.balance || selectedTrader.balance} <span className="text-[10px] opacity-40 uppercase">{selectedTrader.ccy}</span></p>
                   </div>
                   <div className="p-4 glass-widget-darker widget-hover space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Equity Final</p>
                      <p className="text-lg font-black tracking-tight">{traderData.equity_end || selectedTrader.equity}</p>
                   </div>
                   <div className="p-4 glass-widget-darker widget-hover space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Rendimiento</p>
                      <div className="flex items-center gap-1.5">
                         <span className={cn(
                           "text-lg font-black tracking-tight",
                           (traderData.performance || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                         )}>
                           {(traderData.performance || 0).toFixed(2)}%
                         </span>
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                   </div>
                   <div className="p-4 glass-widget-darker widget-hover space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tasa de Éxito</p>
                      <p className="text-lg font-black tracking-tight">{traderData.win_rate || traderData.winrate || 75}%</p>
                   </div>
                </div>

                {/* SECTION 3: TECHNICAL TABLE (Compact) */}
                <div className="px-6 flex-1">
                   <div className="glass-widget overflow-hidden shadow-lg dark:shadow-none">
                      <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-muted/30">
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resumen de Auditoría</p>
                         <p className="text-[10px] font-bold text-primary">Operativo</p>
                      </div>
                      <div className="divide-y divide-border">
                         <div className="px-5 py-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Pico Histórico (HWM)</span>
                            <span className="text-xs font-mono font-bold">${(traderData.hwm || 0).toLocaleString()}</span>
                         </div>
                         <div className="px-5 py-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Equity Inicial</span>
                            <span className="text-xs font-mono font-bold">${(traderData.equity_start || 0).toLocaleString()}</span>
                         </div>
                         <div className="px-5 py-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Depósitos / Retiros</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">${(traderData.deposit_withdrawal || 0).toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* SECTION 4: FOOTER ACTION */}
                {userRole === "user" && (
                  <div className="p-6 mt-auto">
                     <button 
                      onClick={isFollowing ? handleStopCopying : () => setShowAccountSelector(true)}
                      disabled={isSyncingStats}
                      className={cn(
                        "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-3 group",
                        isFollowing
                          ? "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 shadow-red-500/10"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      )}
                    >
                      {isSyncingStats ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      {isFollowing ? "Detener Estrategia" : "Copiar Estrategia"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                Portafolio Inaccesible
              </div>
            )}
          </div>

          {/* Account Selector Dialog */}
          {showAccountSelector && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="w-full max-w-sm glass-widget-darker p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">Seleccionar Cuenta</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    Selecciona una de tus cuentas locales para vincularla a este trader.
                  </p>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {localAccounts.length > 0 ? (
                    localAccounts.map(acc => (
                      <button
                        key={acc.account_id}
                        onClick={() => handleStartCopying(acc)}
                        className="w-full p-4 rounded-2xl glass-widget widget-hover flex items-center justify-between group"
                      >
                        <div className="text-left">
                          <p className="text-sm font-bold">{acc.name}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{acc.login} | {acc.server}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-primary/20 group-hover:bg-primary flex items-center justify-center transition-all">
                          <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center border border-dashed border-border rounded-2xl opacity-60">
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">
                        No tienes cuentas locales para vincular. Por favor, crea una en el módulo de Cuentas.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowAccountSelector(false)}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

