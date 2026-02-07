"use client";

import {
  ShieldCheck,
  Server,
  User,
  Calendar,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface Account {
  id: string;
  login: string;
  server: string;
  createdAt: Date;
}

interface ConnectedAccountsListProps {
  accounts: Account[];
}

export function ConnectedAccountsList({
  accounts,
}: ConnectedAccountsListProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/v1/accounts", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      toast.success("Cuenta desconectada correctamente");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al desconectar la cuenta");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDisconnect}
        title="Desconectar Cuenta"
        message="¿Estás seguro de que quieres desconectar esta cuenta? Esta acción no se puede deshacer y tendrás que volver a ingresar tus credenciales para acceder a tus datos."
        confirmText="Sí, desconectar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDisconnecting}
      />

      <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cuentas Conectadas</h2>
            <p className="text-slate-400 text-sm">
              Gestiona tus cuentas de MetaTrader 5 vinculadas.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-[#0f172a] rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition-colors group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      Login: {account.login}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Server size={12} />
                      <span>{account.server}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full hidden sm:flex">
                    <Calendar size={12} />
                    <span>
                      Conectado:{" "}
                      {new Date(account.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={isDisconnecting}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Desconectar cuenta"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Al desconectar, podrás vincular una nueva cuenta inmediatamente.
        </p>
      </div>
    </div>
  );
}
