"use client";

import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface SymbolsTradedProps {
  data: Array<{ symbol: string; trades: number }>;
}

export const SymbolsTraded = ({ data }: SymbolsTradedProps) => {
  // Add colors dynamically (cycling through a palette)
  const colors = [
    "#fbbf24",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#10b981",
    "#ec4899",
    "#6366f1",
  ];

  const chartData = data.map((item, index) => ({
    name: item.symbol,
    trades: item.trades,
    color: colors[index % colors.length],
  }));

  const sortedData = [...chartData].sort((a, b) => b.trades - a.trades);
  return (
    <div className="glass-widget widget-hover p-5 h-[280px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[13px] font-semibold text-gray-400">
          Símbolos Más Operados
        </h3>
        <span className="text-[11px] text-gray-500 font-medium">Histórico</span>
      </div>

      <div className="flex-1 w-full min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData.slice(0, 5)}
            layout="vertical"
            margin={{ left: -20, right: 20 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: "bold" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="trades" radius={[0, 4, 4, 0]} barSize={12}>
              {sortedData.slice(0, 5).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {sortedData.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-[11px]"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400 font-medium">{item.name}</span>
            </div>
            <span className="text-white font-bold">{item.trades} ops</span>
          </div>
        ))}
      </div>
    </div>
  );
};
