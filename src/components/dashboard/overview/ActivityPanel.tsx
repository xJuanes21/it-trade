"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, RefreshCcw, Bell, Loader2 } from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";

interface Notification {
  timestamp: string;
  type: number;
  name: string;
  text: string;
}

export function ActivityPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await tradeCopierService.getNotifications();
      if (res.status === "success") {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="glass-widget widget-hover p-6 text-foreground h-[650px] flex flex-col">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bell className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Actividad Reciente</h3>
          </div>
        </div>
        <button
          className="rounded-xl border border-border bg-secondary p-2 text-secondary-foreground transition hover:border-primary disabled:opacity-50"
          onClick={fetchNotifications}
          disabled={loading}
        >
          <RefreshCcw
            size={18}
            className={loading ? "animate-spin text-primary" : ""}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="space-y-4 animate-in fade-in duration-700">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-white/5 bg-slate-100/5 dark:bg-card/30 p-5 animate-pulse"
              >
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary/20" />
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-28 bg-white/10 rounded-lg" />
                    <div className="h-2 w-16 bg-white/5 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-white/5 rounded-lg" />
                    <div className="h-3 w-2/3 bg-white/5 rounded-lg opacity-60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-border rounded-2xl bg-secondary/20">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente registrada.
            </p>
          </div>
        ) : null}

        {notifications.map((item, idx) => (
          <div
            key={`${item.timestamp}-${idx}`}
            className="group relative flex gap-4 rounded-2xl border border-border/50 bg-card/40 p-4 transition-all hover:border-primary/40 hover:bg-card/60"
          >
            <div
              className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${
                item.name.toLowerCase().includes("delete")
                  ? "bg-red-500"
                  : item.name.toLowerCase().includes("add")
                    ? "bg-emerald-500"
                    : "bg-blue-500"
              }`}
            />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 group-hover:text-primary transition-colors">
                  {item.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {item.timestamp.split(".")[0]}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {item.text.replace(/Trade Copier|servidor MT5|API externa|API de MT5/gi, "Servidor de IT TRADE")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
