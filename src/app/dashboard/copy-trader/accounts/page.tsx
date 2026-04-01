"use client";

import React, { useState, useEffect } from "react";
import AccountForm from "@/components/dashboard/copy-trader/AccountForm";
import { cn } from "@/lib/utils";
import {
  Plus,
  RefreshCw,
  Activity,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { tradeCopierService } from "@/services/trade-copier.service";
import { Account } from "@/lib/copy-trader-types";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
import { AccountsGrid } from "@/components/dashboard/copy-trader/components/AccountsGrid";

export default function CopyTraderAccountsPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superadmin";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    accountId: string | null;
  }>({
    isOpen: false,
    accountId: null,
  });

  const [promoteModal, setPromoteModal] = useState<{
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

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await tradeCopierService.getAccounts();
      if (response.status === "success" && response.data?.accounts) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error("Fetch Accounts Error:", error);
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

  useEffect(() => {
    fetchAccounts();
    fetchAccountLimit();
  }, []);

  const handleDelete = (accountId: string) => {
    setDeleteModal({ isOpen: true, accountId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.accountId) return;

    try {
      const res = await tradeCopierService.deleteAccount(deleteModal.accountId);
      if (res.status === "success") {
        toast.success("Cuenta eliminada correctamente.");
        fetchAccounts();
        fetchAccountLimit();
      } else {
        toast.error(res.message || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setDeleteModal({ isOpen: false, accountId: null });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingAccount(null);
    fetchAccounts();
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
        toast.success(`La cuenta ${promoteModal.account.name} ahora es MASTER.`);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Cuentas</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Vincula y gestiona tus cuentas de broker para la operativa de
            copiado.
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pb-12 animate-in zoom-in-95 duration-500">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Activity size={20} className="text-primary" />
              Cuentas Vinculadas
            </h2>
            <div className="flex items-center gap-3">
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

          {isLimitReached && !showForm && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <p className="text-sm text-amber-300/90">
                Has alcanzado el límite de{" "}
                <strong>{accountLimit?.limit}</strong> cuenta
                {accountLimit && accountLimit.limit > 1 ? "s" : ""} permitida
                {accountLimit && accountLimit.limit > 1 ? "s" : ""} en tu
                suscripción actual.
              </p>
            </div>
          )}

          {showForm && (
            <div className="animate-in slide-in-from-top-4 fade-in duration-300">
              <AccountForm
                initialData={editingAccount || undefined}
                onSuccess={handleSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAccount(null);
                }}
              />
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <RefreshCw size={40} className="animate-spin text-primary" />
              <p className="text-sm font-medium">Sincronizando cuentas...</p>
            </div>
          ) : accounts.length === 0 ? (
            <Card className="border-dashed border-white/10 bg-transparent py-20">
              <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-full">
                  <Activity size={40} className="text-primary/40" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg text-foreground">No hay cuentas vinculadas</p>
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPromote={handlePromoteToMaster}
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, accountId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Cuenta"
        description="¿Estás seguro de que deseas eliminar esta cuenta? Esta acción desvinculará permanentemente el broker de nuestro ecosistema."
        confirmText="Eliminar permanentemente"
        cancelText="Volver"
        variant="danger"
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
    </div>
  );
}
