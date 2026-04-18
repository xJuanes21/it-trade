"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Wallet,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";
import Link from "next/link";

export function AccountStatusPanel() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await tradeCopierService.getAccounts();
        if (res.status === "success") {
          setAccounts(res.data.accounts || []);
        }
      } catch (err) {
        console.error("Failed to fetch account status", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const linkedCount = accounts.length;
  const activeCount = accounts.filter((a) => Number(a.status) === 1).length;

  return (
    <div className="glass-widget widget-hover p-6 text-foreground h-[650px] flex flex-col border border-white/5 relative overflow-hidden group">
      {/* Background Decorative Gradient */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-8 items-start justify-between flex">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center ring-1 ring-emerald-500/20">
              <ShieldCheck className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">
                Estado de Cuenta
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                Verificación en Tiempo Real
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
          {/* Summary Card / Skeleton */}
          {loading ? (
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 animate-pulse flex flex-col items-center gap-4">
              <div className="h-10 w-10 bg-white/10 rounded-2xl mb-2" />
              <div className="h-4 w-48 bg-white/10 rounded-lg" />
              <div className="h-2 w-24 bg-white/5 rounded-full" />
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="h-16 bg-white/5 rounded-2xl" />
                <div className="h-16 bg-white/5 rounded-2xl" />
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                <span className="text-sm font-bold text-emerald-400">
                  {linkedCount > 0
                    ? "Todo al día, tu conexión es estable"
                    : "Sin cuentas vinculadas"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    Cuentas Totales
                  </p>
                  <p className="text-2xl font-black">{linkedCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Mini List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2">
              <Activity size={12} className="text-primary" />
              Tus Conexiones
            </h4>

            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10" />
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-white/10 rounded-lg" />
                        <div className="h-2 w-32 bg-white/5 rounded-full" />
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                ))
            ) : linkedCount > 0 ? (
              accounts.slice(0, 4).map((acc, idx) => (
                <div
                  key={acc.account_id || idx}
                  className="p-4 rounded-3xl bg-secondary/30 border border-white/5 flex items-center justify-between group/item hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xs">
                      {acc.login.toString().slice(-2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {acc.name || "Cuenta MT5"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {acc.login} • {acc.server}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${acc.state === 1 ? "bg-emerald-500" : "bg-red-500"} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}
                  />
                </div>
              ))
            ) : (
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="text-muted-foreground/30 w-8 h-8" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  No se encontraron cuentas vinculadas a tu perfil.
                </p>
                <Link
                  href="/dashboard/copy-trader/accounts"
                  className="inline-block text-[10px] font-black text-primary uppercase border-b border-primary/30 pb-0.5 hover:border-primary transition-all"
                >
                  Vincular Ahora
                </Link>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/dashboard/copy-trader/accounts"
          className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-primary/10 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all group/btn border border-white/5"
        >
          Gestionar Mis Cuentas
          <ArrowUpRight
            size={14}
            className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
