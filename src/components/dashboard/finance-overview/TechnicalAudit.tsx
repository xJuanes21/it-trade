"use client";

import React from "react";
import { Server, CalendarDays, Key, Globe, ShieldCheck, Activity } from "lucide-react";

interface AccountMetadataProps {
  account_info: {
    environment: string;
    login: string;
    subscription_name: string;
    expiration: string;
    broker: string;
    ccyToUSD: number;
    ccyToEUR: number;
  };
  meta: {
    day_from: string;
    day_to: string;
    server: string;
  };
  delay?: string;
}

export const TechnicalAudit = ({
  account_info,
  meta,
  delay = "0.7s",
}: AccountMetadataProps) => {
  return (
    <div
      className="glass-widget widget-hover p-5 md:p-6 stat-fade-in flex flex-col h-full"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-semibold text-foreground">
            Auditoría de Entorno
          </h3>
          <p className="text-[11px] md:text-xs text-muted-foreground">
            Metadatos y configuración de la cuenta origen
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Entorno y Servidor */}
        <div className="flex bg-secondary/30 rounded-xl p-3 border border-border/50 items-center gap-3">
          <div className="bg-background rounded-lg p-2 border border-border">
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Broker / Entorno</div>
            <div className="font-medium text-sm flex items-center gap-1.5">
              <span className="capitalize">{account_info.broker}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">
                {account_info.environment}
              </span>
            </div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="flex bg-secondary/30 rounded-xl p-3 border border-border/50 items-center gap-3">
          <div className="bg-background rounded-lg p-2 border border-border">
            <Key className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Login ID</div>
            <div className="font-mono text-sm font-medium">{account_info.login}</div>
          </div>
        </div>

        {/* Suscripción (Si aplica) */}
        <div className="flex bg-secondary/30 rounded-xl p-3 border border-border/50 items-center gap-3">
          <div className="bg-background rounded-lg p-2 border border-border">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Suscripción</div>
            <div className="font-medium text-sm">
              {account_info.subscription_name}
              {account_info.expiration !== "N/A" && (
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  Expira: {new Date(account_info.expiration).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Periodo del Reporte */}
        <div className="flex bg-secondary/30 rounded-xl p-3 border border-border/50 items-center gap-3">
          <div className="bg-background rounded-lg p-2 border border-border">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Periodo Evaluado</div>
            <div className="font-medium text-sm">
              {meta.day_from !== "N/A" && meta.day_to !== "N/A" ? (
                <>
                  <span className="tabular-nums">{meta.day_from}</span>
                  <span className="text-muted-foreground mx-1">a</span>
                  <span className="tabular-nums">{meta.day_to}</span>
                </>
              ) : (
                <span className="text-muted-foreground italic">No disponible</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center gap-4">
        <Server className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="text-[10px] text-muted-foreground truncate font-mono">
          SERVER: {meta.server}
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
          <span>USD: <strong className="text-foreground">{account_info.ccyToUSD}</strong></span>
          <span>EUR: <strong className="text-foreground">{account_info.ccyToEUR}</strong></span>
        </div>
      </div>
    </div>
  );
};
