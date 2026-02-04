import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth-utils";
import UsersTable from "@/components/dashboard/usuarios/UsersTable";

export const metadata = {
  title: "Usuarios",
};

export default async function UsuariosPage() {
  const session = await auth();

  // Verificar autenticación
  if (!session?.user) {
    redirect("/login");
  }

  // Verificar que sea superadmin
  if (!isSuperAdmin(session.user.role)) {
    redirect("/dashboard");
  }

  // Cargar usuarios desde la base de datos
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen p-4 text-white md:p-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header>
          <p className="text-sm text-blue-300">Administración</p>
          <h1 className="text-3xl font-semibold">Gestión de Usuarios</h1>
        </header>

        <UsersTable users={users} />
      </div>
    </div>
  );
}
