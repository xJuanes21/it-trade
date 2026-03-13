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

interface TradeCountChartProps {
  data: Array<{ time: string; count: number }>;
}

export const TradeCountChart = ({ data }: TradeCountChartProps) => (
  <div className="glass-widget widget-hover p-4 h-[280px] flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[13px] font-semibold text-muted-foreground">
        Total Operaciones
      </h3>
      <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
        EN VIVO
      </span>
    </div>
    <div className="h-[120px] w-full">
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
    </div>
  </div>
);

interface ProfitChartProps {
  data: Array<{ day: string; profit: number }>;
}

export const ProfitChart = ({ data }: ProfitChartProps) => {
  const totalProfit = data.reduce((acc, curr) => acc + curr.profit, 0);

  return (
    <div className="glass-widget widget-hover p-4 h-[280px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-muted-foreground">
          Ganancia Diaria
        </h3>
        <span className="text-[18px] font-bold text-foreground">
          ${totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="h-[180px] w-full">
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
      </div>
    </div>
  );
};
