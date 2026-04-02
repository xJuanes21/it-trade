import React from "react";
import {
  ArrowRight,
  Edit2,
  Trash2,
  Users,
  Target,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SyncConfigCardProps {
  config: any;
  masterAccount?: any;
  slaveAccount?: any;
  onEdit: (config: any) => void;
  onDelete: (config: any) => void;
}

export function SyncConfigCard({
  config,
  masterAccount,
  slaveAccount,
  onEdit,
  onDelete,
}: SyncConfigCardProps) {
  const isPaused = config.copier_status !== 1;

  const RISK_LABELS: Record<string, string> = {
    "0": "Auto (Equity)",
    "1": "Auto (Balance)",
    "2": "Auto (Free Margin)",
    "3": "Multi (Notional)",
    "4": "Lote Fijo",
    "11": "Multi (Lote)",
  };

  return (
    <div
      className={cn(
        "glass-widget widget-hover group relative overflow-hidden transition-all duration-500",
        isPaused && "border-amber-500/30 bg-amber-500/[0.02]",
      )}
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* LEFT: IDENTIDAD Y RELACIÓN */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div
            className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
              isPaused
                ? "bg-amber-500/10 text-amber-500"
                : "bg-primary/10 text-primary",
            )}
          >
            <Users size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-black text-lg text-foreground tracking-tight whitespace-nowrap">
                Configuración personalizada{" "}
              </h4>
              {isPaused && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">
                  Pausada
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground truncate">
              <span className="font-black text-foreground truncate max-w-[120px] md:max-w-[180px]">
                {masterAccount?.name || config.masterAccountId}
              </span>
              <ArrowRight size={14} className="text-primary shrink-0" />
              <span className="font-black text-primary truncate max-w-[120px] md:max-w-[180px]">
                {slaveAccount?.name || config.slaveAccountId}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE: PARÁMETROS TÉCNICOS */}
        <div className="flex items-center gap-10 px-8 border-l border-border h-12">
          <div>
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">
              Estrategia
            </p>
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary" />
              <p className="text-sm font-black text-foreground whitespace-nowrap">
                {config.risk_factor_value}x{" "}
                <span className="opacity-50 font-bold ml-1">
                  ({RISK_LABELS[String(config.risk_factor_type)] || "Custom"})
                </span>
              </p>
            </div>
          </div>

          <div className="hidden sm:block">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">
              Seguridad
            </p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                  config.stop_loss
                    ? "bg-red-500/10 text-red-400"
                    : "bg-muted text-muted-foreground opacity-40",
                )}
              >
                <ShieldAlert size={12} /> SL: {config.stop_loss ? "ON" : "OFF"}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                  config.take_profit
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-muted text-muted-foreground opacity-40",
                )}
              >
                <ShieldCheck size={12} /> TP:{" "}
                {config.take_profit ? "ON" : "OFF"}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">
              Creado
            </p>
            <p className="text-xs font-bold text-foreground opacity-60">
              {new Date(config.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* RIGHT: ACCIONES */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(config)}
            className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(config)}
            className="h-10 w-10 rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 text-destructive/70"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
