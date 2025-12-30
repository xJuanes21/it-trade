"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  emailVerified: Date | null;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
      label: "Nombre",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{user.name || "Sin nombre"}</p>
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
      label: "Fecha de Registro",
      align: "right",
      render: (user) => (
        <span className="text-slate-300">
          {new Date(user.createdAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
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
  );
}
