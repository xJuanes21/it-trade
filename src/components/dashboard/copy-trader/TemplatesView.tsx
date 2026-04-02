"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TemplatesHeader } from "./components/TemplatesHeader";
import { TemplatesList } from "./components/TemplatesList";
import { TemplatesModals } from "./components/TemplatesModals";
import { ConfirmModal } from "./components/ConfirmModal";

// Sub-components

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TemplateModel {
  id: string;
  group_id?: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  isExternalOnly?: boolean;
  userId?: string;
  masterAccountId?: string;
  user?: { name?: string };
  settings?: { risk_factor_value?: number };
  modelConfig?: { name?: string };
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function TemplatesView() {
  const { data: session } = useSession();

  // Data State
  const [models, setModels] = useState<TemplateModel[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [slaves, setSlaves] = useState<any[]>([]);
  const [apiTemplates, setApiTemplates] = useState<any[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [followTarget, setFollowTarget] = useState<TemplateModel | null>(null);
  const [unfollowTarget, setUnfollowTarget] = useState<TemplateModel | null>(
    null,
  );
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [cloneData, setCloneData] = useState<any>(null);

  // Pagination
  const [myPage, setMyPage] = useState(1);
  const [sharedPage, setSharedPage] = useState(1);
  const itemsPerPageMy = 3;
  const itemsPerPageShared = 3;

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modelsRes, accountsRes, apiTemplatesRes] = await Promise.all([
        fetch("/api/v1/models/get").then((r) => r.json()),
        tradeCopierService.getAccounts(),
        tradeCopierService
          .getTemplates()
          .catch(() => ({ status: "error", data: { groups: [] } })),
      ]);

      if (modelsRes.success) setModels(modelsRes.data.models);

      if (accountsRes.status === "success" && accountsRes.data?.accounts) {
        const all = accountsRes.data.accounts;
        setMasters(all.filter((a: any) => a.type === 0));
        setSlaves(all.filter((a: any) => a.type === 1));
      }

      if (
        apiTemplatesRes.status === "success" &&
        apiTemplatesRes.data?.groups
      ) {
        setApiTemplates(apiTemplatesRes.data.groups);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const userRole = session?.user?.role || "user";
  const userId = session?.user?.id;
  const isTrader = userRole === "trader" || userRole === "superadmin";

  const myTemplates = useMemo(() => {
    // 1. Templates I created
    const owned = models.filter((t) => t.userId === userId);
    // 2. Templates I'm following (my slaves are linked to their group_id)
    const followed = models
      .filter(
        (t) =>
          t.userId !== userId && slaves.some((s) => s.groupid === t.group_id),
      )
      .map((t) => ({ ...t, isFollowed: true }));

    // Merge and remove duplicates (though IDs should be unique)
    const combined = [...owned, ...followed];
    return combined.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
    );
  }, [models, userId, slaves]);

  const sharedTemplates = useMemo(() => {
    const localPublic = models
      .filter((t) => t.isPublic)
      .map((t) => ({
        ...t,
        isFollowedByMe: slaves.some((s) => s.groupid === t.group_id),
      }));

    const externalOnly = apiTemplates
      .filter((group) => !models.some((m) => m.group_id === group.group_id))
      .map((group) => ({
        id: `ext-${group.group_id}`,
        group_id: group.group_id,
        name: group.name,
        description:
          "Template detectado en el Servidor de IT TRADE. Importación automática lista.",
        isPublic: true,
        isExternalOnly: true,
        user: { name: "System / API" },
        settings: { risk_factor_value: 1 },
        isFollowedByMe: slaves.some((s) => s.groupid === group.group_id),
      }));

    const merged = [...localPublic, ...externalOnly];
    if (!searchQuery) return merged;

    const q = searchQuery.toLowerCase();
    return merged.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.user?.name?.toLowerCase().includes(q),
    );
  }, [models, apiTemplates, searchQuery]);

  // Pagination resets
  useEffect(() => {
    setMyPage(1);
  }, [searchQuery, models.length]);
  useEffect(() => {
    setSharedPage(1);
  }, [searchQuery, apiTemplates.length]);

  // Paginated slices
  const paginatedMy = myTemplates.slice(
    (myPage - 1) * itemsPerPageMy,
    myPage * itemsPerPageMy,
  );
  const paginatedShared = sharedTemplates.slice(
    (sharedPage - 1) * itemsPerPageShared,
    sharedPage * itemsPerPageShared,
  );

  const totalPagesMy = Math.ceil(myTemplates.length / itemsPerPageMy);
  const totalPagesShared = Math.ceil(
    sharedTemplates.length / itemsPerPageShared,
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/v1/models/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        setModels((prev) => prev.filter((m) => m.id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message || result.error);
      }
    } catch {
      toast.error("Error al eliminar");
    }
  }, []);

  const handleCreate = useCallback(async (data: any) => {
    try {
      const res = await fetch("/api/v1/models/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setModels((prev) => [result.data, ...prev]);
        setIsAdding(false);
        setCloneData(null);
        toast.success("Plantilla creada y sincronizada");
      } else {
        toast.error(result.error || "Error al crear");
      }
    } catch {
      toast.error("Error de conexión");
    }
  }, []);

  const handleUpdate = useCallback(async (data: any) => {
    try {
      const res = await fetch("/api/v1/models/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setModels((prev) =>
          prev.map((m) => (m.id === data.id ? { ...m, ...result.data } : m)),
        );
        setEditingId(null);
        toast.success("Sincronizado");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al actualizar");
    }
  }, []);

  const handleClone = useCallback(
    async (template: TemplateModel) => {
      if (masters.length === 0) {
        toast.error("Necesitas una cuenta MASTER para clonar una estrategia");
        return;
      }

      setLoading(true);
      try {
        const settingsRes = await tradeCopierService.getSettings({
          id_group: template.group_id,
        });
        if (
          settingsRes.status === "success" &&
          settingsRes.data?.settings?.[0]
        ) {
          const orig = settingsRes.data.settings[0];
          setCloneData({
            name: `${template.name} (Clone)`,
            description: template.description,
            risk_factor_value: orig.risk_factor_value,
            stop_loss_behavior: orig.stop_loss_behavior,
            take_profit_behavior: orig.take_profit_behavior,
            risk_factor_type: orig.risk_factor_type,
            isPublic: false,
          });
          setIsAdding(true);
        } else {
          toast.error("No se pudieron obtener los settings originales");
        }
      } catch {
        toast.error("Error al leer parámetros del Servidor de IT TRADE");
      } finally {
        setLoading(false);
      }
    },
    [masters],
  );

  const handleFollow = useCallback(
    (template: TemplateModel) => {
      if (slaves.length === 0) {
        toast.error("No tienes cuentas esclavas configuradas.");
        return;
      }
      setFollowTarget(template);
    },
    [slaves],
  );

  const confirmFollow = useCallback(
    async (slaveId: string) => {
      try {
        const res = await tradeCopierService.setSettings([
          {
            id_slave: slaveId,
            id_group: followTarget?.group_id,
            copier_status: 1,
            // Required fields for a valid setting entry
            risk_factor_value: 1.0,
            risk_factor_type: 3,
            pending_order: 1,
            stop_loss: 0,
            take_profit: 0,
          },
        ]);

        if (res.status === "success") {
          toast.success(`Tu cuenta ahora sigue a ${followTarget?.name}`);
          setFollowTarget(null);
          fetchData();
        } else {
          toast.error("Error al vincular en la API");
        }
      } catch {
        toast.error("Error de red");
      }
    },
    [followTarget, fetchData],
  );

  const handleUnfollow = useCallback(async () => {
    if (!unfollowTarget) return;
    const template = unfollowTarget;
    const followers = slaves.filter((s) => s.groupid === template.group_id);

    if (followers.length === 0) {
      setUnfollowTarget(null);
      return;
    }

    setIsUnfollowing(true);
    try {
      const res = await tradeCopierService.setSettings(
        followers.map((s) => ({
          id_slave: s.account_id,
          id_group: template.group_id,
          copier_status: 0, // Stop copying
        })),
      );

      if (res.status === "success") {
        toast.success(`Has dejado de seguir a ${template.name}`);
        setUnfollowTarget(null);
        fetchData();
      } else {
        toast.error("Error al desvincular");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsUnfollowing(false);
    }
  }, [unfollowTarget, slaves, fetchData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading && models.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-12 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <TemplatesHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isTrader={isTrader}
          onNewTemplate={() => {
            setCloneData(null);
            setIsAdding(true);
          }}
        />

        {/* Lists */}
        <div className="flex flex-col gap-16">
          <TemplatesList
            title={
              userRole === "user" ? "Mis Plantillas Activas" : "Mis Plantillas"
            }
            accentColor="primary"
            badge={`${myTemplates.length} ACTIVAS`}
            templates={paginatedMy}
            emptyTitle={
              userRole === "user"
                ? "No has copiado ninguna plantilla"
                : "No has creado ninguna plantilla"
            }
            emptyDescription={
              userRole === "user"
                ? "Explora el catálogo global para empezar a operar."
                : "Crea tu primera plantilla para empezar a compartir tu estrategia."
            }
            variant="own"
            masters={masters}
            editingId={editingId}
            onEdit={setEditingId}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onUnfollow={setUnfollowTarget}
            onCancelEdit={() => setEditingId(null)}
            currentPage={myPage}
            totalPages={totalPagesMy}
            onPageChange={setMyPage}
          />

          <TemplatesList
            title="Plantillas Globales"
            accentColor="blue-500"
            badge={`${sharedTemplates.length} DISPONIBLES`}
            templates={paginatedShared}
            emptyTitle="No hay plantillas compartidas"
            emptyDescription="Aún no se han publicado plantillas."
            variant="shared"
            hasSlave={slaves.length > 0}
            isTrader={isTrader}
            onClone={handleClone}
            onFollow={handleFollow}
            showSlaveWarning={slaves.length === 0 && userRole === "user"}
            currentPage={sharedPage}
            totalPages={totalPagesShared}
            onPageChange={setSharedPage}
          />
        </div>

        {/* Modals */}
        <TemplatesModals
          isAdding={isAdding}
          cloneData={cloneData}
          masters={masters}
          onCloseAdd={() => {
            setIsAdding(false);
            setCloneData(null);
          }}
          onCreate={handleCreate}
          followTarget={followTarget}
          onCloseFollow={() => setFollowTarget(null)}
          onConfirmFollow={confirmFollow}
          slaves={slaves}
        />

        {/* Confirm Unfollow Modal */}
        <ConfirmModal
          isOpen={!!unfollowTarget}
          onClose={() => setUnfollowTarget(null)}
          onConfirm={handleUnfollow}
          title="Dejar de seguir"
          description={`¿Estás seguro de que deseas dejar de seguir la estrategia "${unfollowTarget?.name}"? Todas tus cuentas esclavas dejarán de copiar sus operaciones inmediatamente.`}
          confirmText="Dejar de seguir"
          cancelText="Mantener suscripción"
          variant="danger"
          isLoading={isUnfollowing}
        />
      </div>
    </TooltipProvider>
  );
}
