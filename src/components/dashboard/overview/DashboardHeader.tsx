"use client";

import React from "react";
import { RefreshCw, Share2, Calendar, Filter, Edit } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  lastSync: string;
  accountType?: string;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const DashboardHeader = ({
  userName,
  lastSync,
  accountType = "TRADER",
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
          <button className="glass-widget !rounded-xl px-3 py-1.5 text-[12px] hover:bg-secondary border border-border transition flex items-center gap-1.5 text-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "es-ES",
              { month: "short", day: "2-digit", year: "numeric" },
            )}{" "}
            - Hoy
          </button>
        </div>
      </div>
    </div>
  );
};
