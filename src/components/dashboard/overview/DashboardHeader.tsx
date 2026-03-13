"use client";

import React from "react";
import { RefreshCw, Share2, Calendar, Filter, Edit } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  lastSync: string;
  accountType: string;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const DashboardHeader = ({
  userName,
  lastSync,
  accountType,
  onSync,
  isSyncing = false,
}: DashboardHeaderProps) => {
  return (
    <div className="border-b border-border glass-widget !rounded-none backdrop-blur-md sticky top-0 z-10">
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-0.5 text-foreground">
            Hola, <span className="text-primary">{userName}</span>
          </h1>
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Última Sinc: {lastSync}
            </span>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 hover:text-foreground transition-colors px-2 py-0.5 rounded-md hover:bg-secondary border border-transparent hover:border-border ${isSyncing ? "animate-pulse" : ""}`}
            >
              <RefreshCw
                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>
                {isSyncing ? "Sincronizando..." : "Sincronizar ahora"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 glass-widget !rounded-xl px-3 py-1.5 border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
            <span className="text-[12px] font-semibold text-foreground uppercase">
              {accountType}
            </span>
            <span className="text-[11px] text-muted-foreground">- ITW1149</span>
            <Share2 className="w-3.5 h-3.5 text-muted-foreground ml-1 cursor-pointer hover:text-foreground" />
          </div>

          <button className="glass-widget !rounded-xl px-3 py-1.5 text-[12px] hover:bg-secondary border border-border transition flex items-center gap-1.5 text-foreground">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Métricas
            <Edit className="w-3 h-3" />
          </button>

          <button className="glass-widget !rounded-xl px-3 py-1.5 text-[12px] hover:bg-secondary border border-border transition flex items-center gap-1.5 text-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Dic 23, 2025 - Hoy
          </button>

          <button className="glass-widget !rounded-xl p-1.5 hover:bg-secondary border border-border transition">
            <Filter className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};
