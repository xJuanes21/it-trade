"use client";

import { useState } from "react";
import { Lock, Mail, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TradeCopierKeysForm({
  hasCredentials,
  targetUserId,
  onSuccess,
}: {
  hasCredentials?: boolean;
  targetUserId?: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(hasCredentials);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/credentials-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
          targetUserId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar credenciales");
      }

      setSaved(true);
      toast.success("Credenciales guardadas de forma segura.");
      setEmail("");
      setPassword("");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-widget p-8 max-w-xl border-white/5 bg-background/40 backdrop-blur-3xl shadow-xl overflow-hidden group rounded-3xl relative mx-auto lg:mx-0">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent uppercase tracking-tighter">
            {targetUserId ? "Configurar Trader" : "Mis Credenciales"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {targetUserId 
              ? "Establezca la conexión para este usuario." 
              : "Vincule su cuenta para automatizar operaciones."}
          </p>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs leading-relaxed flex gap-3 items-start">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Toda la información viaja y se almacena bajo encriptación AES-256 de extremo a extremo. 
            Nadie, excepto el servidor de ejecución, tiene acceso a estos datos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Email de Conexión
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-3 text-sm transition-all outline-none text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Contraseña Segura
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl pl-10 pr-4 py-3 text-sm transition-all outline-none text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Actualizar Credenciales
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Vincular Ahora
            </>
          )}
        </button>
      </form>
    </div>
  );
}
