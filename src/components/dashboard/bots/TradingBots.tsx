"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  Zap,
  Settings as SettingsIcon,
  Pause,
  Play,
  BarChart3,
  Filter,
  Grid3x3,
  List,
  Plus,
  Server,
  Loader2,
  RefreshCw,
  BotOff,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { eaService } from "@/services/ea.service";
import { botAssignmentService } from "@/services/bot-assignment.service";
import { EaConfig, EaJsonConfig, EaStatus } from "@/types/ea";
import BotConfigModal from "./BotConfigModal";
import BotActionModal from "./BotActionModal";
import TradingBotLoader from "./TradingBotLoader";

// Types
type Trend = "up" | "down";
type BotStatus = "active" | "paused";

interface StatCard {
  label: string;
  value: string;
  change?: string;
  subtitle?: string;
  trend?: Trend;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const statsCards: StatCard[] = [
  {
    label: "Ganancia Total",
    value: "$1,240.50",
    change: "+4.2% hoy",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Win Rate Promedio",
    value: "68.5%",
    subtitle: "en 24 operaciones",
    icon: BarChart3,
  },
  { label: "Bots Activos", value: "1/1", subtitle: "0 pausado(s)", icon: Zap },
  {
    label: "Ganancia Mensual",
    value: "$4,862.2",
    change: "+12.5% del total",
    trend: "up",
    icon: TrendingUp,
  },
];

interface TradingBotsProps {
  userRole: string;
  userId: string;
}

export default function TradingBots({ userRole, userId }: TradingBotsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | BotStatus>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [bots, setBots] = useState<EaConfig[]>([]);
  const [botStatuses, setBotStatuses] = useState<Record<number, EaStatus>>({});
  const [botConfigs, setBotConfigs] = useState<Record<number, EaJsonConfig>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<EaConfig | undefined>(
    undefined,
  );
  const [selectedBotForAction, setSelectedBotForAction] = useState<
    EaConfig | undefined
  >(undefined);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Loader UI State
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);
  const [loaderMode, setLoaderMode] = useState<"starting" | "stopping">(
    "starting",
  );

  const isSuperAdmin = userRole === "superadmin";

  const fetchBots = async () => {
    try {
      setLoading(true);

      // 1. Fetch Source of Truth: MT5 JSON Configs
      const jsonResponse = await eaService.getAllJsonConfigs();
      let mt5Configs: { magic_number: number; config: EaJsonConfig }[] = [];

      if (jsonResponse.success && jsonResponse.configs) {
        mt5Configs = jsonResponse.configs;
      }

      // 2. Filter for User Assignments (if not SuperAdmin)
      if (!isSuperAdmin) {
        try {
          const assignments =
            await botAssignmentService.getUserBotAssignments(userId);
          const assignedMagicNumbers = (
            assignments as { magic_number: number }[]
          ).map((a) => a.magic_number);
          mt5Configs = mt5Configs.filter((item) =>
            assignedMagicNumbers.includes(item.magic_number),
          );
        } catch (e) {
          console.error("Failed to load user assignments", e);
          mt5Configs = []; // Fail safe
        }
      }

      // 3. Map to UI Model (EaConfig) using placeholders for removed fields
      const mappedBots: EaConfig[] = mt5Configs.map((item) => ({
        ea_name: item.config.name || `Trader ${item.magic_number}`,
        magic_number: item.magic_number,
        lot_size: item.config.lotaje,
        enabled: !item.config.stop,
        symbol: "", // Hidden in UI
        timeframe: "", // Hidden in UI
        stop_loss: 0,
        take_profit: 0,
        max_trades: 0,
        trading_hours_start: 0,
        trading_hours_end: 0,
        risk_percent: 0,
      }));

      setBots(mappedBots);

      // 4. Retrieve Runtime Statuses
      const statuses: Record<number, EaStatus> = {};
      const configs: Record<number, EaJsonConfig> = {};

      mt5Configs.forEach((item) => {
        configs[item.magic_number] = item.config;
      });

      await Promise.all(
        mappedBots.map(async (bot) => {
          try {
            const status = await eaService.getEaStatus(bot.magic_number);
            statuses[bot.magic_number] = status;
          } catch (e) {
            console.error("Failed to load status for", bot.magic_number);
          }
        }),
      );

      setBotStatuses(statuses);
      setBotConfigs(configs);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar traders");
    } finally {
      setLoading(false);
    }
  };

