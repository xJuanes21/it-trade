import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Account } from "@/lib/copy-trader-types";
import { cn } from "@/lib/utils";
import { ShieldAlert, Target, Zap, Loader2, CheckCircle2, AlertCircle, ChevronDown, Users, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { tradeCopierService } from "@/services/trade-copier.service";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const RISK_TYPES = [
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

const COPIER_STATUSES = [
  { value: 1, label: "Activo (Copiando)" },
  { value: 0, label: "Congelado (Pausado)" },
  { value: -1, label: "Solo Cierre" },
  { value: 2, label: "Solo Apertura" },
];

const FORMATS = [
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
    <div className="border border-border rounded-2xl bg-muted/30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={accentColor}>{icon}</span>
          <span className="text-sm font-black uppercase tracking-tight">{title}</span>
          {required && (
            <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black">REQUERIDO</span>
          )}
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

// ─── Component ───────────────────────────────────────────────────────────────

interface ModelConfigFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ModelConfigForm({ initialData, onSuccess, onCancel }: ModelConfigFormProps) {
  const router = useRouter();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  const [selectedMaster, setSelectedMaster] = useState<string>(initialData?.masterAccountId || "");
  const [selectedSlave, setSelectedSlave] = useState<string>(initialData?.slaveAccountId || "");

  const [settings, setSettings] = useState<Record<string, any>>(initialData || {
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

  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const res = await tradeCopierService.getAccounts();
        if (res.status === "success") {
          setAccounts(res.data.accounts || []);
        }
      } catch (err) {
        console.error("Failed to fetch accounts for config form", err);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  // Synchronize state with initialData to ensure Edit mode always pre-fills correctly
  useEffect(() => {
    if (initialData) {
      setSelectedMaster(initialData.masterAccountId || "");
      setSelectedSlave(initialData.slaveAccountId || "");
      setSettings(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleSelectChange = (name: string, value: string | number) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: ["value", "lots", "size", "limit", "id"].some(k => name.toLowerCase().includes(k)) ? Number(value) : value
    }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedMaster) errors.id_master = "Debes seleccionar un Master.";
    if (!selectedSlave) errors.id_slave = "Debes seleccionar un Slave.";
    if (settings.risk_factor_value !== undefined && settings.risk_factor_value <= 0) {
      errors.risk_factor_value = "El valor debe ser mayor a 0.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!validate()) {
      setMessage({ type: "error", text: "Faltan datos obligatorios para la sincronización." });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        masterAccountId: selectedMaster,
        slaveAccountId: selectedSlave,
        ...settings
      };

      const res = await fetch("/api/v1/trade-copier/personal-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success(initialData?.id ? "Configuración 1-a-1 actualizada" : "Configuración 1-a-1 creada exitosamente");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || data.message || "Error al sincronizar con el servidor.");
      }
    } catch (error: any) {
      console.error("Config Sync Error:", error);
      setMessage({ type: "error", text: error.message || "Error de conexión con el Servidor IT TRADE." });
    } finally {
      setLoading(false);
    }
  };

  const masterOptions = accounts
    .filter(a => a.type === 0 && a.isOwner)
    .map(a => ({ value: a.account_id, label: `${a.name} (${a.login})` }));

  const slaveOptions = accounts
    .filter(a => a.type === 1)
    .map(a => ({ value: a.account_id, label: `${a.name} (${a.login}) [${a.ownerEmail || 'User'}]` }));

  const inputClasses = "bg-muted/50 border border-input rounded-xl h-11 focus:ring-primary focus:border-primary transition-all px-4 text-sm text-foreground";
  const labelClasses = "text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2 mb-2 block";
  const errorClasses = "text-[10px] text-destructive font-bold mt-1";

  return (
    <Card className="max-w-4xl mx-auto glass-widget shadow-2xl overflow-hidden rounded-[2.5rem] mb-20 animate-in fade-in duration-700">
      <CardHeader className="p-10 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <div className="flex items-center gap-3 mb-3">
           <div className="h-0.5 w-10 bg-indigo-500" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Advanced 1-a-1 Sync</p>
        </div>
        <CardTitle className="text-4xl font-black text-foreground tracking-tight">
          Configuración Directa
        </CardTitle>
        <CardDescription className="font-medium mt-2 text-muted-foreground max-w-lg leading-relaxed">
          Puente técnico de alta precisión. Establece reglas de copiado personalizadas directamente entre un Master y un Slave específico.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-10">
        {message && (
          <div className={cn(
            "mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl",
            message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-100"
          )}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold uppercase tracking-tight">{message.text}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          <Section 
            title="Selección de Cuentas (Sync 1-a-1)" 
            icon={<Users size={18} />} 
            defaultOpen={true}
            required
            accentColor="text-indigo-400"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
              <div className="space-y-2">
                <Label className={labelClasses}>Cuenta MASTER (Tuya) <span className="text-red-400">*</span></Label>
                <ModernSelect
                  options={masterOptions}
                  value={selectedMaster}
                  onChange={(v) => setSelectedMaster(String(v))}
                  placeholder={loadingAccounts ? "Cargando..." : "Selecciona tu Master"}
                />
                {validationErrors.id_master && <p className={errorClasses}>{validationErrors.id_master}</p>}
              </div>

              <div className="space-y-2">
                <Label className={labelClasses}>Cuenta SLAVE (Cualquier Usuario) <span className="text-red-400">*</span></Label>
                <ModernSelect
                  options={slaveOptions}
                  value={selectedSlave}
                  onChange={(v) => setSelectedSlave(String(v))}
                  placeholder={loadingAccounts ? "Cargando..." : "Selecciona el Slave"}
                />
                {validationErrors.id_slave && <p className={errorClasses}>{validationErrors.id_slave}</p>}
              </div>
            </div>
            {selectedMaster && selectedSlave && (
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                 <Server size={18} className="text-primary shrink-0" />
                 <p className="text-xs font-medium text-muted-foreground leading-snug">
                   Sincronizando relación técnica entre la cuenta <span className="text-white font-bold">{selectedMaster}</span> y 
                   la cuenta esclava <span className="text-white font-bold">{selectedSlave}</span> en el Servidor de IT TRADE.
                 </p>
              </div>
            )}
          </Section>

          <Section 
            title="Estrategia de Volumen y Riesgo" 
            icon={<Target size={18} />} 
            defaultOpen={true}
            required
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
              <div className="space-y-2">
                <Label className={labelClasses}>Método de Gestión Monetaria</Label>
                <ModernSelect
                  options={RISK_TYPES}
                  value={settings.risk_factor_type}
                  onChange={(v) => handleSelectChange("risk_factor_type", v)}
                />
              </div>

              <div className="space-y-2">
                <Label className={labelClasses}>Multiplicador de señal <span className="text-red-400">*</span></Label>
                <Input 
                  name="risk_factor_value" type="number" step="0.01"
                  className={cn(inputClasses, "w-full", validationErrors.risk_factor_value && "border-red-500/50")} 
                  value={settings.risk_factor_value} onChange={handleInputChange} 
                />
                {validationErrors.risk_factor_value && <p className={errorClasses}>{validationErrors.risk_factor_value}</p>}
              </div>

              <div className="space-y-2">
                <Label className={labelClasses}>Estado Operativo</Label>
                <ModernSelect
                  options={COPIER_STATUSES}
                  value={settings.copier_status}
                  onChange={(v) => handleSelectChange("copier_status", v)}
                />
              </div>

              <div className="space-y-2">
                <Label className={labelClasses}>Dirección a Suscribir</Label>
                <ModernSelect
                  options={[
                    { value: 0, label: "Bidirectional (Buy & Sell)" },
                    { value: 1, label: "Solo Compras (Buy Only)" },
                    { value: -1, label: "Solo Ventas (Sell Only)" }
                  ]}
                  value={settings.order_side}
                  onChange={(v) => handleSelectChange("order_side", v)}
                />
              </div>
            </div>
          </Section>

          <Section 
            title="Límites de Ejecución y Filtros" 
            icon={<Zap size={18} />}
            accentColor="text-amber-400"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              <div className="space-y-2">
                <Label className={labelClasses}>Lotaje Mínimo</Label>
                <Input name="min_order_size" type="number" step="0.01" placeholder="0.01" className={inputClasses} value={settings.min_order_size || ""} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>Lotaje Máximo</Label>
                <Input name="max_order_size" type="number" step="0.01" placeholder="100.0" className={inputClasses} value={settings.max_order_size || ""} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>Slippage (Pips)</Label>
                <Input name="max_slippage" type="number" step="0.1" placeholder="3.0" className={inputClasses} value={settings.max_slippage || ""} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>Max Delay (Secs)</Label>
                <Input name="max_delay" type="number" step="1" placeholder="60" className={inputClasses} value={settings.max_delay || ""} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label className={labelClasses}>Copiar Pendientes</Label>
                <ModernSelect
                  options={[
                    { value: 1, label: "Sí (Limit/Stop)" },
                    { value: 0, label: "No (Solo Mercado)" }
                  ]}
                  value={settings.pending_order}
                  onChange={(v) => handleSelectChange("pending_order", v)}
                />
              </div>
            </div>
          </Section>

          <Section 
            title="Políticas de SL y TP Dinámicos" 
            icon={<ShieldAlert size={18} />}
            accentColor="text-red-400"
          >
            <div className="space-y-8 mt-2">
              <div className="p-6 rounded-2xl bg-red-400/5 border border-red-400/10 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-widest">Local Stop Loss Override</p>
                  <ModernSelect
                    options={[
                      { value: 0, label: "Desactivar (Heredar)" },
                      { value: 1, label: "Activar SL Local" }
                    ]}
                    value={settings.stop_loss}
                    onChange={(v) => handleSelectChange("stop_loss", v)}
                    className="w-48"
                  />
                </div>
                {settings.stop_loss === 1 && (
                  <div className="flex gap-4 animate-in zoom-in-95 duration-200 pt-2">
                    <div className="w-1/3">
                      <Label className={labelClasses}>Valor SL</Label>
                      <Input name="stop_loss_fixed_value" type="number" step="0.01" className={inputClasses} value={settings.stop_loss_fixed_value || ""} onChange={handleInputChange} />
                    </div>
                    <div className="flex-1">
                      <Label className={labelClasses}>Formato del Valor</Label>
                      <ModernSelect
                        options={FORMATS}
                        value={settings.stop_loss_fixed_format}
                        onChange={(v) => handleSelectChange("stop_loss_fixed_format", v)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Local Take Profit Override</p>
                  <ModernSelect
                    options={[
                      { value: 0, label: "Desactivar (Heredar)" },
                      { value: 1, label: "Activar TP Local" }
                    ]}
                    value={settings.take_profit}
                    onChange={(v) => handleSelectChange("take_profit", v)}
                    className="w-48"
                  />
                </div>
                {settings.take_profit === 1 && (
                  <div className="flex gap-4 animate-in zoom-in-95 duration-200 pt-2">
                    <div className="w-1/3">
                      <Label className={labelClasses}>Valor TP</Label>
                      <Input name="take_profit_fixed_value" type="number" step="0.01" className={inputClasses} value={settings.take_profit_fixed_value || ""} onChange={handleInputChange} />
                    </div>
                    <div className="flex-1">
                      <Label className={labelClasses}>Formato del Valor</Label>
                      <ModernSelect
                        options={FORMATS}
                        value={settings.take_profit_fixed_format}
                        onChange={(v) => handleSelectChange("take_profit_fixed_format", v)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <div className="pt-10 flex flex-col sm:flex-row justify-end gap-3 border-t border-white/5">
            {onCancel && (
               <Button
                 type="button"
                 variant="ghost"
                 className="rounded-2xl px-10 h-14 text-muted-foreground hover:bg-white/5 transition-all text-sm font-bold"
                 onClick={onCancel}
               >
                  Cancelar
               </Button>
            )}
            <Button
              type="button"
              className="rounded-2xl px-20 h-14 bg-primary hover:bg-primary/90 transition-all font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 flex items-center gap-3 active:scale-95"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <CheckCircle2 size={18} />
                  {initialData ? "Guardar" : "Crear Settings"}
                </>
              )}
            </Button>
          </div>
        </form>

      </CardContent>
    </Card>
  );
}
