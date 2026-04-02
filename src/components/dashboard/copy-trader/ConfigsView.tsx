"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Settings2, ShieldAlert, Plus } from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";
import ModelConfigForm from "@/components/dashboard/copy-trader/ModelConfigForm";
import { SyncConfigCard } from "./components/SyncConfigCard";
import { ConfirmModal } from "./components/ConfirmModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ConfigsView() {
  const { data: session } = useSession();

  // Data State
  const [configs, setConfigs] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [slaves, setSlaves] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter State
  const [selectedMasterFilter, setSelectedMasterFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [configsRes, accountsRes] = await Promise.all([
        fetch("/api/v1/trade-copier/personal-sync").then((r) => r.json()),
        tradeCopierService.getAccounts(),
      ]);

      if (configsRes.status === "success") {
        setConfigs(configsRes.data || []);
      }

      if (accountsRes.status === "success" && accountsRes.data?.accounts) {
        setAccounts(accountsRes.data.accounts);
        const all = accountsRes.data.accounts;
        setMasters(all.filter((a: any) => a.type === 0));
        setSlaves(all.filter((a: any) => a.type === 1));
      }
    } catch (err) {
      console.error("Fetch configs data error:", err);
      toast.error("Error al cargar la gestión 1-a-1");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session, fetchData]);

  const handleDelete = async () => {
    if (!deletingConfig) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/v1/trade-copier/personal-sync?id=${deletingConfig.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data.status === "success") {
        toast.success("Sincronización pausada y eliminada localmente.");
        setConfigs((p) => p.filter((c) => c.id !== deletingConfig.id));
        setDeletingConfig(null);
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error de comunicación.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredConfigs = useMemo(() => {
    if (selectedMasterFilter === "all") return configs;
    return configs.filter((c) => c.masterAccountId === selectedMasterFilter);
  }, [configs, selectedMasterFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedMasterFilter]);

  const paginatedConfigs = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredConfigs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredConfigs, page]);

  const totalPages = Math.ceil(filteredConfigs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium">Cargando relaciones...</p>
      </div>
    );
  }

  // --- RENDERING MODALS FIRST --- //
  if (isAdding || editingConfig) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setEditingConfig(null);
            }}
            className="rounded-xl"
          >
            ← Volver al Listado
          </Button>
        </div>
        <ModelConfigForm
          initialData={editingConfig}
          onSuccess={() => {
            setIsAdding(false);
            setEditingConfig(null);
            fetchData();
          }}
          onCancel={() => {
            setIsAdding(false);
            setEditingConfig(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Settings2 size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Settings Avanzados
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Gestión técnica 1-a-1. Define parámetros de mitigación y
            multiplicadores de copiado exclusivos por cuenta (Overrides).
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(true)}
          className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20"
        >
          <Plus size={18} className="mr-2" />
          Nuevo Setting
        </Button>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* WARNING */}
      <div className="flex flex-col items-center text-center gap-3 p-8 rounded-[2.5rem] bg-secondary border border-border text-muted-foreground max-w-2xl mx-auto shadow-sm">
        <ShieldAlert className="text-primary" size={28} />
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
            Modo Experto: Cuidado (Overrides Activos)
          </p>
          <p className="text-[11px] leading-relaxed font-medium max-w-md mx-auto opacity-80">
            Estas son configuraciones dictadas directamente sobre una cuenta
            Slave. Sustituyen cualquier otra regla global de una plantilla a la
            que estén subscritos y se ejecutan directamente en el servidor de IT
            TRADE.
          </p>
        </div>
      </div>

      {masters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-card/30 rounded-3xl border border-white/5 backdrop-blur-sm">
          <ShieldAlert size={32} className="text-amber-500" />
          <h2 className="text-xl font-bold text-white">
            Requiere Cuenta Master
          </h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Para aplicar overrides técnicos, primero debes vincular al menos una
            cuenta operadora MASTER en la sección de Cuentas.
          </p>
        </div>
      ) : (
        <>
          {/* FILTER TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant={selectedMasterFilter === "all" ? "default" : "outline"}
              className={cn(
                "rounded-2xl text-xs font-bold whitespace-nowrap",
                selectedMasterFilter !== "all" && "border-white/5 bg-black/20",
              )}
              onClick={() => setSelectedMasterFilter("all")}
            >
              Todas las Relaciones
            </Button>
            {masters.map((m) => (
              <Button
                key={m.account_id}
                variant={
                  selectedMasterFilter === m.account_id ? "default" : "outline"
                }
                className={cn(
                  "rounded-2xl text-xs font-bold whitespace-nowrap",
                  selectedMasterFilter !== m.account_id &&
                    "border-white/5 bg-black/20",
                )}
                onClick={() => setSelectedMasterFilter(m.account_id)}
              >
                Master: {m.login}
              </Button>
            ))}
          </div>

          {/* LIST */}
          {filteredConfigs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-black/10 rounded-3xl border border-white/5 border-dashed">
              No hay sincronizaciones activas para este filtro.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {paginatedConfigs.map((config) => (
                  <SyncConfigCard
                    key={config.id}
                    config={config}
                    masterAccount={accounts.find(
                      (a) => String(a.account_id) === config.masterAccountId,
                    )}
                    slaveAccount={accounts.find(
                      (a) =>
                        String(a.account_id) === config.slaveAccountId ||
                        String(a.login) === config.slaveAccountId,
                    )}
                    onEdit={(c) => setEditingConfig(c)}
                    onDelete={(c) => setDeletingConfig(c)}
                  />
                ))}
              </div>

               {/* PAGINATION */}
               {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    className="rounded-full h-10 w-10 p-0 border-white/10"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {"<"}
                  </Button>
                  <p className="text-xs font-bold text-muted-foreground">Página {page} de {totalPages}</p>
                  <Button
                    variant="outline"
                    className="rounded-full h-10 w-10 p-0 border-white/10"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {">"}
                  </Button>
                </div>
               )}
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingConfig}
        onClose={() => setDeletingConfig(null)}
        onConfirm={handleDelete}
        title="Eliminar Sincronización"
        description="Esta acción pausará el copiado de forma inmediata y removerá esta configuración override de IT TRADE."
        confirmText="Eliminar Sincronización"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
