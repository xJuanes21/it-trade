"use client";

import { approveUser, rejectUser } from "@/lib/admin-actions";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DataTable, Column } from "@/components/ui/data-table";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

// Define a minimal type for the user prop to avoid prisma client dependency issues in client component
type PendingUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
};

export function UserRequestList({ users }: { users: PendingUser[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [userToReject, setUserToReject] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveUser(id);
    setLoadingId(null);
    router.refresh();
  };

  const openRejectModal = (id: string) => {
    setUserToReject(id);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!userToReject) return;
    setLoadingId(userToReject); // Set loading state for the user being rejected
    await rejectUser(userToReject);
    setLoadingId(null); // Clear loading state
    setUserToReject(null);
    setRejectModalOpen(false); // Close the modal
    router.refresh();
  };

  const columns: Column<PendingUser>[] = [
    {
      key: "name",
      label: "Usuarios",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white">
            {user.name?.charAt(0).toUpperCase() ||
              user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">
              {user.name || "Sin nombre"}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Fecha Registro",
      align: "center",
      render: (user) => (
        <span className="text-slate-300">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (user) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleApprove(user.id)}
            disabled={loadingId === user.id}
            title="Aprobar"
            className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
          >
            {loadingId === user.id ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
          </button>
          <button
            onClick={() => openRejectModal(user.id)}
            disabled={loadingId === user.id}
            title="Rechazar"
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
          >
            {loadingId === user.id ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <X size={18} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Solicitudes Pendientes"
        subtitle="Usuarios esperando aprobación"
        columns={columns}
        data={users}
        emptyMessage="No hay solicitudes pendientes."
      />

      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setUserToReject(null); // Clear userToReject when modal is closed without confirming
        }}
        onConfirm={confirmReject}
        title="Rechazar Usuario"
        description="¿Estás seguro de que deseas rechazar esta solicitud? Esta acción eliminará permanentemente al usuario y no se puede deshacer."
        confirmText="Rechazar y Eliminar"
        variant="danger"
        isLoading={loadingId === userToReject} // Pass loading state to modal
      />
    </>
  );
}
