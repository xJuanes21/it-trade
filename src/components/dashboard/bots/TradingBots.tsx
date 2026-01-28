"use client";

import React, { useEffect, useMemo, useState } from "react";
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

  const isSuperAdmin = userRole === "superadmin";

  const fetchBots = async () => {
    try {
      setLoading(true);

      let data: EaConfig[];

      if (isSuperAdmin) {
        // Super admin ve todos los bots
        data = await eaService.getConfigs();
      } else {
        // Usuario normal solo ve sus bots asignados
        data = await botAssignmentService.getUserBotAssignments(userId);
      }

      setBots(data);

      // Fetch status and JSON config for each bot to show "Live" data and operational state
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
        console.error("Failed to load bulk JSON configs", e);
      }

      await Promise.all(
        data.map(async (bot) => {
          // Status call (balances, trades, etc)
          try {
            const status = await eaService.getEaStatus(bot.magic_number);
            statuses[bot.magic_number] = status;
          } catch (e) {
            console.error("Failed to load status for", bot.magic_number);
          }

          // Fill defaults if missing from bulk fetch
          if (!configs[bot.magic_number]) {
            configs[bot.magic_number] = {
              lotaje: bot.lot_size,
              pause: false,
              stop: !bot.enabled, // Fallback to bot config enabled field
              magic_number: bot.magic_number,
            };
          }
        }),
      );

      // Map and filter: Only keep bots that exist in the MT5 JSON configs
      const filteredData = data.filter((bot) => configs[bot.magic_number]);

      setBots(filteredData);
      setBotStatuses(statuses);
      setBotConfigs(configs);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar bots");
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
    setBotConfigs((prev) => ({ ...prev, ...configs }));
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

  const handleStart = async (bot: EaConfig) => {
    try {
      // 1. Persistence: Sync JSON state (stop: false)
      // We do this first or ensure it happens to fix the transition error reported
      await eaService.updateJsonConfig(bot.magic_number, { stop: false });

      // 2. Operation: Start Instance
      try {
        await eaService.startEa(bot.magic_number);
      } catch (opError) {
        console.warn(
          "Instance control (start) might be redundant or pending:",
          opError,
        );
        // We continue if persistence succeeded
      }

      toast.success("Bot iniciado", {
        description: "El EA ha sido activado y persistido en MT5",
      });
      await fetchBots();
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar el bot");
    }
  };

  const handleStop = async (bot: EaConfig) => {
    try {
      // 1. Operation: Stop Instance
      await eaService.stopEa(bot.magic_number);
      // 2. Persistence: Sync JSON state (stop: true)
      await eaService.updateJsonConfig(bot.magic_number, { stop: true });

      toast.success("Bot detenido", {
        description: "El bot se ha detenido, cerrado operaciones y persistido",
      });
      await fetchBots();
    } catch (error) {
      console.error(error);
      toast.error("Error al detener el bot");
    }
  };

  const handlePause = async (bot: EaConfig) => {
    try {
      await eaService.pauseEa(bot.magic_number);
      toast.success("Bot pausado", {
        description: "Se ha enviado la señal de pausa al MT5",
      });
      await fetchBots();
    } catch (error) {
      toast.error("Error al pausar el bot");
    }
  };

  const handleResume = async (bot: EaConfig) => {
    try {
      await eaService.resumeEa(bot.magic_number);
      toast.success("Bot reanudado", {
        description: "El bot continuará operando",
      });
      await fetchBots();
    } catch (error) {
      toast.error("Error al reanudar el bot");
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

      <div className="max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Bots</h1>
            <p className="text-muted-foreground text-sm">
              {isSuperAdmin
                ? "Gestiona tus estrategias automatizadas"
                : "Visualiza tus bots asignados"}
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
                <span className="hidden sm:inline">Nuevo Bot</span>
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
                placeholder="Buscar bots por nombre, símbolo..."
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
                  No tienes bots configurados
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu primer bot para empezar a operar automáticamente.
                </p>
                <button
                  onClick={handleCreate}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all"
                >
                  Crear mi primer Bot
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Sin Bots Asignados</h3>
                <p className="text-muted-foreground mb-2">
                  Aún no se te ha asignado ningún bot de trading.
                </p>
                <p className="text-muted-foreground">
                  Por favor, contacta con el administrador para que te asigne un
                  bot.
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
                        <div className="flex gap-2 mt-1">
                          <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/20">
                            {bot.symbol}
                          </span>
                          <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/20">
                            {bot.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusColor(!botConfigs[bot.magic_number]?.stop)}`}
                      >
                        {botConfigs[bot.magic_number]?.stop
                          ? "Detenido"
                          : "Iniciado"}
                      </span>
                      {!botConfigs[bot.magic_number]?.stop &&
                        botConfigs[bot.magic_number]?.pause && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full font-bold">
                            PAUSADO
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 bg-secondary/30 p-4 rounded-xl relative overflow-hidden">
                    {/* Blinking Live Indicator */}
                    {bot.enabled && (
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
                        Lot Size
                      </p>
                      <p className="text-foreground text-sm font-bold">
                        {bot.lot_size}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {!botConfigs[bot.magic_number]?.stop ? (
                        <button
                          onClick={() => handleStop(bot)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStart(bot)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(bot)}
                        className="bg-secondary hover:bg-secondary/80 text-foreground p-2 rounded-xl border border-border"
                      >
                        <SettingsIcon size={20} />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePause(bot)}
                        disabled={
                          botConfigs[bot.magic_number]?.stop ||
                          botConfigs[bot.magic_number]?.pause
                        }
                        className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Pause size={16} />
                        Pausar
                      </button>
                      <button
                        onClick={() => handleResume(bot)}
                        disabled={
                          botConfigs[bot.magic_number]?.stop ||
                          !botConfigs[bot.magic_number]?.pause
                        }
                        className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Play size={16} />
                        Reanudar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
