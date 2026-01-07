"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { eaService } from "@/services/ea.service";
import { EaConfig } from "@/types/ea";

const configSchema = z.object({
  ea_name: z.string().min(1, "Nombre requerido"),
  magic_number: z.coerce.number().int().min(1, "Magic Number requerido"),
  symbol: z.string().min(1, "Símbolo requerido"),
  timeframe: z.string().min(1, "Timeframe requerido"),
  lot_size: z.coerce.number().positive("Lot size debe ser positivo"),
  stop_loss: z.coerce.number().nonnegative(),
  take_profit: z.coerce.number().nonnegative(),
  max_trades: z.coerce.number().int().positive(),
  trading_hours_start: z.coerce.number().min(0).max(23),
  trading_hours_end: z.coerce.number().min(0).max(23),
  risk_percent: z.coerce.number().min(0).max(100),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface BotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: EaConfig;
}

export default function BotConfigModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: BotConfigModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema) as any,
    defaultValues: {
      ea_name: "",
      symbol: "",
      timeframe: "H1",
      lot_size: 0.01,
      max_trades: 1,
      trading_hours_start: 0,
      trading_hours_end: 23,
      risk_percent: 1,
      stop_loss: 0,
      take_profit: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ea_name: initialData.ea_name,
        magic_number: initialData.magic_number,
        symbol: initialData.symbol,
        timeframe: initialData.timeframe,
        lot_size: initialData.lot_size,
        stop_loss: initialData.stop_loss,
        take_profit: initialData.take_profit,
        max_trades: initialData.max_trades,
        trading_hours_start: initialData.trading_hours_start,
        trading_hours_end: initialData.trading_hours_end,
        risk_percent: initialData.risk_percent,
      });
    } else {
        reset({
            ea_name: "",
            symbol: "",
            timeframe: "H1",
            lot_size: 0.01,
            max_trades: 1,
            trading_hours_start: 0,
            trading_hours_end: 23,
            risk_percent: 1,
            stop_loss: 0,
            take_profit: 0,
        });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data: ConfigFormData) => {
    try {
      if (initialData) {
        await eaService.updateConfig(initialData.magic_number, data);
        toast.success("Configuración actualizada");
      } else {
        await eaService.createConfig(data);
        toast.success("Bot creado exitosamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
        console.error(error);
      toast.error("Error al guardar", {
        description: error.message || "Verifique los datos e intente nuevamente",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">
                {initialData ? "Editar Configuración" : "Nuevo Bot"}
            </h2>
            <p className="text-sm text-muted-foreground">
                Ajuste los parámetros operativos del Expert Advisor.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium">Nombre del EA</label>
              <input
                {...register("ea_name")}
                className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ej: Scalper Pro"
              />
              {errors.ea_name && <p className="text-red-400 text-xs">{errors.ea_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Magic Number</label>
              <input
                type="number"
                {...register("magic_number")}
                disabled={!!initialData}
                placeholder="Ej: 12345"
                className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
              />
              {errors.magic_number && <p className="text-red-400 text-xs">{errors.magic_number.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Símbolo (Par)</label>
              <input
                {...register("symbol")}
                className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
                placeholder="EURUSD"
              />
              {errors.symbol && <p className="text-red-400 text-xs">{errors.symbol.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <select
                {...register("timeframe")}
                className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
              </select>
              {errors.timeframe && <p className="text-red-400 text-xs">{errors.timeframe.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Lot Size</label>
                <input 
                    type="number" 
                    step="0.01" 
                    {...register("lot_size")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
                {errors.lot_size && <p className="text-red-400 text-xs">{errors.lot_size.message}</p>}
            </div>

            {/* Risk Management */}
            <div className="col-span-full border-t border-border pt-4 mt-2">
                <h3 className="font-semibold mb-4 text-foreground/80">Gestión de Riesgo</h3>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Stop Loss (Pips)</label>
                <input 
                    type="number" 
                    {...register("stop_loss")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Take Profit (Pips)</label>
                <input 
                    type="number" 
                    {...register("take_profit")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Riesgo (%)</label>
                <input 
                    type="number" 
                    step="0.1" 
                    {...register("risk_percent")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Max Trades</label>
                <input 
                    type="number" 
                    {...register("max_trades")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>

            {/* Trading Hours */}
             <div className="col-span-full border-t border-border pt-4 mt-2">
                <h3 className="font-semibold mb-4 text-foreground/80">Horario de Trading</h3>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Hora Inicio (0-23)</label>
                <input 
                    type="number" 
                    {...register("trading_hours_start")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Hora Fin (0-23)</label>
                <input 
                    type="number" 
                    {...register("trading_hours_end")} 
                    className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>
          </div>
        
          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-sm font-medium hover:bg-secondary transition-colors border border-transparent hover:border-border"
                type="button"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {initialData ? "Actualizar" : "Crear Bot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
