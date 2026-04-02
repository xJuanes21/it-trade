"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  CopySettings, 
  RiskFactorType, 
  CopierStatus, 
  FormatType,
  Account,
} from "@/lib/copy-trader-types";
import { cn } from "@/lib/utils";
import { 
  ShieldAlert, Target, Zap, Waves, 
  Loader2, CheckCircle2, AlertCircle,
  ChevronDown
} from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";

// ─── Constants ───────────────────────────────────────────────────────────────

const RISK_TYPES: { value: RiskFactorType; label: string }[] = [
  { value: 0, label: "Auto Risk (Equity)" },
  { value: 1, label: "Auto Risk (Balance)" },
  { value: 2, label: "Auto Risk (Free Margin)" },
  { value: 3, label: "Multiplicador (Notional)" },
  { value: 4, label: "Lote Fijo" },
  { value: 5, label: "Apalancamiento Fijo (Equity)" },
  { value: 6, label: "Apalancamiento Fijo (Balance)" },
  { value: 7, label: "Apalancamiento Fijo (Free Margin)" },
  { value: 10, label: "Unidades Fijas" },
  { value: 11, label: "Multiplicador (Lote)" },
];

const COPIER_STATUSES: { value: CopierStatus; label: string }[] = [
  { value: 1, label: "Activo (Copiando)" },
  { value: 0, label: "Congelado (Pausado)" },
  { value: -1, label: "Solo Cierre" },
  { value: 2, label: "Solo Apertura" },
];

const FORMATS: { value: FormatType; label: string }[] = [
  { value: 0, label: "% (Porcentaje)" },
  { value: 1, label: "Monto (Dinero)" },
  { value: 2, label: "Pips" },
  { value: 3, label: "Decimal" },
];

// ─── Collapsible Section Component ───────────────────────────────────────────

