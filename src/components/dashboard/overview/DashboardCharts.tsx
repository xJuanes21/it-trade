"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import { Activity, TrendingUp, BarChart3 } from "lucide-react";

interface TradeCountChartProps {
  data: Array<{ time: string; count: number }>;
}

export const TradeCountChart = ({ data }: TradeCountChartProps) => (
  <div className="glass-widget widget-hover p-4 h-[280px] flex flex-col relative overflow-hidden">
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-[13px] font-semibold text-muted-foreground">
        Total Operaciones
      </h3>
      <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
        EN VIVO
      </span>
    </div>
    
    <div className="flex-1 w-full relative">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "var(--foreground)"
              }}
              itemStyle={{ color: "var(--foreground)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40">
           <Activity size={40} className="mb-2 text-primary/50" />
           <p className="text-[10px] uppercase font-black tracking-widest">Esperando Datos...</p>
        </div>
      )}
    </div>
  </div>
);

interface ProfitChartProps {
  data: Array<{ day: string; profit: number }>;
}

export const ProfitChart = ({ data }: ProfitChartProps) => {
  const totalProfit = data?.reduce((acc, curr) => acc + curr.profit, 0) || 0;
  const hasData = data && data.length > 0;

  return (
    <div className="glass-widget widget-hover p-4 h-[280px] flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[13px] font-semibold text-muted-foreground">
          Ganancia Diaria
        </h3>
        <span className="text-[18px] font-bold text-foreground">
          ${totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
      
      <div className="flex-1 w-full relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="profit" radius={[4, 4, 4, 4]}>
                {data.map((entry, index) => (
                  <Bar
                    key={`bar-${index}`}
                    fill={entry.profit >= 0 ? "#10b981" : "#f43f5e"}
                  />
                ))}
              </Bar>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--secondary)" }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "var(--foreground)"
                }}
                itemStyle={{ color: "var(--foreground)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40">
             <BarChart3 size={40} className="mb-2 text-emerald-500/50" />
             <p className="text-[10px] uppercase font-black tracking-widest">Sin Historial de PnL</p>
          </div>
        )}
      </div>
    </div>
  );
};
