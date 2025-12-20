"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Zap,
  Settings as SettingsIcon,
  Pause,
  Play,
  BarChart3,
  Filter,
  Grid3x3,
  List,
} from "lucide-react";

// Types
type Trend = "up" | "down";

type BotStatus = "active" | "paused";

interface BotItem {
  id: number;
  name: string;
  strategy: string;
  exchange: string; // Using as risk label to match MVP
  status: BotStatus;
  statusLabel: string;
  badges: string[];
  gananciaTotal: number;
  winRate: number;
  operaciones: number;
  rendimiento: number[]; // percentage heights 0..100
  color: "blue" | "purple";
}

interface StatCard {
  label: string;
  value: string;
  change?: string;
  subtitle?: string;
  trend?: Trend;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const botsData: BotItem[] = [
  {
    id: 1,
    name: "Scalper Pro Elite",
    strategy: "Scalping",
    exchange: "Medium Risk",
    status: "active",
    statusLabel: "Activo",
    badges: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
    gananciaTotal: 12245.5,
    winRate: 72.5,
    operaciones: 1284,
    rendimiento: [40, 45, 60, 55, 70, 85, 75],
    color: "blue",
  },
  {
    id: 2,
    name: "Trend Master AI",
    strategy: "Trend Following",
    exchange: "Low Risk",
    status: "active",
    statusLabel: "Activo",
    badges: ["BTCUSDT", "ETHUSDT"],
    gananciaTotal: 18892.3,
    winRate: 78.3,
    operaciones: 456,
    rendimiento: [50, 55, 65, 75, 70, 85, 90],
    color: "blue",
  },
  {
    id: 3,
    name: "Grid Bot Ultra",
    strategy: "Grid Trading",
    exchange: "High Risk",
    status: "paused",
    statusLabel: "Pausado",
    badges: ["BNBUSDT", "ADAUSDT"],
    gananciaTotal: 6456.8,
    winRate: 65.8,
    operaciones: 2341,
    rendimiento: [60, 50, 55, 70, 65, 55, 45],
    color: "purple",
  },
];

const statsCards: StatCard[] = [
  { label: "Ganancia Total", value: "$83,153.3", change: "+2% hoy", trend: "up", icon: TrendingUp },
  { label: "Win Rate Promedio", value: "74.0%", subtitle: "en 18,107 operaciones", icon: BarChart3 },
  { label: "Bots Activos", value: "5/6", subtitle: "1 pausado(s)", icon: Zap },
  { label: "Ganancia Mensual", value: "$54,862.2", change: "+8.5% del total", trend: "up", icon: TrendingUp },
];

export default function TradingBots() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | BotStatus>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const bots = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = botsData.filter((b) =>
      [b.name, b.strategy, b.exchange, ...b.badges].some((v) => v.toLowerCase().includes(term))
    );
    if (filterActive !== "all") filtered = filtered.filter((b) => b.status === filterActive);
    return filtered;
  }, [searchTerm, filterActive]);

  const getStatusColor = (status: BotStatus) =>
    status === "active"
      ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
      : "bg-orange-500/20 text-orange-500 border-orange-500/30";

  const getStatusButton = (status: BotStatus) =>
    status === "active"
      ? { icon: Pause, label: "Pausar", color: "bg-amber-500 hover:bg-amber-600" }
      : { icon: Play, label: "Activar", color: "bg-green-500 hover:bg-green-600" };

  const StatIcon = ({ Icon, trend }: { Icon: StatCard["icon"]; trend?: Trend }) => (
    <Icon size={20} className={trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-blue-400"} />
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-start justify-between mb-3">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <StatIcon Icon={stat.icon} trend={stat.trend} />
              </div>
              <p className="text-foreground text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
              {stat.change && (
                <p className={`text-sm ${stat.trend === "up" ? "text-green-400" : "text-muted-foreground"}`}>{stat.change}</p>
              )}
              {stat.subtitle && <p className="text-sm text-muted-foreground">{stat.subtitle}</p>}
            </div>
          ))}
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Buscar bots por nombre o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary text-foreground pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <button
                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
                  filterActive === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
                onClick={() => setFilterActive("all")}
              >
                Todos
              </button>
              <button
                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
                  filterActive === "active"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
                onClick={() => setFilterActive("active")}
              >
                Activos
              </button>
              <button
                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
                  filterActive === "paused"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
                onClick={() => setFilterActive("paused")}
              >
                Pausados
              </button>
              <button
                className={`p-3 rounded-xl transition-all ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-background text-muted-foreground border border-border"}`}
                onClick={() => setView("grid")}
                aria-label="Vista grid"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                className={`p-3 rounded-xl transition-all ${view === "list" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-background text-muted-foreground border border-border"}`}
                onClick={() => setView("list")}
                aria-label="Vista lista"
              >
                <List size={20} />
              </button>
              <button className="bg-secondary hover:bg-background text-muted-foreground p-3 rounded-xl transition-all border border-border" aria-label="Filtros">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Bots Grid */}
        <div className={view === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {bots.map((bot) => {
            const statusBtn = getStatusButton(bot.status);
            const StatusIcon = statusBtn.icon;

            return (
              <div
                key={bot.id}
                className="bg-card rounded-3xl p-6 border border-border hover:border-ring/40 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center">
                      <Zap size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold text-lg">{bot.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/30">
                          {bot.strategy}
                        </span>
                        <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/30">
                          {bot.exchange}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusColor(bot.status)}`}>
                    {bot.statusLabel}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  {bot.badges.map((badge, index) => (
                    <span key={index} className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-lg border border-blue-500/20">
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Ganancia Total</p>
                    <p className="text-green-400 text-lg font-bold">${bot.gananciaTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Win Rate</p>
                    <p className="text-foreground text-lg font-bold">{bot.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Operaciones</p>
                    <p className="text-foreground text-lg font-bold">{bot.operaciones.toLocaleString()}</p>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="mb-4">
                  <p className="text-muted-foreground text-xs mb-2">Rendimiento 7D</p>
                  <div className="flex items-end gap-1 h-16">
                    {bot.rendimiento.map((value, index) => (
                      <div key={index} className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-400" style={{ height: `${value}%` }} />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-blue-500/20">
                    <SettingsIcon size={18} />
                    Configurar
                  </button>
                  <button className={`flex-1 ${statusBtn.color} text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg`}>
                    <StatusIcon size={18} />
                    {statusBtn.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