  const refreshStatusOnly = async () => {
    const statuses: Record<number, EaStatus> = {};
    const configs: Record<number, EaJsonConfig> = {};

    try {
      const jsonResponse = await eaService.getAllJsonConfigs();
      if (jsonResponse.success && jsonResponse.configs) {
        jsonResponse.configs.forEach((item) => {
          configs[item.magic_number] = item.config;
        });
      }
    } catch (e) {
      console.error("Failed to refresh bulk JSON configs", e);
    }

    // Filter currently loaded bots to ensure they still exist in the backend configs
    const stillExistingBots = bots.filter((bot) => configs[bot.magic_number]);
    if (stillExistingBots.length !== bots.length) {
      setBots(stillExistingBots);
    }

    await Promise.all(
      stillExistingBots.map(async (bot) => {
        try {
          const status = await eaService.getEaStatus(bot.magic_number);
          statuses[bot.magic_number] = status;
        } catch (e) {
          console.error(e);
        }
      }),
    );

    setBotStatuses((prev) => ({ ...prev, ...statuses }));
    setBotConfigs(configs); // Refresh all configs from bulk
  };

  useEffect(() => {
    fetchBots();
  }, []);

  // Poll for updates every 5 minutes (300,000ms) or on demand
  useEffect(() => {
    const interval = setInterval(() => {
      if (bots.length > 0) refreshStatusOnly();
    }, 300000);
    return () => clearInterval(interval);
  }, [bots]);

  const handleStart = async (bot: EaConfig, lotajeOverride?: number) => {
    try {
      // Persistence: Sync JSON state (stop: false)
      await eaService.updateJsonConfig(bot.magic_number, {
        stop: false,
        lotaje: lotajeOverride ?? bot.lot_size,
      });

      setIsActionModalOpen(false);

      // Open Loader Animation
      setLoaderMode("starting");
      setIsLoaderOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("No pudimos iniciar tu trader. Intenta de nuevo.");
    }
  };

  const handleStop = async (bot: EaConfig) => {
    try {
      // Persistence: Sync JSON state (stop: true)
      await eaService.updateJsonConfig(bot.magic_number, { stop: true });

      setIsActionModalOpen(false);

      // Open Loader Animation
      setLoaderMode("stopping");
      setIsLoaderOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("No pudimos detener tu trader. Intenta de nuevo.");
    }
  };

  const handlePause = async (bot: EaConfig) => {
    try {
      await eaService.pauseEa(bot.magic_number);
      toast.success("Trader pausado");
      setTimeout(fetchBots, 2000);
    } catch (error) {
      toast.error("No pudimos pausar tu trader. Intenta de nuevo.");
    }
  };

  const handleResume = async (bot: EaConfig) => {
    try {
      await eaService.resumeEa(bot.magic_number);
      toast.success("Trader reanudado");
      setTimeout(fetchBots, 2000);
    } catch (error) {
      toast.error("No pudimos reanudar tu trader. Intenta de nuevo.");
    }
  };

  const handleEdit = (bot: EaConfig) => {
    setSelectedBot(bot);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBot(undefined);
    setIsModalOpen(true);
  };

  const handleOpenActions = (bot: EaConfig) => {
    setSelectedBotForAction(bot);
    setIsActionModalOpen(true);
  };

  const handleEditFromAction = (bot: EaConfig) => {
    setIsActionModalOpen(false); // Close action modal
    setSelectedBot(bot); // Set for config modal
    setIsModalOpen(true); // Open config modal
  };

  const handleUpdateLotaje = async (bot: EaConfig, lotaje: number) => {
    await eaService.updateJsonConfig(bot.magic_number, { lotaje });
    await fetchBots(); // Soft refresh to update local list
  };

  const handleLoaderComplete = () => {
    setIsLoaderOpen(false);
    fetchBots(); // Final refresh when animation ends
  };

