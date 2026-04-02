"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout, Pencil, Trash2, ShieldCheck, X } from "lucide-react";
import TemplateForm from "../TemplateForm";
import { ConfirmModal } from "./ConfirmModal";

interface TemplateCardProps {
  template: any;
  masters: any[];
  isEditing: boolean;
  onEdit: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (data: any) => void;
  onUnfollow?: (t: any) => void;
  onCancelEdit: () => void;
}

export function TemplateCard({
  template: t,
  masters,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
  onUnfollow,
  onCancelEdit,
}: TemplateCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    await onDelete(t.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="glass-widget widget-hover rounded-[2.5rem] overflow-hidden group h-full flex flex-col">
        <CardContent className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
              <Layout size={20} />
            </div>
            {!t.isFollowed && (
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(t.id)}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <Pencil size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            )}
            {t.isFollowed && (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-tighter">
                    Suscripción Activa
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onUnfollow?.(t)}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Dejar de seguir"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            )}
          </div>

          <h3 className="font-black text-xl text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {t.name}
          </h3>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mb-4">
            Master: {t.masterAccountId || "N/A"}
          </p>

          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-6 flex-1 opacity-70">
            {t.description || "Sin descripción proporcionada."}
          </p>

          <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-end">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                Risk Factor
              </p>
              <p className="text-sm font-black text-foreground">
                {t.settings?.risk_factor_value || 1}x
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
              <ShieldCheck size={12} /> {t.isPublic ? "Global" : "Privado"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern High-Quality Fullscreen/Overlay Edit State */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-8">
           <div 
             className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500"
           >
              <div className="sticky top-0 z-20 flex items-center justify-between p-8 bg-card/80 backdrop-blur-md border-b border-white/5">
                 <div>
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">Settings </p>
                    <h2 className="text-2xl font-black text-foreground">Configuración de Plantilla</h2>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={onCancelEdit}
                   className="rounded-full h-12 w-12 hover:bg-white/5"
                 >
                    <X size={24} />
                 </Button>
              </div>
              
              <div className="p-8 sm:p-12 pb-60">
                <TemplateForm
                  initialData={t}
                  masters={masters}
                  onSubmit={onUpdate}
                  onCancel={onCancelEdit}
                />
              </div>
           </div>
        </div>
      )}

      {/* Vital Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="¿Eliminar Plantilla?"
        description={`Esta acción eliminará "${t.name}" permanentemente. Si eres el autor original, se borrará también del Servidor de IT TRADE.`}
        confirmText="Eliminar Plantilla"
        variant="danger"
      />
    </>
  );
}
