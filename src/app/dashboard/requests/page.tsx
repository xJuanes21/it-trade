import { prisma } from "@/lib/prisma";
import { UserRequestList } from "./UserRequestList";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Solicitudes de Registro
        </h1>
        <p className="text-muted-foreground text-sm">
          Administra las solicitudes de acceso a la plataforma.
        </p>
      </div>

      <UserRequestList users={pendingUsers} />
    </div>
  );
}