  const filteredBots = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = bots.filter((b) =>
      [b.ea_name, b.symbol, b.timeframe].some((v) =>
        v.toLowerCase().includes(term),
      ),
    );
    if (filterActive !== "all") {
      const isEnabled = filterActive === "active";
      filtered = filtered.filter((b) => b.enabled === isEnabled);
    }
    return filtered;
  }, [searchTerm, filterActive, bots]);

  const getStatusColor = (enabled: boolean) =>
    enabled
      ? "bg-green-500/20 text-green-500 border-green-500/30"
      : "bg-orange-500/20 text-orange-500 border-orange-500/30";

  const StatIcon = ({
    Icon,
    trend,
  }: {
    Icon: StatCard["icon"];
    trend?: Trend;
  }) => (
    <Icon
      size={20}
      className={
        trend === "up"
          ? "text-green-400"
          : trend === "down"
            ? "text-red-400"
            : "text-blue-400"
      }
    />
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <BotConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBots}
        initialData={selectedBot}
      />

      <BotActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        bot={selectedBotForAction}
        config={
          selectedBotForAction
            ? botConfigs[selectedBotForAction.magic_number]
            : undefined
        }
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
        onResume={handleResume}
        onConfigure={handleEditFromAction}
        onUpdateLotaje={handleUpdateLotaje}
      />

      <TradingBotLoader
        isOpen={isLoaderOpen}
        mode={loaderMode}
        onComplete={handleLoaderComplete}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Traders</h1>
            <p className="text-muted-foreground text-sm">
              {isSuperAdmin
                ? "Gestiona tus estrategias automatizadas"
                : "Visualiza tus traders asignados"}
            </p>
          </div>
          {isSuperAdmin && (
            <div className="flex gap-2">
              <Link href="/dashboard/configuracion">
                <button className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl flex items-center gap-2 border border-border transition-all">
                  <Server size={18} />
                  <span className="hidden sm:inline">Conectar MT5</span>
                </button>
              </Link>
              <button
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuevo Trader</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-5 border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <StatIcon Icon={stat.icon} trend={stat.trend} />
              </div>
              <p className="text-foreground text-2xl md:text-3xl font-bold mb-1">
                {stat.value}
              </p>
              {stat.change && (
                <p
                  className={`text-sm ${stat.trend === "up" ? "text-green-400" : "text-muted-foreground"}`}
                >
                  {stat.change}
                </p>
              )}
              {stat.subtitle && (
                <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar traders por nombre, símbolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary text-foreground pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              {["all", "active", "paused"].map((filter) => (
                <button
                  key={filter}
                  className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                    filterActive === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                  onClick={() => setFilterActive(filter as BotStatus | "all")}
                >
                  {filter === "all"
                    ? "Todos"
                    : filter === "active"
                      ? "Activos"
                      : "Pausados"}
                </button>
              ))}

              <button
                className={`p-3 rounded-xl transition-all ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-background text-muted-foreground border border-border"}`}
                onClick={() => setView("grid")}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                className={`p-3 rounded-xl transition-all ${view === "list" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-background text-muted-foreground border border-border"}`}
                onClick={() => setView("list")}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBots.length === 0 && (
          <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
            <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BotOff className="text-muted-foreground" size={32} />
            </div>
            {isSuperAdmin ? (
              <>
                <h3 className="text-xl font-bold mb-2">
                  No tienes traders configurados
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu primer trader para empezar a operar automáticamente.
                </p>
                <button
                  onClick={handleCreate}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all"
                >
                  Crear mi primer Trader
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">
                  Sin Traders Asignados
                </h3>
                <p className="text-muted-foreground mb-2">
                  Aún no se te ha asignado ningún trader.
                </p>
                <p className="text-muted-foreground">
                  Por favor, contacta con el administrador para que te asigne un
                  trader.
                </p>
              </>
            )}
          </div>
        )}

        {/* Bots Grid */}
        {!loading && filteredBots.length > 0 && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredBots.map((bot) => {
              const statusData = botStatuses[bot.magic_number];

              return (
                <div
                  key={bot.magic_number}
                  className="bg-card rounded-3xl p-6 border border-border hover:border-ring/40 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Zap size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-foreground font-bold text-lg">
                          {bot.ea_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          ID: {bot.magic_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {botConfigs[bot.magic_number]?.stop ? (
                        <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full font-bold uppercase tracking-wider">
                          Detenido
                        </span>
                      ) : botConfigs[bot.magic_number]?.pause ? (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full font-bold uppercase tracking-wider">
                          PAUSADO
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-500 border border-green-500/30 rounded-full font-bold uppercase tracking-wider">
                          Iniciado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 bg-secondary/30 p-4 rounded-xl relative overflow-hidden">
                    {/* Blinking Live Indicator */}
                    {!botConfigs[bot.magic_number]?.stop &&
                      !botConfigs[bot.magic_number]?.pause && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="text-[10px] text-green-500 font-bold tracking-wider">
                            LIVE
                          </span>
                        </div>
                      )}

                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Trades
                      </p>
                      <p className="text-foreground text-sm font-bold">
                        {statusData ? statusData.active_trades : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Profit
                      </p>
                      <p
                        className={`text-sm font-bold ${statusData?.total_profit > 0 ? "text-green-400" : "text-foreground"}`}
                      >
                        {statusData ? `$${statusData.total_profit}` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Lotaje
                      </p>
                      <p className="text-foreground text-sm font-bold">
                        {bot.lot_size}
                      </p>
                    </div>
                  </div>

                  {/* Action Button (Gear Icon) - Opens Action Modal */}
                  {isSuperAdmin && (
                    <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
                      <button
                        onClick={() => handleOpenActions(bot)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <SettingsIcon size={20} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
