"use client";

import React from "react";

interface WinstreakPanelProps {
  metrics: {
    current_streak: number;
    best_streak: number;
    won_days_month: number;
    total_days_month: number;
    lost_trades_week: number;
    activity_percent: number;
  };
}

export const WinstreakPanel = ({ metrics }: WinstreakPanelProps) => {
  const winstreakData = [
    {
      label: "Racha Actual",
      value: metrics.current_streak.toString(),
      subValue: "Ops",
      color: "text-green-400",
    },
    {
      label: "Mejor Racha",
      value: metrics.best_streak.toString(),
      subValue: "Ops",
      color: "text-blue-400",
    },
    {
      label: "Días Ganadores",
      value: `${metrics.won_days_month}/${metrics.total_days_month}`,
      subValue: "Este Mes",
      color: "text-emerald-400",
    },
    {
      label: "Ops Perdidas",
      value: metrics.lost_trades_week.toString(),
      subValue: "Esta Semana",
      color: "text-rose-400",
    },
  ];

  return (
    <div className="glass-widget widget-hover p-5 h-full">
      <h3 className="text-[13px] font-semibold text-gray-400 mb-6">
        Métricas de Racha
      </h3>

      <div className="space-y-8">
        {winstreakData.map((item, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="space-y-0.5">
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-600">{item.subValue}</p>
            </div>
            <div
              className={`text-2xl font-black ${item.color} group-hover:scale-110 transition-transform cursor-default font-mono`}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-gray-500 uppercase font-bold">
            Actividad de Trading
          </span>
          <span className="text-[11px] text-emerald-400 font-bold">
            {metrics.activity_percent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            style={{ width: `${metrics.activity_percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
