"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Play, Shield, Loader2 } from "lucide-react";
import { ModernSelect } from "@/components/ui/ModernSelect";

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slaveId: string) => Promise<void>;
  slaves: any[];
  templateName: string;
}

export function FollowModal({
  isOpen,
  onClose,
  onConfirm,
  slaves,
  templateName,
}: FollowModalProps) {
  const [selectedSlave, setSelectedSlave] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedSlave) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selectedSlave);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slaveOptions = slaves.map(s => ({
    value: s.account_id,
    label: `${s.alias || s.account_id} (${s.broker})`
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-card border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
              <Shield size={28} />
            </div>
            <Button 
               variant="ghost" 
               size="icon" 
               onClick={onClose}
               className="rounded-full h-12 w-12 hover:bg-white/5"
            >
              <X size={24} />
            </Button>
          </div>

          <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-2">Suscripción Estratégica</p>
          <h3 className="text-3xl font-black text-foreground mb-4 leading-tight">
            Seguir a {templateName}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Selecciona la cuenta **ESCLAVA** que replicará las operaciones de esta plantilla. Las configuraciones de riesgo se aplicarán automáticamente.
          </p>

          <div className="space-y-6 mb-10">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">
                Cuenta Esclava (Slave)
              </label>
              <ModernSelect
                options={slaveOptions}
                value={selectedSlave}
                onChange={(val) => setSelectedSlave(String(val))}
                placeholder="Escoge tu cuenta de copiado..."
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedSlave || isSubmitting}
            className="w-full rounded-2xl h-14 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Play size={18} className="mr-2" />
            )}
            Activar Copiado
          </Button>
        </div>
      </div>
    </div>
  );
}
