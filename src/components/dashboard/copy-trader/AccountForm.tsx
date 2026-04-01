"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Account, BrokerType } from "@/lib/copy-trader-types";
import { cn } from "@/lib/utils";
import { Info, HelpCircle, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";
import { useSession } from "next-auth/react";
import { ModernSelect } from "@/components/ui/ModernSelect";

interface AccountFormProps {
  initialData?: Partial<Account>;
  onSuccess?: (data: Account) => void;
  onCancel?: () => void;
}

const BROKERS: { value: BrokerType; label: string; servers?: string }[] = [
  { value: "mt4", label: "MetaTrader 4", servers: "Ej: IG-DEMO, FxPro.com-Real02" },
  { value: "mt5", label: "MetaTrader 5", servers: "Ej: ActivTrades-Server, Binary.com-Server" },
  { value: "ctrader", label: "cTrader", servers: "Escriba 'unknown'" },
  { value: "fxcm_fc", label: "FXCM", servers: "URL: http://www.fxcorporate.com/Hosts.jsp" },
  { value: "lmax", label: "LMAX", servers: "Ej: https://api.lmaxtrader.com" },
  { value: "dxtrade", label: "DXTrade", servers: "URL de broker sin https" },
  { value: "fortex", label: "Fortex", servers: "URL de broker sin https" },
  { value: "tradovate", label: "Tradovate", servers: "Entorno Real/Demo" },
];

export default function AccountForm({ initialData, onSuccess, onCancel }: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superadmin";

  const [formData, setFormData] = useState<Partial<Account>>({
    type: isSuperAdmin ? 0 : 1, // Default type
    status: 1,
    broker: "mt4",
    subscription: "auto",
    alert_email: 1,
    ...initialData,
  });

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: ["type", "status", "alert_email"].includes(name) ? Number(value) : value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedBroker = BROKERS.find(b => b.value === formData.broker);
  const showEnvironment = ["fxcm_fc", "lmax", "ctrader", "tradovate"].includes(formData.broker || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const finalData = {
        ...formData,
        group: formData.group || "",
        subscription: formData.subscription || "",
      };

      let response;
      if (formData.account_id) {
        response = await tradeCopierService.updateAccount(finalData);
      } else {
        response = await tradeCopierService.addAccount(finalData);
      }

      if (response.status === "success") {
        setMessage({ type: "success", text: formData.account_id ? "Cuenta actualizada con éxito." : "Cuenta vinculada correctamente." });
        if (onSuccess) {
          onSuccess(response.data.account);
        }
      } else {
        setMessage({ type: "error", text: response.message || "Error al procesar la cuenta." });
      }
    } catch (error: any) {
      console.error("Form Submit Error:", error);
      setMessage({ type: "error", text: error.message || "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "bg-background/40 border-white/10 rounded-xl h-11 focus:ring-primary focus:border-primary transition-all";
  const labelClasses = "text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1";

  return (
    <Card className="max-w-4xl mx-auto backdrop-blur-xl bg-card/60 border-white/5 shadow-2xl overflow-hidden rounded-[2rem]">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-primary">
        <ShieldCheck size={160} />
      </div>
      
      <CardHeader className="p-8 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-2">
           <div className="h-2 w-12 bg-primary rounded-full" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Operaciones IT TRADE</p>
        </div>
        <CardTitle className="text-4xl font-black text-foreground tracking-tight">
          {formData.account_id ? "Editar Cuenta" : "Vincular Cuenta"}
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 font-medium max-w-lg mt-2">
          Conecta tus cuentas de inversión mediante nuestra API segura para la operativa de copiado institucional.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 pt-6 relative z-10">
        {message && (
          <div className={cn(
            "mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
            message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-100"
          )}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold uppercase tracking-tight">{message.text}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          
          <div className="col-span-full border-b border-white/5 pb-2">
             <h3 className="text-[11px] font-black text-foreground/50 uppercase tracking-[0.2em]">1. Configuración de Rol</h3>
          </div>

          <div className="space-y-3">
            <Label className={labelClasses}>Rol en el Sistema</Label>
            <ModernSelect
              options={isSuperAdmin ? [
                { value: 0, label: "MASTER (Proveedor de Señales)" },
                { value: 1, label: "SLAVE (Suscriptor de Modelos)" }
              ] : [
                { value: 1, label: "SLAVE (Suscriptor de Modelos)" }
              ]}
              value={formData.type || 1}
              onChange={(v) => handleSelectChange("type", v)}
              disabled={!isSuperAdmin && !formData.account_id}
            />
          </div>

          <div className="space-y-3">
            <Label className={labelClasses}>Alias o Nombre de la Cuenta</Label>
            <Input
              name="name"
              placeholder="Ej: High Risk Intraday"
              className={inputClasses}
              value={formData.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-span-full border-b border-white/5 pb-2 mt-4">
             <h3 className="text-[11px] font-black text-foreground/50 uppercase tracking-[0.2em]">2. Acceso al Broker</h3>
          </div>

          <div className="space-y-3">
            <Label className={labelClasses}>Plataforma / Gateway</Label>
            <ModernSelect
              options={BROKERS}
              value={formData.broker || "mt4"}
              onChange={(v) => handleSelectChange("broker", v)}
            />
          </div>

          <div className="space-y-3">
            <Label className={labelClasses}>Login / Account Number</Label>
            <Input
              name="login"
              placeholder="Ej: 8820491"
              className={inputClasses}
              value={formData.login || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-3">
            <Label className={labelClasses}>Contraseña (Trading Password)</Label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              className={inputClasses}
              value={formData.password || ""}
              onChange={handleInputChange}
              required={!formData.account_id}
            />
          </div>

          <div className="space-y-3">
            <Label className={labelClasses}>Servidor DNS</Label>
            <Input
              name="server"
              placeholder={selectedBroker?.servers || "Especifique servidor"}
              className={inputClasses}
              value={formData.server || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-3">
             <Label className={labelClasses}>Entorno</Label>
             <ModernSelect
               options={[
                 { value: "Detect", label: "Auto Detectar" },
                 { value: "Real", label: "Real / Producción" },
                 { value: "Demo", label: "Demo / Simulación" }
               ]}
               value={formData.environment || "Detect"}
               onChange={(v) => handleSelectChange("environment", v)}
               disabled={!showEnvironment}
             />
          </div>

          <div className="space-y-3">
             <Label className={labelClasses}>Estado Inicial</Label>
             <ModernSelect
               options={[
                 { value: 1, label: "HABILITADA (Conectar)" },
                 { value: 0, label: "DESACTIVADA" }
               ]}
               value={formData.status ?? 1}
               onChange={(v) => handleSelectChange("status", v)}
             />
          </div>

          <div className="col-span-full pt-10 flex justify-end gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                className="rounded-2xl px-8 h-12 text-muted-foreground hover:bg-white/5 transition-all"
                onClick={onCancel}
              >
                Cerrar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="rounded-2xl px-16 h-12 bg-primary hover:bg-primary/90 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (formData.account_id ? "Actualizar" : "Vincular")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
