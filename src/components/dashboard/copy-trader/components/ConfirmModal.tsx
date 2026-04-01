import React from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "p-3 rounded-2xl ring-1",
              variant === "danger" ? "bg-red-500/10 text-red-500 ring-red-500/20" : 
              variant === "warning" ? "bg-amber-500/10 text-amber-500 ring-amber-500/20" : 
              "bg-primary/10 text-primary ring-primary/20"
            )}>
              <AlertTriangle size={24} />
            </div>
            <Button 
               variant="ghost" 
               size="icon" 
               onClick={onClose}
               className="rounded-full h-10 w-10 hover:bg-white/5"
            >
              <X size={20} />
            </Button>
          </div>

          <h3 className="text-2xl font-black text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-2xl h-12 font-bold hover:bg-white/5 border border-white/5"
            >
              {cancelText}
            </Button>
            <Button
              variant="default"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-2xl h-12 font-bold shadow-lg text-white",
                variant === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : 
                variant === "warning" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : 
                "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {isLoading ? "Procesando..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
