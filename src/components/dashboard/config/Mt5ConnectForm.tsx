"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Server, Key, User } from "lucide-react";
import { toast } from "sonner";
import { eaService } from "@/services/ea.service";
import { useRouter } from "next/navigation";

const connectSchema = z.object({
  login: z.string().min(1, "El Login es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  server: z.string().min(1, "El servidor es requerido"),
});

type ConnectFormData = z.infer<typeof connectSchema>;

export default function Mt5ConnectForm() {
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
      await eaService.connectMt5(data);
      toast.success("Conexión exitosa", {
        description: "Sus credenciales se han guardado de forma segura.",
      });
      router.push("/dashboard/bots");
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión", {
        description: "No se pudo conectar con los credenciales proporcionados.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Server className="w-6 h-6 text-primary" />
          Conectar cuenta MT5
        </h2>
        <p className="text-muted-foreground mt-2">
          Ingrese sus credenciales de MetaTrader 5 para permitir que los bots operen en su cuenta.
          Su contraseña se almacena de forma encriptada.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User size={16} /> Login ID
          </label>
          <input
            {...register("login")}
            className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Ej: 50123456"
          />
          {errors.login && (
            <p className="text-red-400 text-sm">{errors.login.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Key size={16} /> Contraseña (Master)
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Server size={16} /> Servidor
          </label>
          <input
            {...register("server")}
            className="w-full bg-secondary text-foreground p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Ej: MetaQuotes-Demo"
          />
          {errors.server && (
            <p className="text-red-400 text-sm">{errors.server.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Conectando...
            </>
          ) : (
            "Guardar y Conectar"
          )}
        </button>
      </form>
    </div>
  );
}