function Section({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  accentColor = "text-primary",
  required = false,
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  accentColor?: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={accentColor}>{icon}</span>
          <span className="text-sm font-bold">{title}</span>
          {required && (
            <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">REQUERIDO</span>
          )}
        </div>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="px-4 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SettingsFormProps {
  /** Real accounts fetched from the parent page */
  accounts: Account[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsForm({ accounts }: SettingsFormProps) {
  const masters = accounts.filter((a) => a.type === 0);
  const slaves = accounts.filter((a) => a.type === 1);

  const [settings, setSettings] = useState<Partial<CopySettings>>({
    risk_factor_type: 3,
    risk_factor_value: 1.0,
    copier_status: 1,
    pending_order: 1,
    stop_loss: 0,
    take_profit: 0,
    stop_loss_fixed_format: 2,
    take_profit_fixed_format: 2,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Pre-fill first master when accounts load
  useEffect(() => {
    if (masters.length > 0 && !settings.id_master) {
      setSettings((prev) => ({ ...prev, id_master: masters[0].account_id }));
    }
  }, [accounts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    setSettings((prev) => ({
      ...prev,
      [name]: ["value", "type", "status", "format", "side", "order", "round", "split"].some(k => name.includes(k))
        ? (value === "" ? undefined : Number(value))
        : value,
    }));
  };

  /** Validates required fields before submission */
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Must have at least a slave target
    if (!settings.id_slave) {
      errors.id_slave = "Debes seleccionar una cuenta slave para aplicar la configuración.";
    }

    // Risk factor value must be positive
    if (settings.risk_factor_value !== undefined && settings.risk_factor_value <= 0) {
      errors.risk_factor_value = "El valor debe ser mayor a 0.";
    }

    // Max order size >= Min order size
    if (
      settings.max_order_size !== undefined && 
      settings.min_order_size !== undefined && 
      settings.max_order_size < settings.min_order_size
    ) {
      errors.max_order_size = "El máximo debe ser mayor o igual al mínimo.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!validate()) {
      setMessage({ type: "error", text: "Corrige los campos marcados en rojo." });
      return;
    }

    setLoading(true);

    try {
      // Build clean payload — only send non-empty values
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== "") {
          payload[key] = value;
        }
      }

      const response = await tradeCopierService.setSettings([payload]);

      if (response.status === "success" || response.success) {
        setMessage({ type: "success", text: "Configuración guardada correctamente." });
      } else {
        setMessage({ type: "error", text: response.message || response.error || "Error al guardar la configuración." });
      }
    } catch (error) {
      console.error("Settings Submit Error:", error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────

  const inputClasses = "bg-background border-white/10 rounded-xl focus:ring-primary h-11 px-4 transition-all hover:border-primary/40 text-sm";
  const labelClasses = "text-[11px] uppercase tracking-wider font-bold text-muted-foreground";
  const errorClasses = "text-[10px] text-red-400 mt-1";

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Card className="max-w-3xl mx-auto backdrop-blur-md bg-card/80 border-white/10 shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-5">
        <CardTitle className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Reglas de Ejecución
        </CardTitle>
        <CardDescription className="font-medium mt-1 text-sm">
          Define cómo se copian los trades del Master al Slave. Solo los campos obligatorios son requeridos, el resto es opcional.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Status message */}
        {message && (
          <div className={cn(
            "mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
            message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
          )}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* No accounts warning */}
        {accounts.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">Necesitas vincular al menos una cuenta Master y una Slave antes de configurar las reglas de ejecución.</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          
          {/* ─── SECTION 1: CUENTAS (Required) ─── */}
          <Section 
            title="Cuentas y Riesgo" 
            icon={<Target size={18} />} 
            defaultOpen={true}
            required
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="space-y-2">
                <Label htmlFor="id_master" className={labelClasses}>Cuenta Master (Origen)</Label>
                <select id="id_master" name="id_master" className={cn("w-full appearance-none", inputClasses)} value={settings.id_master || ""} onChange={handleChange}>
                  <option value="">Todos los masters (global)</option>
                  {masters.map(m => ( <option key={m.account_id} value={m.account_id}>{m.name} ({m.login})</option> ))}
                </select>
                <p className="text-[9px] text-muted-foreground">Deja vacío para aplicar a todos los masters.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_slave" className={labelClasses}>
                  Cuenta Slave (Destino) <span className="text-red-400">*</span>
                </Label>
                <select 
                  id="id_slave" 
                  name="id_slave" 
                  className={cn("w-full appearance-none", inputClasses, validationErrors.id_slave && "border-red-500/50")} 
                  value={settings.id_slave || ""} 
                  onChange={handleChange}
                >
                  <option value="">Seleccionar cuenta...</option>
                  {slaves.map(s => ( <option key={s.account_id} value={s.account_id}>{s.name} ({s.login})</option> ))}
                </select>
                {validationErrors.id_slave && <p className={errorClasses}>{validationErrors.id_slave}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_factor_type" className={labelClasses}>Tipo de Riesgo</Label>
                <select id="risk_factor_type" name="risk_factor_type" className={cn("w-full appearance-none", inputClasses)} value={settings.risk_factor_type} onChange={handleChange}>
                  {RISK_TYPES.map(rt => (<option key={rt.value} value={rt.value}>{rt.label}</option>))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_factor_value" className={labelClasses}>
                  Valor / Multiplicador <span className="text-red-400">*</span>
                </Label>
                <Input 
                  id="risk_factor_value" 
                  name="risk_factor_value" 
                  type="number" 
                  step="0.01" 
                  placeholder="Ej: 1.0"
                  className={cn(inputClasses, validationErrors.risk_factor_value && "border-red-500/50")} 
                  value={settings.risk_factor_value} 
                  onChange={handleChange} 
                />
                {validationErrors.risk_factor_value && <p className={errorClasses}>{validationErrors.risk_factor_value}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="copier_status" className={labelClasses}>Estado del Sistema</Label>
                <select id="copier_status" name="copier_status" className={cn("w-full appearance-none", inputClasses)} value={settings.copier_status} onChange={handleChange}>
                  {COPIER_STATUSES.map(cs => (<option key={cs.value} value={cs.value}>{cs.label}</option>))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_side" className={labelClasses}>Dirección de Operaciones</Label>
                <select id="order_side" name="order_side" className={cn("w-full appearance-none", inputClasses)} value={settings.order_side} onChange={handleChange}>
                  <option value={0}>Ambas Direcciones</option>
                  <option value={1}>Solo Compras (Buy)</option>
                  <option value={-1}>Solo Ventas (Sell)</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ─── SECTION 2: EJECUCIÓN (Optional) ─── */}
          <Section 
            title="Ejecución y Límites" 
            icon={<Zap size={18} />}
            accentColor="text-amber-400"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="space-y-2">
                <Label htmlFor="symbol_master" className={labelClasses}>Símbolo Master</Label>
                <Input id="symbol_master" name="symbol_master" placeholder="Ej: EURUSD" className={inputClasses} value={settings.symbol_master || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol" className={labelClasses}>Símbolo Slave</Label>
                <Input id="symbol" name="symbol" placeholder="Ej: EURUSD.m" className={inputClasses} value={settings.symbol || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_order_size" className={labelClasses}>Volumen Mínimo</Label>
                <Input id="min_order_size" name="min_order_size" type="number" step="0.01" placeholder="0.01" className={inputClasses} value={settings.min_order_size || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_order_size" className={labelClasses}>Volumen Máximo</Label>
                <Input 
                  id="max_order_size" name="max_order_size" type="number" step="0.01" placeholder="100.0"
                  className={cn(inputClasses, validationErrors.max_order_size && "border-red-500/50")} 
                  value={settings.max_order_size || ""} onChange={handleChange} 
                />
                {validationErrors.max_order_size && <p className={errorClasses}>{validationErrors.max_order_size}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_slippage" className={labelClasses}>Deslizamiento Máx. (Pips)</Label>
                <Input id="max_slippage" name="max_slippage" type="number" step="0.1" placeholder="3.0" className={inputClasses} value={settings.max_slippage || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_delay" className={labelClasses}>Retardo Máx. (Segundos)</Label>
                <Input id="max_delay" name="max_delay" type="number" step="1" placeholder="60" className={inputClasses} value={settings.max_delay || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className={labelClasses}>Comentario en Órdenes</Label>
                <Input id="comment" name="comment" placeholder="Se añade a cada orden ejecutada" className={inputClasses} value={settings.comment || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pending_order" className={labelClasses}>Copiar Órdenes Pendientes</Label>
                <select id="pending_order" name="pending_order" className={cn("w-full appearance-none", inputClasses)} value={settings.pending_order} onChange={handleChange}>
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ─── SECTION 3: STOP LOSS & TAKE PROFIT (Optional) ─── */}
          <Section 
            title="Stop Loss y Take Profit" 
            icon={<ShieldAlert size={18} />}
            accentColor="text-red-400"
          >
            <div className="space-y-8 mt-2">
              {/* Stop Loss */}
              <div className="p-4 rounded-xl bg-red-500/[0.03] border border-red-500/10 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-red-400 uppercase">Stop Loss</p>
                  <select name="stop_loss" value={settings.stop_loss} onChange={handleChange} className="bg-transparent border-none text-[11px] font-bold text-red-400 cursor-pointer">
                    <option value={0}>Desactivado</option>
                    <option value={1}>Activado (Fijo)</option>
                    <option value={2}>Con Actualizaciones</option>
                  </select>
                </div>
                {(settings.stop_loss !== undefined && settings.stop_loss > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <Label className={labelClasses}>Valor</Label>
                      <Input name="stop_loss_fixed_value" type="number" step="0.01" className={inputClasses} value={settings.stop_loss_fixed_value || ""} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClasses}>Formato</Label>
                      <select name="stop_loss_fixed_format" className={cn("w-full appearance-none", inputClasses)} value={settings.stop_loss_fixed_format} onChange={handleChange}>
                        {FORMATS.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClasses}>Offset</Label>
                      <Input name="stop_loss_offset_value" type="number" step="0.01" placeholder="±" className={inputClasses} value={settings.stop_loss_offset_value || ""} onChange={handleChange} />
                    </div>
                  </div>
                )}
              </div>

              {/* Take Profit */}
              <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-400 uppercase">Take Profit</p>
                  <select name="take_profit" value={settings.take_profit} onChange={handleChange} className="bg-transparent border-none text-[11px] font-bold text-emerald-400 cursor-pointer">
                    <option value={0}>Desactivado</option>
                    <option value={1}>Activado (Fijo)</option>
                    <option value={2}>Con Actualizaciones</option>
                  </select>
                </div>
                {(settings.take_profit !== undefined && settings.take_profit > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <Label className={labelClasses}>Valor</Label>
                      <Input name="take_profit_fixed_value" type="number" step="0.01" className={inputClasses} value={settings.take_profit_fixed_value || ""} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClasses}>Formato</Label>
                      <select name="take_profit_fixed_format" className={cn("w-full appearance-none", inputClasses)} value={settings.take_profit_fixed_format} onChange={handleChange}>
                        {FORMATS.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClasses}>Offset</Label>
                      <Input name="take_profit_offset_value" type="number" step="0.01" placeholder="±" className={inputClasses} value={settings.take_profit_offset_value || ""} onChange={handleChange} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ─── SECTION 4: AVANZADO (Optional) ─── */}
          <Section 
            title="Opciones Avanzadas" 
            icon={<Waves size={18} />}
            accentColor="text-indigo-400"
          >
            <div className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={labelClasses}>Dividir Orden</Label>
                  <select name="split_order" className={cn("w-full appearance-none", inputClasses)} value={settings.split_order} onChange={handleChange}>
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClasses}>Redondear Mín. Arriba</Label>
                  <select name="force_min_round_up" className={cn("w-full appearance-none", inputClasses)} value={settings.force_min_round_up} onChange={handleChange}>
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClasses}>Redondear Siempre Abajo</Label>
                  <select name="round_down" className={cn("w-full appearance-none", inputClasses)} value={settings.round_down} onChange={handleChange}>
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClasses}>Mejora de Precio (Pips)</Label>
                <Input name="price_improvement" type="number" step="0.1" placeholder="0.0" className={cn("max-w-xs", inputClasses)} value={settings.price_improvement || ""} onChange={handleChange} />
              </div>

              {/* Exposure Limits */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Límites de Exposición</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className={labelClasses}>Pos. Máx. (Cuenta / Símbolo)</Label>
                    <div className="flex gap-2">
                      <Input name="max_position_size_a" placeholder="Cuenta" type="number" className={inputClasses} value={settings.max_position_size_a || ""} onChange={handleChange} />
                      <Input name="max_position_size_s" placeholder="Símbolo" type="number" className={inputClasses} value={settings.max_position_size_s || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClasses}>Órd. Abiertas Máx.</Label>
                    <div className="flex gap-2">
                      <Input name="max_open_count_a" placeholder="Cuenta" type="number" className={inputClasses} value={settings.max_open_count_a || ""} onChange={handleChange} />
                      <Input name="max_open_count_s" placeholder="Símbolo" type="number" className={inputClasses} value={settings.max_open_count_s || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClasses}>Órd. Diarias Máx.</Label>
                    <div className="flex gap-2">
                      <Input name="max_daily_order_count_a" placeholder="Cuenta" type="number" className={inputClasses} value={settings.max_daily_order_count_a || ""} onChange={handleChange} />
                      <Input name="max_daily_order_count_s" placeholder="Símbolo" type="number" className={inputClasses} value={settings.max_daily_order_count_s || ""} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Global SL/TP */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">SL/TP Global de Cuenta</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelClasses}>Stop Loss Global</Label>
                    <div className="flex gap-2">
                      <Input name="global_stop_loss_value" placeholder="Valor" type="number" className={inputClasses} value={settings.global_stop_loss_value || ""} onChange={handleChange} />
                      <select name="global_stop_loss_type" className={cn("w-full appearance-none", inputClasses)} value={settings.global_stop_loss_type} onChange={handleChange}>
                        <option value={0}>Solo Cierre</option>
                        <option value={1}>Liquidar</option>
                        <option value={2}>Congelar</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClasses}>Take Profit Global</Label>
                    <div className="flex gap-2">
                      <Input name="global_take_profit_value" placeholder="Valor" type="number" className={inputClasses} value={settings.global_take_profit_value || ""} onChange={handleChange} />
                      <select name="global_take_profit_type" className={cn("w-full appearance-none", inputClasses)} value={settings.global_take_profit_type} onChange={handleChange}>
                        <option value={0}>Solo Cierre</option>
                        <option value={1}>Liquidar</option>
                        <option value={2}>Congelar</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ─── Submit ─── */}
          <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl px-8 h-11 border-white/10 hover:bg-white/5"
              disabled={loading}
              onClick={() => {
                setSettings({
                  risk_factor_type: 3,
                  risk_factor_value: 1.0,
                  copier_status: 1,
                  pending_order: 1,
                  stop_loss: 0,
                  take_profit: 0,
                  stop_loss_fixed_format: 2,
                  take_profit_fixed_format: 2,
                });
                setMessage(null);
                setValidationErrors({});
              }}
            >
              Limpiar
            </Button>
            <Button
              type="button"
              className="rounded-xl px-10 h-11 bg-primary hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
              disabled={loading || accounts.length === 0}
              onClick={handleSubmit}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Guardar Configuración
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
