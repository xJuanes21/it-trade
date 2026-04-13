"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RiskFactorType, FormatType } from "@/lib/copy-trader-types";
import { ChevronDown, Loader2, Info, Globe, Shield, Activity, Target } from "lucide-react";
import { ModernSelect } from "@/components/ui/ModernSelect";

const RISK_TYPES = [
  { value: 0, label: "Auto Risk (Equity)" },
  { value: 1, label: "Auto Risk (Balance)" },
  { value: 2, label: "Auto Risk (Free Margin)" },
  { value: 3, label: "Multiplicador (Notional)" },
  { value: 4, label: "Lote Fijo" },
  { value: 11, label: "Multiplicador (Lote)" },
];

const FORMATS = [
  { value: 0, label: "% (Porcentaje)" },
  { value: 1, label: "Monto (Dinero)" },
  { value: 2, label: "Pips" },
  { value: 3, label: "Decimal" },
];

function Section({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon?: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={cn(
      "border border-white/5 rounded-2xl mb-6 transition-all",
      isOpen ? "bg-white/[0.02] ring-1 ring-white/5" : "bg-black/20"
    )}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className={isOpen ? "text-primary" : "text-muted-foreground"} />}
          <span className={cn("text-sm font-bold tracking-tight", isOpen ? "text-primary" : "text-foreground/80")}>
            {title}
          </span>
        </div>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="px-6 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

interface TemplateFormProps {
  initialData?: any;
  masters: any[];
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function TemplateForm({ initialData, masters, onSubmit, onCancel }: TemplateFormProps) {
  // Metadata fields
  const [info, setInfo] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    masterAccountId: initialData?.masterAccountId || "",
    investment_min: initialData?.investment_min || 500,
    monthly_fee: initialData?.monthly_fee || 0,
    isPublic: initialData?.isPublic ?? true,
  });

  // Technical Settings fields
  const [settings, setSettings] = useState<Record<string, any>>(initialData?.settings || {
    risk_factor_type: 3,
    risk_factor_value: 1.0,
    copier_status: 1,
    pending_order: 1,
    stop_loss: 0,
    take_profit: 0,
    stop_loss_fixed_format: 2,
    take_profit_fixed_format: 2,
    order_side: 0,
  });

  useEffect(() => {
    if (initialData) {
      setInfo({
        name: initialData.name || "",
        description: initialData.description || "",
        masterAccountId: initialData.masterAccountId || "",
        investment_min: initialData.investment_min || 500,
        monthly_fee: initialData.monthly_fee || 0,
        isPublic: initialData.isPublic ?? true,
      });
      if (initialData.settings) {
        setSettings(prev => ({ ...prev, ...initialData.settings }));
      }
    }
  }, [initialData]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInfo(p => ({ 
      ...p, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSettingsChange = (name: string, value: any) => {
    setSettings(p => ({
      ...p,
      [name]: ["value", "type", "status", "format", "side", "order", "round", "split"].some(k => name.includes(k)) 
        ? (value === "" ? undefined : Number(value)) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!info.name.trim()) return setError("El nombre es requerido.");
    if (!info.masterAccountId) return setError("Debes seleccionar una cuenta Master proveedora.");
    if (settings.risk_factor_value <= 0) return setError("El valor de riesgo multiplicador debe ser mayor a 0.");

    setLoading(true);
    if (onSubmit) {
      await onSubmit({
        id: initialData?.id,
        ...info,
        settings: { ...settings }
      });
    }
    setLoading(false);
  };

  const inputClasses = "bg-white/[0.03] border-white/10 rounded-xl h-11 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all w-full text-sm placeholder:text-muted-foreground/30";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 mb-2.5 block";

  const masterOptions = masters.map(m => ({
    value: m.account_id,
    label: `${m.name} (${m.login}) - ${m.server}`
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl mb-8 flex items-center gap-3">
          <Info size={16} />
          {error}
        </div>
      )}

      <Section title="Información del Modelo" icon={Globe} defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label className={labelClasses}>Nombre Comercial del Modelo</Label>
            <Input 
              name="name" 
              placeholder="Ej: Alpha Scalper Pro" 
              className={inputClasses} 
              value={info.name} 
              onChange={handleInfoChange} 
            />
          </div>
          <div className="md:col-span-2">
            <Label className={labelClasses}>Propuesta de Valor / Descripción</Label>
            <Input 
              name="description" 
              placeholder="Ej: Algoritmo de alta frecuencia especializado en el par EURUSD." 
              className={inputClasses} 
              value={info.description} 
              onChange={handleInfoChange} 
            />
          </div>
          <div>
            <Label className={labelClasses}>Cuenta Master (Señales)</Label>
            <ModernSelect
              options={masterOptions}
              value={info.masterAccountId}
              onChange={(val) => setInfo(p => ({ ...p, masterAccountId: String(val) }))}
              placeholder="Seleccionar origen..."
            />
          </div>
          <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-2xl p-4">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe size={20} />
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-primary tracking-wider">Visibilidad Global</p>
                <p className="text-[9px] text-muted-foreground">Esta plantilla aparecerá en el catálogo para otros usuarios.</p>
             </div>
             <input 
               type="checkbox" 
               name="isPublic" 
               checked={info.isPublic} 
               onChange={handleInfoChange}
               className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
             />
          </div>
        </div>
      </Section>

      <Section title="Estrategia y Gestión de Riesgo" icon={Activity} defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label className={labelClasses}>Modo de Volumen</Label>
            <ModernSelect
              options={RISK_TYPES}
              value={settings.risk_factor_type}
              onChange={(val) => handleSettingsChange("risk_factor_type", val)}
            />
          </div>
          <div>
            <Label className={labelClasses}>Multiplicador / Lote</Label>
            <Input 
              name="risk_factor_value" 
              type="number" 
              step="0.01" 
              className={inputClasses} 
              value={settings.risk_factor_value} 
              onChange={(e) => handleSettingsChange("risk_factor_value", e.target.value)} 
            />
          </div>
          <div>
             <Label className={labelClasses}>Slippage Máx (Pips)</Label>
             <Input 
               name="max_slippage" 
               type="number" 
               className={inputClasses} 
               value={settings.max_slippage || ""} 
               onChange={(e) => handleSettingsChange("max_slippage", e.target.value)} 
             />
          </div>
          <div>
             <Label className={labelClasses}>Lote Máximo</Label>
             <Input 
               name="max_order_size" 
               type="number" 
               className={inputClasses} 
               value={settings.max_order_size || ""} 
               onChange={(e) => handleSettingsChange("max_order_size", e.target.value)} 
             />
          </div>
          <div>
            <Label className={labelClasses}>Órdenes Pendientes</Label>
            <ModernSelect
              options={[
                { value: 1, label: "Copiar Limit / Stop" },
                { value: 0, label: "Solo Mercado" }
              ]}
              value={settings.pending_order}
              onChange={(val) => handleSettingsChange("pending_order", val)}
            />
          </div>
          <div>
            <Label className={labelClasses}>Lado de la Operación</Label>
            <ModernSelect
              options={[
                { value: 0, label: "Ambos (Buy & Sell)" },
                { value: 1, label: "Solo Compras (Buy)" },
                { value: 2, label: "Solo Ventas (Sell)" }
              ]}
              value={settings.order_side ?? 0}
              onChange={(val) => handleSettingsChange("order_side", val)}
            />
          </div>
          <div>
             <Label className={labelClasses}>Delay Máximo (Seg)</Label>
             <Input 
               name="max_delay" 
               type="number" 
               placeholder="Ej: 30"
               className={inputClasses} 
               value={settings.max_delay || ""} 
               onChange={(e) => handleSettingsChange("max_delay", e.target.value)} 
             />
          </div>
        </div>
      </Section>

      <Section title="Protecciones de Seguridad (SL/TP)" icon={Shield}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className={cn(labelClasses, "text-red-400 opacity-100")}>Stop Loss (Servidor de IT TRADE)</Label>
              <ModernSelect
                options={[
                  { value: 0, label: "Desactivado (Heredar)" },
                  { value: 1, label: "Activar SL Fijo" }
                ]}
                value={settings.stop_loss}
                onChange={(val) => handleSettingsChange("stop_loss", val)}
                className="border-red-500/20"
              />
              {settings.stop_loss === 1 && (
                <div className="flex gap-3 animate-in zoom-in-95 duration-200">
                  <Input 
                    type="number" 
                    placeholder="Valor" 
                    className={cn(inputClasses, "w-24")} 
                    value={settings.stop_loss_fixed_value || ""} 
                    onChange={(e) => handleSettingsChange("stop_loss_fixed_value", e.target.value)} 
                  />
                  <div className="flex-1">
                    <ModernSelect
                      options={FORMATS}
                      value={settings.stop_loss_fixed_format}
                      onChange={(val) => handleSettingsChange("stop_loss_fixed_format", val)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className={cn(labelClasses, "text-emerald-400 opacity-100")}>Take Profit (Servidor de IT TRADE)</Label>
              <ModernSelect
                options={[
                  { value: 0, label: "Desactivado (Heredar)" },
                  { value: 1, label: "Activar TP Fijo" }
                ]}
                value={settings.take_profit}
                onChange={(val) => handleSettingsChange("take_profit", val)}
                className="border-emerald-500/20"
              />
              {settings.take_profit === 1 && (
                <div className="flex gap-3 animate-in zoom-in-95 duration-200">
                  <Input 
                    type="number" 
                    placeholder="Valor" 
                    className={cn(inputClasses, "w-24")} 
                    value={settings.take_profit_fixed_value || ""} 
                    onChange={(e) => handleSettingsChange("take_profit_fixed_value", e.target.value)} 
                  />
                  <div className="flex-1">
                    <ModernSelect
                      options={FORMATS}
                      value={settings.take_profit_fixed_format}
                      onChange={(val) => handleSettingsChange("take_profit_fixed_format", val)}
                    />
                  </div>
                </div>
              )}
            </div>
         </div>
      </Section>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-10">
        {onCancel && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel} 
            className="rounded-2xl h-12 px-8 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
          >
            Cancelar Cambios
          </Button>
        )}
        <Button 
          disabled={loading} 
          type="submit" 
          className="rounded-2xl px-12 h-12 bg-primary hover:bg-primary/90 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
        >
          {loading ? (
             <Loader2 size={16} className="animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <Target size={16} />
              {initialData?.id ? "Guardar Cambios" : "Lanzar al Mercado Global"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
