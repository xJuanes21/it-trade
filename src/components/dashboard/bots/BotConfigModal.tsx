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
  name: z.string().min(1, "Nombre requerido"),
  magic_number: z.coerce.number().int().min(1, "Magic Number requerido"),
  lotaje: z.coerce.number().positive("Lot size debe ser positivo"),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(configSchema) as any,
    defaultValues: {
      name: "",
      lotaje: 0.01,
    },
  });

  useEffect(() => {
    if (initialData) {
      // Edit mode: Fill from existing data
      // Note: We might need to map from EaConfig (DB style) to JSON style if we are editing
      // But for now, we assume initialData comes from the Dashboard which is sourced from JSON
      reset({
        name: initialData.ea_name, // Mapping 'ea_name' from the list to 'name' in JSON
        magic_number: initialData.magic_number,
        lotaje: initialData.lot_size, // Mapping 'lot_size' to 'lotaje'
      });
    } else {
      reset({
        name: "",
        lotaje: 0.01,
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data: ConfigFormData) => {
    try {
      if (initialData) {
        // Update existing JSON config (Safe update without resetting state)
        await eaService.updateJsonConfig(data.magic_number, {
          lotaje: data.lotaje,
          name: data.name,
        });

        toast.success("Tus cambios se han guardado exitosamente");
      } else {
        // Create new JSON config
        await eaService.createJsonConfig(
          data.magic_number,
          data.lotaje,
          data.name,
        );
        toast.success("¡Tu bot ha sido creado y está listo!");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Verifique los datos e intente nuevamente";
      toast.error(
        "Hubo un problema al guardar tus cambios. Por favor intenta de nuevo",
        {
          description: "Revisa la información e inténtalo de nuevo",
        },
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {initialData ? "Editar Bot" : "Nuevo Bot"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Configuración operativa del Expert Advisor
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 flex-1 overflow-y-auto"
        >
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nombre (Identificador)
              </label>
              <input
                {...register("name")}
                className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ej: Bot Alpha"
              />
              {errors.name && (
                <p className="text-red-400 text-xs">{errors.name.message}</p>
              )}
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
              {errors.magic_number && (
                <p className="text-red-400 text-xs">
                  {errors.magic_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lotaje</label>
              <input
                type="number"
                step="0.01"
                {...register("lotaje")}
                className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.lotaje && (
                <p className="text-red-400 text-xs">{errors.lotaje.message}</p>
              )}
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
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              {initialData ? "Actualizar" : "Crear Configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
