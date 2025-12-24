import { TrendingUp, TrendingDown, Zap, Eye, BarChart3, type LucideIcon } from "lucide-react";
import React from "react";

export type LucideIconType = LucideIcon;

export type StatCard = {
  label: string;
  value: string;
  change?: string;
  subtitle?: string;
  trend?: "up" | "down";
  warning?: boolean;
  icon: LucideIconType;
};

export const statsData: StatCard[] = [
  {
    label: "Balance Total",
    value: "$22,703.17",
    change: "+5.88%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Win Rate",
    value: "68.5%",
    subtitle: "24/35 operaciones",
    icon: BarChart3,
  },
  {
    label: "Bots Activos",
    value: "3/4",
    subtitle: "1 pausado",
    warning: true,
    icon: Zap,
  },
];

export const balanceData = {
  usd: { amount: 73315.47, percent: 61.81, label: "USD" },
  usdt: { amount: 45200.0, percent: 38.19, label: "USDT" },
};

export type ActivityItem = {
  coin: string;
  action: "Buy" | "Sell";
  price: number;
  color: string;
};

export const activityData: ActivityItem[] = [
  { coin: "BTC", action: "Sell", price: 245, color: "#F7931A" },
  { coin: "ETH", action: "Buy", price: 245, color: "#627EEA" },
  { coin: "USDT", action: "Sell", price: 245, color: "#26A17B" },
  { coin: "SOL", action: "Buy", price: 245, color: "#14F195" },
  { coin: "BTC", action: "Buy", price: 245, color: "#F7931A" },
  { coin: "USDT", action: "Sell", price: 245, color: "#26A17B" },
  { coin: "SOL", action: "Buy", price: 245, color: "#14F195" },
  { coin: "BTC", action: "Buy", price: 245, color: "#F7931A" },
];

export const timeframeOptions = ["12 months", "3 months", "30 days", "7 days", "24 hours"] as const;

export const donutData = {
  labels: ["Futuros", "Spot", "Bots", "Staking"],
  values: [30, 25, 25, 20],
  colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
};

export const areaSeries = [
  { label: "Series 1", color: "#3b82f6", values: [30, 40, 35, 50, 49, 60] },
  { label: "Series 2", color: "#ef4444", values: [20, 30, 25, 40, 39, 50] },
  { label: "Series 3", color: "#10b981", values: [10, 20, 15, 30, 29, 40] },
];

export const tradingPairSummary = {
  pair: "BTC/USD",
  leverage: "5x",
  timeframe: "1m",
};

export const balanceMeta = {
  total: "$118,515.47",
  subtitle: "Equivalente total en USD",
  icon: Eye,
};
