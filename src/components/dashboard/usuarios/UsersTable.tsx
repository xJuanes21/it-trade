"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { useState } from "react";
import { Settings, Power, CheckCircle, XCircle, Loader2 } from "lucide-react";
import BotAssignmentModal from "./BotAssignmentModal";
import { toggleUserStatus } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  emailVerified: Date | null;
  isActive: boolean;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{
    id: string;
    currentStatus: boolean;
  } | null>(null);

  const router = useRouter();

  const handleManageBots = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserName("");
  };

  const openStatusModal = (userId: string, currentStatus: boolean) => {
    setUserToToggle({ id: userId, currentStatus });
    setStatusModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    // Optimistic UI update could be done here, but router.refresh() handles sync
    await toggleUserStatus(userToToggle.id, !userToToggle.currentStatus);

    setStatusModalOpen(false);
    setUserToToggle(null);
    router.refresh();
  };

  // Filtrar usuarios según búsqueda
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Definir columnas de la tabla
  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Usuario",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white">
            {user.name?.charAt(0).toUpperCase() ||
              user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">
              {user.name || "Sin nombre"}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rol",
      render: (user) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            user.role === "superadmin"
              ? "bg-purple-500/20 text-purple-200"
              : "bg-blue-500/20 text-blue-200"
          }`}
        >
          {user.role === "superadmin" ? "Super Admin" : "Usuario"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Estado",
      align: "center",
      render: (user) => (
        <div
          className={`flex items-center gap-1.5 justify-center text-xs font-medium ${user.isActive ? "text-green-400" : "text-red-400"}`}
        >
          {user.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {user.isActive ? "Activo" : "Inhabilitado"}
        </div>
      ),
    },
    {
      key: "emailVerified",
      label: "Email Verificado",
      align: "center",
      render: (user) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            user.emailVerified
              ? "bg-green-500/20 text-green-200"
              : "bg-yellow-500/20 text-yellow-200"
          }`}
        >
          {user.emailVerified ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Fecha Registro",
      align: "right",
      render: (user) => (
        <span className="text-slate-300">
          {new Date(user.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleManageBots(user.id, user.name || user.email)}
            title="Gestionar Bots"
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
          >
            <Settings size={16} />
          </button>

          {user.role !== "superadmin" && (
            <button
              onClick={() => openStatusModal(user.id, user.isActive)}
              disabled={loadingId === user.id}
              title={user.isActive ? "Inhabilitar Cuenta" : "Habilitar Cuenta"}
              className={`p-2 rounded-lg transition-colors ${
                user.isActive
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  : "bg-green-500/10 hover:bg-green-500/20 text-green-400"
              }`}
            >
              {loadingId === user.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Power size={16} />
              )}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Usuarios Registrados"
        subtitle="Gestión de usuarios de la plataforma"
        columns={columns}
        data={filteredUsers}
        searchable
        searchPlaceholder="Buscar por nombre, email o rol..."
        onSearch={setSearchQuery}
        emptyMessage="No se encontraron usuarios"
      />

      {selectedUserId && (
        <BotAssignmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userId={selectedUserId}
          userName={selectedUserName}
        />
      )}

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={confirmToggleStatus}
        title={
          userToToggle?.currentStatus
            ? "Inhabilitar Usuario"
            : "Habilitar Usuario"
        }
        description={
          userToToggle?.currentStatus
            ? "¿Estás seguro de que deseas inhabilitar a este usuario? No podrá iniciar sesión hasta que sea habilitado nuevamente."
            : "¿Deseas habilitar el acceso a este usuario nuevamente?"
        }
        confirmText={userToToggle?.currentStatus ? "Inhabilitar" : "Habilitar"}
        variant={userToToggle?.currentStatus ? "danger" : "primary"}
      />
    </>
  );
}
