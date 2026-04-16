"use client";

import React from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "@/lib/copy-trader-types";

import { TraderProfile } from "@/app/dashboard/copy-trader/traders/page";

interface TradersListProps {
  profiles: TraderProfile[];
  selectedTraderId?: string;
  onSelect: (profile: TraderProfile) => void;
  isLoading: boolean;
}

export const TradersList = ({
  profiles,
  selectedTraderId,
  onSelect,
  isLoading,
}: TradersListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[120px] bg-slate-100/80 dark:bg-card/40 backdrop-blur-md border border-border rounded-[2rem] animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[40vh] border border-dashed border-border rounded-2xl bg-muted/30 backdrop-blur-sm">
        <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-black text-foreground/80 tracking-tighter uppercase">Sin Traders Disponibles</h2>
        <p className="text-muted-foreground mt-2 text-center text-[10px] font-bold uppercase tracking-widest px-10 opacity-60">
          No hay usuarios con cuentas maestras públicas configuradas actualmente.
        </p>
      </div>
    );
  }

    const isCompact = !!selectedTraderId;

    return (
    <div
      className={cn(
        "flex flex-col gap-5 transition-all duration-700 w-full",
        selectedTraderId ? "opacity-100" : "",
      )}
    >
      {profiles.map((profile) => (
        <div
          key={profile.trader.id}
          onClick={() => onSelect(profile)}
          className={cn(
            "cursor-pointer rounded-[1.75rem] border transition-all duration-500 relative overflow-hidden group flex flex-col items-center justify-between gap-4",
            isCompact ? "p-4 min-h-[90px] md:flex-row" : "p-6 min-h-[110px] md:flex-row md:gap-6",
            selectedTraderId === profile.masterAccount?.account_id
              ? "border-primary bg-primary/10 ring-1 ring-primary/20 shadow-2xl shadow-primary/10"
              : "glass-widget widget-hover",
          )}
        >
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.05] to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
            <div
              className={cn(
                "rounded-2xl flex items-center justify-center border transition-all duration-500 shrink-0 aspect-square",
                isCompact ? "w-11 h-11" : "w-14 h-14",
                selectedTraderId && selectedTraderId === profile.masterAccount?.account_id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "bg-background/40 text-primary border border-white/10 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.15)]",
              )}
            >
              <Users className={cn(isCompact ? "w-5 h-5" : "w-7 h-7")} />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-0.5 w-full overflow-hidden">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                  Trader Verificado
                </span>
                {!isCompact && (
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {profile.trader.email}
                  </span>
                )}
              </div>
              <h3 className={cn(
                "font-bold text-foreground tracking-tight group-hover:text-primary transition-colors truncate w-full",
                isCompact ? "text-base" : "text-xl"
              )}>
                {profile.trader.name || "Usuario Plataforma"}
              </h3>
              {profile.masterAccount ? (
                <div className="flex items-center gap-2 opacity-70">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    {profile.masterAccount.name}
                  </span>
                  {!isCompact && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                        {profile.masterAccount.broker} @ {profile.masterAccount.server}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest italic animate-pulse">
                  Click para cargar detalles master...
                </span>
              )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center md:items-end gap-3 shrink-0">
            {selectedTraderId && selectedTraderId === profile.masterAccount?.account_id ? (
              <div className={cn(
                "rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest border border-primary/30 animate-pulse",
                isCompact ? "px-3 py-1.5 text-[8px]" : "px-5 py-2 text-[10px]"
              )}>
                Seleccionado
              </div>
            ) : (
              <div className={cn(
                "rounded-xl bg-muted border border-border font-black text-muted-foreground uppercase tracking-[0.15em] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300",
                isCompact ? "px-4 py-2 text-[8px]" : "px-6 py-2.5 text-[10px]"
              )}>
                {isCompact ? "Ver" : "Ver Rendimiento"}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
