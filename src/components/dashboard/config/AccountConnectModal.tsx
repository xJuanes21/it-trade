"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Server, Key, User, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { dashboardService } from "@/services/dashboard.service";
import { useRouter } from "next/navigation";

const connectSchema = z.object({
  login: z.string().min(1, "El Login es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  server: z.string().min(1, "El servidor es requerido"),
});

type ConnectFormData = z.infer<typeof connectSchema>;

interface AccountConnectModalProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export function AccountConnectModal({
  onSuccess,
  onClose,
}: AccountConnectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectFormData>({
    resolver: zodResolver(connectSchema),
  });

  const onSubmit = async (data: ConnectFormData) => {
    setIsLoading(true);
    try {
      await dashboardService.addAccount(data);
      toast.success("Cuenta conectada exitosamente", {
        description: "Sus credenciales se han validado y respaldado.",
      });
      onSuccess();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Error de conexión", {
        description:
          error.message ||
          "No se pudo conectar con los credenciales proporcionados.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-2xl max-w-lg w-full relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        )}

        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Conectar Cuenta de Trading
          </h2>
          <p className="text-slate-400 text-sm">
            Para acceder al dashboard, necesitas conectar tu cuenta de
            MetaTrader 5.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-blue-400" /> Login ID
            </label>
            <input
              {...register("login")}
              className="w-full bg-[#1e293b] text-white p-3.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="Ej: 50123456"
            />
            {errors.login && (
              <p className="text-red-400 text-xs">{errors.login.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Key size={14} className="text-purple-400" /> Contraseña
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-[#1e293b] text-white p-3.5 rounded-xl border border-slate-700/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Server size={14} className="text-emerald-400" /> Servidor
            </label>
            <input
              {...register("server")}
              className="w-full bg-[#1e293b] text-white p-3.5 rounded-xl border border-slate-700/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
              placeholder="Ej: MetaQuotes-Demo"
            />
            {errors.server && (
              <p className="text-red-400 text-xs">{errors.server.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Verificando...
              </>
            ) : (
              "Conectar y Acceder"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Tus credenciales son encriptadas y almacenadas de forma segura.
        </p>
      </div>
    </div>
  );
}
