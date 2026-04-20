"use client";

import React, { useState, useEffect } from "react";
import AccountForm from "@/components/dashboard/copy-trader/AccountForm";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, Activity, AlertTriangle, Lock } from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";
import { Account } from "@/lib/copy-trader-types";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
import { AccountsGrid } from "@/components/dashboard/copy-trader/components/AccountsGrid";
import { LinkAccountModal } from "@/components/dashboard/copy-trader/components/LinkAccountModal";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { useSearchParams } from "next/navigation";

export default function CopyTraderAccountsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isSuperAdmin = session?.user?.role === "superadmin";
  const isTrader = session?.user?.role === "trader";
  const canClassify = isSuperAdmin || isTrader;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<string>("me");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    accountId: string | null;
    isRequest?: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    variant?: "danger" | "primary";
  }>({
    isOpen: false,
    accountId: null,
  });

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    account: Account | null;
  }>({
    isOpen: false,
    account: null,
  });

  const [togglingAccountId, setTogglingAccountId] = useState<string | null>(null);

  const [promoteModal, setPromoteModal] = useState<{
    isOpen: boolean;
    account: Account | null;
  }>({
    isOpen: false,
    account: null,
  });

  const [linkModal, setLinkModal] = useState<{
    isOpen: boolean;
    account: Account | null;
  }>({
    isOpen: false,
    account: null,
  });

  // Account limit state
  const [accountLimit, setAccountLimit] = useState<{
    limit: number;
    current: number;
  } | null>(null);

  const isLimitReached = accountLimit
    ? accountLimit.current >= accountLimit.limit
    : false;

  const fetchAccounts = async (targetUserId?: string) => {
    setLoading(true);
    try {
      let response;

      if (isSuperAdmin || isTrader) {
        // Traders/SuperAdmins: fetch from external API (source of truth)
        const payload: any = {};
        if (targetUserId && targetUserId !== "me") {
          payload.targetUserId = targetUserId;
        }
        response = await tradeCopierService.getAccounts(payload);
      } else {
        // Regular users: fetch from local DB only
        response = await tradeCopierService.getAccountsLocal();
      }

      if (response.status === "success" && response.data?.accounts) {
        setAccounts(response.data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Fetch Accounts Error:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountLimit = async () => {
    try {
      const response = await tradeCopierService.getAccountLimit();
      if (response.status === "success" && response.data) {
        setAccountLimit(response.data);
      }
    } catch (error) {
      console.error("Fetch Account Limit Error:", error);
    }
  };

  const fetchTraders = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await fetch("/api/v1/traders");
      if (res.ok) {
        const data = await res.json();
        const traderOptions = data.traders.map((t: any) => ({
          value: t.id,
          label: `Trader: ${t.name || t.email}`,
        }));
        setTraderOptions([{ value: "me", label: "Mis Cuentas" }, ...traderOptions]);
      }
    } catch (e) {
      console.error("Failed to load traders", e);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAccounts(selectedTrader);
      fetchAccountLimit();
      if (isSuperAdmin) {
        fetchTraders();
      }
    }
  }, [selectedTrader, session]);

  // Handle auto-add mode from query params (Traders module redirection)
  useEffect(() => {
    const mode = searchParams?.get("mode");
    const type = searchParams?.get("type");
    const groupid = searchParams?.get("groupid");

    if (mode === "add" && !showForm) {
      setShowForm(true);
      setEditingAccount({
        type: type ? (Number(type) as any) : 1,
        groupid: groupid || undefined,
      } as any);
    }
  }, [searchParams]);

  const handleDelete = (accountId: string) => {
    setDeleteModal({ isOpen: true, accountId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.accountId) return;

    try {
      let res;
      if (deleteModal.isRequest) {
        res = await tradeCopierService.requestAccountFinalization(deleteModal.accountId);
      } else {
        res = await tradeCopierService.deleteAccount(deleteModal.accountId);
      }

      if (res.status === "success") {
        if (deleteModal.isRequest) {
          toast.success("Solicitud de finalización enviada con éxito.");
        } else {
          toast.success("Cuenta eliminada correctamente.");
        }
        fetchAccounts();
        fetchAccountLimit();
      } else {
        toast.error(res.message || "Error al procesar la acción");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de conexión");
    } finally {
      setDeleteModal({ isOpen: false, accountId: null });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleLink = (account: Account) => {
    setLinkModal({ isOpen: true, account });
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingAccount(null);
    fetchAccounts(selectedTrader); // Refresh with current filter
    fetchAccountLimit();
  };

  const handlePromoteToMaster = (account: Account) => {
    setPromoteModal({ isOpen: true, account });
  };

  const confirmPromote = async () => {
    if (!promoteModal.account) return;
    try {
      const res = await tradeCopierService.updateAccount({
        account_id: promoteModal.account.account_id,
        type: 0, // 0 = Master
      });
      if (res.status === "success") {
        toast.success(
          `La cuenta ${promoteModal.account.name} ahora es MASTER.`,
        );
        fetchAccounts();
      } else {
        toast.error(res.message || "Error al ascender la cuenta.");
      }
    } catch (e) {
      toast.error("Error de conexión al intentar ascender la cuenta.");
    } finally {
      setPromoteModal({ isOpen: false, account: null });
    }
  };

  const handleToggleStatus = (account: Account) => {
    setStatusModal({ isOpen: true, account });
  };

  const confirmToggleStatus = async () => {
    if (!statusModal.account) return;
    
    const account = statusModal.account;
    const newStatus = Number(account.status) === 1 ? 0 : 1;
    
    setTogglingAccountId(account.account_id ?? null);
    setStatusModal({ isOpen: false, account: null });
    
    try {
      const res = await tradeCopierService.updateAccount({
        account_id: account.account_id,
        status: newStatus,
        targetUserId: selectedTrader !== "me" ? selectedTrader : undefined
      });

      if (res.status === "success") {
        toast.success(
          `Cuenta ${newStatus === 1 ? "activada" : "desactivada"} correctamente.`
        );
        fetchAccounts(selectedTrader);
      } else {
        toast.error(res.message || "Error al cambiar el estado.");
      }
    } catch (error) {
      toast.error("Error de conexión al cambiar el estado.");
    } finally {
      setTogglingAccountId(null);
    }
  };

  const [traderOptions, setTraderOptions] = useState([
    { value: "me", label: "Mis Cuentas" }
  ]);

  const displayedAccounts = accounts; // No local filtering needed anymore, API returns isolated accounts based on header context

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Cuentas
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Vincula y gestiona tus cuentas de broker para la operativa de
            copiado.
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pb-12 animate-in zoom-in-95 duration-500">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Activity size={20} className="text-primary" />
                Cuentas Vinculadas
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {isSuperAdmin && !showForm && (
                <div className="w-[200px]">
                  <ModernSelect
                    value={selectedTrader}
                    onChange={(val) => setSelectedTrader(val as string)}
                    options={traderOptions}
                    className="bg-background/40 border-white/10 h-9"
                  />
                </div>
              )}
              {accountLimit && (
                <span
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-lg border",
                    isLimitReached
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-white/5 border-white/10 text-muted-foreground",
                  )}
                >
                  {accountLimit.current}/{accountLimit.limit} cuenta
                  {accountLimit.limit > 1 ? "s" : ""}
                </span>
              )}
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingAccount(null);
                }}
                className={cn(
                  "rounded-xl flex items-center gap-2 transition-all",
                  isLimitReached
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                    : "bg-primary hover:bg-primary/90",
                )}
                disabled={showForm || isLimitReached}
              >
                {isLimitReached ? <Lock size={16} /> : <Plus size={18} />}
                Vincular Cuenta
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="animate-in slide-in-from-top-4 fade-in duration-300">
              <AccountForm
                initialData={editingAccount || undefined}
                onSuccess={handleSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAccount(null);
                }}
                forceSlave={searchParams?.get("type") === "1"}
              />
            </div>
          )}

          {!showForm && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                  <RefreshCw size={40} className="animate-spin text-primary" />
                  <p className="text-sm font-medium">
                    Sincronizando cuentas...
                  </p>
                </div>
              ) : accounts.length === 0 ? (
                <Card className="border-dashed border-white/10 bg-transparent py-20">
                  <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-4 bg-primary/5 rounded-full">
                      <Activity size={40} className="text-primary/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-foreground">
                        No hay cuentas vinculadas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Comienza vinculando tu primera cuenta de broker.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(true)}
                      className="mt-4 rounded-xl border-white/10"
                      disabled={isLimitReached}
                    >
                      Vincular ahora
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AccountsGrid
                  accounts={accounts}
                  isSuperAdmin={isSuperAdmin}
                  isTrader={isTrader}
                  canClassify={canClassify}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    const acc = accounts.find(a => a.account_id === id);
                    const isStandardUser = session?.user?.role === "user";
                    const isSlave = acc?.type === 1;
                    const hasActiveCopyConfig = !!acc?.traderName;
                    
                    if (isStandardUser && isSlave && hasActiveCopyConfig) {
                      setDeleteModal({ 
                        isOpen: true, 
                        accountId: id,
                        isRequest: true,
                        title: "Solicitar Finalización de Copia",
                        description: `¿Deseas solicitar la finalización de copiado para esta cuenta? Se enviará una solicitud al trader ${acc?.traderName || "administrador"} para desvincularla de forma segura.`,
                        confirmText: "Enviar Solicitud",
                        variant: "primary"
                      });
                    } else {
                      setDeleteModal({ 
                        isOpen: true, 
                        accountId: id,
                        isRequest: false,
                        title: isStandardUser ? "Desvincular Cuenta" : "Eliminar Cuenta",
                        description: isStandardUser 
                          ? "¿Estás seguro de que deseas desvincular esta cuenta de tu panel? Ya no la verás más." 
                          : "¿Estás seguro de que deseas eliminar esta cuenta permanentemente del servidor y del ecosistema?",
                        confirmText: isStandardUser ? "Desvincular" : "Eliminar permanentemente",
                        variant: "danger"
                      });
                    }

                  }}
                  onPromote={(acc) => setPromoteModal({ isOpen: true, account: acc })}
                  onToggleStatus={(acc) => setStatusModal({ isOpen: true, account: acc })}
                  onLink={(acc) => setLinkModal({ isOpen: true, account: acc })}
                  togglingAccountId={togglingAccountId}
                />
              )}
            </>
          )}
        </div>
      </div>

      <LinkAccountModal
        isOpen={linkModal.isOpen}
        onClose={() => setLinkModal({ isOpen: false, account: null })}
        account={linkModal.account}
        onSuccess={() => fetchAccounts(selectedTrader)}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, accountId: null })}
        onConfirm={confirmDelete}
        title={deleteModal.title || "Eliminar Cuenta"}
        description={deleteModal.description || "¿Estás seguro de que deseas eliminar esta cuenta? Esta acción desvinculará permanentemente el broker de nuestro ecosistema."}
        confirmText={deleteModal.confirmText || "Eliminar permanentemente"}
        cancelText="Volver"
        variant={deleteModal.variant || "danger"}
      />

      <ConfirmationModal
        isOpen={promoteModal.isOpen}
        onClose={() => setPromoteModal({ isOpen: false, account: null })}
        onConfirm={confirmPromote}
        title="Ascender a MASTER"
        description={`¿Estás seguro de que deseas ascender la cuenta ${promoteModal.account?.name} a MASTER? Esta acción le permitirá operar como un proveedor de señales en el ecosistema de Modelos.`}
        confirmText="Ascender a Master"
        cancelText="Volver"
      />

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, account: null })}
        onConfirm={confirmToggleStatus}
        title={
          Number(statusModal.account?.status) === 1
            ? "Desactivar Cuenta"
            : "Activar Cuenta"
        }
        description={
          Number(statusModal.account?.status) === 1
            ? `¿Estás seguro de que deseas desactivar la cuenta #${statusModal.account?.login}? Se detendrá la recepción de señales inmediatamente.`
            : `¿Deseas activar la cuenta #${statusModal.account?.login} para comenzar a recibir señales?`
        }
        confirmText={
          Number(statusModal.account?.status) === 1 ? "Desactivar" : "Activar"
        }
        variant={Number(statusModal.account?.status) === 1 ? "danger" : "primary"}
      />
    </div>
  );
}
