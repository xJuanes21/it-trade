import Mt5ConnectForm from "@/components/dashboard/config/Mt5ConnectForm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConnectedAccountsList } from "@/components/dashboard/config/ConnectedAccountsList";

export const metadata = {
  title: "Configuración",
};

export default async function ConfiguracionPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>No autorizado</div>;
  }

  const accounts = await prisma.mt5Account.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">
            Administre sus conexiones y preferencias de cuenta.
          </p>
        </div>

        {accounts.length > 0 ? (
          <ConnectedAccountsList accounts={accounts} />
        ) : (
          <Mt5ConnectForm />
        )}
      </div>
    </div>
  );
}
