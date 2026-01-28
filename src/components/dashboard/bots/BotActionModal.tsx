"use client";

import React from "react";
import {
  Play,
  Pause,
  BotOff,
  Settings,
  X,
  Activity,
  Loader2,
} from "lucide-react";
import { EaConfig, EaJsonConfig } from "@/types/ea";
import { toast } from "sonner";

interface BotActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: EaConfig | undefined;
  config: EaJsonConfig | undefined;
  onStart: (bot: EaConfig, lotaje: number) => void;
  onStop: (bot: EaConfig) => void;
  onPause: (bot: EaConfig) => void;
  onResume: (bot: EaConfig) => void;
  onConfigure: (bot: EaConfig) => void;
  onUpdateLotaje: (bot: EaConfig, lotaje: number) => Promise<void>;
}

export default function BotActionModal({
  isOpen,
  onClose,
  bot,
  config,
  onStart,
  onStop,
  onPause,
  onResume,
  onConfigure,
  onUpdateLotaje,
}: BotActionModalProps) {
  const [localLotaje, setLocalLotaje] = React.useState<number>(0.01);
  const [isUpdatingLotaje, setIsUpdatingLotaje] = React.useState(false);

  React.useEffect(() => {
    if (bot && isOpen) {
      setLocalLotaje(bot.lot_size);
    }
  }, [bot, isOpen]);

  if (!isOpen || !bot) return null;

  const handleLotajeBlur = async () => {
    if (localLotaje !== bot.lot_size && localLotaje > 0) {
      try {
        setIsUpdatingLotaje(true);
        await onUpdateLotaje(bot, localLotaje);
        toast.success("Lotaje actualizado");
      } catch (error) {
        toast.error("Error al actualizar lotaje");
        setLocalLotaje(bot.lot_size); // Revert
      } finally {
        setIsUpdatingLotaje(false);
      }
    }
  };

  const isStopped = config?.stop !== false; // Default to stopped if undefined or true
  const isPaused = config?.pause === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              Control de Bot
            </h2>
            <p className="text-sm text-muted-foreground">
              {bot.ea_name}{" "}
              <span className="opacity-50">#{bot.magic_number}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Display */}
        <div className="p-6 pb-2">
          <div
            className={`rounded-2xl p-4 border flex flex-col items-center justify-center gap-2 ${
              isStopped
                ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                : "bg-green-500/10 border-green-500/20 text-green-500"
            }`}
          >
            <div className="font-bold text-lg">
              {isStopped ? "DETENIDO" : isPaused ? "PAUSADO" : "OPERANDO"}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isStopped
                ? "El bot no está tomando operaciones."
                : isPaused
                  ? "Operaciones suspendidas temporalmente."
                  : "El bot está analizando el mercado activamente."}
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="p-6 pt-2 grid grid-cols-2 gap-3">
          {isStopped ? (
            <button
              onClick={() => onStart(bot, localLotaje)}
              className="col-span-2 bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Play size={24} fill="currentColor" />
              INICIAR OPERACIONES
            </button>
          ) : (
            <>
              <button
                onClick={() => onStop(bot)}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all flex flex-col items-center justify-center gap-2 active:scale-95"
              >
                <BotOff size={28} />
                STOP
              </button>

              {isPaused ? (
                <button
                  onClick={() => onResume(bot)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex flex-col items-center justify-center gap-2 active:scale-95"
                >
                  <Play size={28} fill="currentColor" />
                  REANUDAR
                </button>
              ) : (
                <button
                  onClick={() => onPause(bot)}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-amber-500/20 transition-all flex flex-col items-center justify-center gap-2 active:scale-95"
                >
                  <Pause size={28} fill="currentColor" />
                  PAUSAR
                </button>
              )}
            </>
          )}
        </div>

        {/* Configuration Footer */}
        <div className="p-4 bg-secondary/30 border-t border-border mt-auto flex flex-col gap-3">
          <button
            onClick={() => onConfigure(bot)}
            className="w-full bg-card hover:bg-secondary border border-border text-foreground p-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Settings size={18} />
            Configurar Parámetros
          </button>

          <button
            onClick={onClose}
            className="w-full text-muted-foreground hover:text-foreground p-2 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
