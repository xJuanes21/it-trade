import PlatformAuthManager from "@/components/dashboard/config/PlatformAuthManager";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Autenticación de Plataforma",
};

export default async function ConfiguracionPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  if (!isSuperAdmin(role)) {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Autenticación de Plataforma</h1>
          <p className="text-muted-foreground mt-2">
            Gestione de forma centralizada las credenciales de API para la automatización de cuentas maestras y traders.
          </p>
        </div>

        <PlatformAuthManager />
      </div>
    </div>
  );
}
