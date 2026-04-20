"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { Account } from "@/lib/copy-trader-types";
import { tradeCopierService } from "@/services/trade-copier.service";
import { toast } from "sonner";
import { Loader2, UserPlus, Info, X } from "lucide-react";

interface LinkAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess: () => void;
}

export function LinkAccountModal({ isOpen, onClose, account, onSuccess }: LinkAccountModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      fetchUsers();
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/traders?all=true");
      if (res.ok) {
        const data = await res.json();
        const options = data.traders.map((u: any) => ({
          value: u.id,
          label: `${u.name || "Sin nombre"} (${u.email})`,
        }));
        setUsers(options);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!account || !selectedUserId) return;

    setLinking(true);
    try {
      const res = await tradeCopierService.linkAccount(account, selectedUserId);
      if (res.status === "success") {
        toast.success("Cuenta vinculada correctamente.");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Error al vincular la cuenta.");
      }
    } catch (error) {
      console.error("Link error:", error);
      toast.error("Error de conexión al intentar vincular.");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!account?.account_id) return;

    setUnlinking(true);
    try {
      const res = await tradeCopierService.unlinkAccount(account.account_id);
      if (res.status === "success") {
        toast.success("Cuenta desvinculada correctamente.");
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Error al desvincular la cuenta.");
      }
    } catch (error) {
      console.error("Unlink error:", error);
      toast.error("Error de conexión al intentar desvincular.");
    } finally {
      setUnlinking(false);
    }
  };

  const isUnlinked = account?.isOwner === false && !account?.ownerEmail;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-card border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 bg-background">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <UserPlus className="text-primary" size={28} />
          </div>
          
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">Vincular Cuenta</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Sincroniza la cuenta <span className="text-primary font-bold">#{account?.login}</span> con un usuario de la plataforma IT Trade para trazabilidad interna.
          </p>

          <div className="space-y-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex gap-3 text-xs text-emerald-400">
              <Info size={18} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Esta acción establece una vinculación interna para identificar la propiedad de la cuenta dentro de IT Trade.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Usuario IT Trade
              </label>
              <ModernSelect
                value={selectedUserId}
                onChange={(val) => setSelectedUserId(val as string)}
                options={users}
                placeholder={loading ? "Cargando usuarios..." : "Buscar usuario por nombre o email..."}
                className="bg-white/5 border-white/10 h-12"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-10">
            {account?.ownerEmail && !isUnlinked && (
              <Button
                variant="outline"
                onClick={handleUnlink}
                disabled={unlinking || linking}
                className="rounded-xl px-6 h-12 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-500 mr-auto"
              >
                {unlinking ? <Loader2 size={20} className="animate-spin" /> : "Desvincular"}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl px-6 h-12"
              disabled={linking || unlinking}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLink}
              disabled={!selectedUserId || linking || unlinking}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 h-12 gap-2 min-w-[140px] shadow-lg shadow-primary/20"
            >
              {linking ? <Loader2 size={20} className="animate-spin" /> : account?.ownerEmail ? "Cambiar Usuario" : "Vincular"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
