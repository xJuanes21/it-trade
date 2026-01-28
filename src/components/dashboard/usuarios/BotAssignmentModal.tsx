"use client";

import React, { useEffect, useState } from "react";
import { X, Bot, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { eaService } from "@/services/ea.service";
import { botAssignmentService } from "@/services/bot-assignment.service";
import { EaConfig } from "@/types/ea";

interface BotAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export default function BotAssignmentModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}: BotAssignmentModalProps) {
  const [availableBots, setAvailableBots] = useState<EaConfig[]>([]);
  const [assignedBotIds, setAssignedBotIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBots();
    }
  }, [isOpen, userId]);

  const loadBots = async () => {
    try {
      setLoading(true);

      // 1. Cargar configuraciones reales del servidor MT5 (Primary Source)
      let allBots: EaConfig[] = [];
      try {
        const jsonResponse = await eaService.getAllJsonConfigs();
        if (jsonResponse.success && jsonResponse.configs) {
          // Map to simplified EaConfig structure
          allBots = jsonResponse.configs.map((item) => ({
            ea_name: item.config.name || `Bot ${item.magic_number}`,
            magic_number: item.magic_number,
            lot_size: item.config.lotaje,
            enabled: !item.config.stop,
            symbol: "", // Hidden
            timeframe: "", // Hidden
            stop_loss: 0,
            take_profit: 0,
            max_trades: 0,
            trading_hours_start: 0,
            trading_hours_end: 0,
            risk_percent: 0,
          }));
        }
      } catch (e) {
        console.error("Failed to load MT5 configs", e);
      }

      setAvailableBots(allBots);

      // 2. Cargar bots asignados al usuario
      try {
        const assignedBots =
          await botAssignmentService.getUserBotAssignments(userId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assignedIds = assignedBots.map((bot: any) => bot.magic_number);
        setAssignedBotIds(assignedIds);
      } catch (e) {
        console.error("Failed to load assignments", e);
      }
    } catch (error) {
      console.error("Error loading bots:", error);
      toast.error("Error al cargar bots");
    } finally {
      setLoading(false);
    }
  };

  const toggleBotAssignment = (magicNumber: number) => {
    setAssignedBotIds((prev) =>
      prev.includes(magicNumber)
        ? prev.filter((id) => id !== magicNumber)
        : [...prev, magicNumber],
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await botAssignmentService.updateUserAssignments(userId, assignedBotIds);

      toast.success("Asignaciones actualizadas", {
        description: `Bots asignados a ${userName}`,
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error saving assignments:", error);
      toast.error("Error al guardar asignaciones");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Asignar Bots</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los bots de {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : availableBots.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No hay bots disponibles
              </h3>
              <p className="text-muted-foreground">
                Crea algunos bots para poder asignarlos a usuarios
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableBots.map((bot) => {
                const isAssigned = assignedBotIds.includes(bot.magic_number);

                return (
                  <div
                    key={bot.magic_number}
                    onClick={() => toggleBotAssignment(bot.magic_number)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isAssigned
                        ? "border-primary bg-primary/5"
                        : "border-border bg-secondary/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isAssigned ? "bg-primary" : "bg-blue-500"
                          } shadow-lg`}
                        >
                          <Bot size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {bot.ea_name}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                              {bot.symbol}
                            </span>
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                              {bot.timeframe}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox indicator */}
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isAssigned
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isAssigned && (
                          <Check size={16} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
