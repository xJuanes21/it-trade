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
    <div className="border-b border-white/5 glass-widget !rounded-none backdrop-blur-md sticky top-0 z-10">
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-0.5 text-white">
            Hola, <span className="text-blue-400">{userName}</span>
          </h1>
          <div className="flex items-center gap-3 text-[12px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Última Sinc: {lastSync}
            </span>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 hover:text-white transition-colors px-2 py-0.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 ${isSyncing ? "animate-pulse" : ""}`}
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
          <div className="flex items-center gap-2 glass-widget !rounded-xl px-3 py-1.5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
            <span className="text-[12px] font-semibold text-white uppercase">
              {accountType}
            </span>
            <span className="text-[11px] text-gray-400">- ITW1149</span>
            <Share2 className="w-3.5 h-3.5 text-gray-400 ml-1 cursor-pointer hover:text-white" />
          </div>

          <button className="glass-widget !rounded-xl px-3 py-1.5 text-[12px] hover:bg-white/5 border border-white/10 transition flex items-center gap-1.5 text-white">
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

          <button className="glass-widget !rounded-xl px-3 py-1.5 text-[12px] hover:bg-white/5 border border-white/10 transition flex items-center gap-1.5 text-white">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Dic 23, 2025 - Hoy
          </button>

          <button className="glass-widget !rounded-xl p-1.5 hover:bg-white/5 border border-white/10 transition">
            <Filter className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
