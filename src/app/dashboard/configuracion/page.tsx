import { LogoutButton } from "@/components/dashboard/config/LogoutButton";

export const metadata = { title: "Configuración | iTtrade" };

export default function ConfiguracionPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu cuenta y cierra sesión de forma segura.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Sesión
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Si compartes este dispositivo o terminaste tu actividad, puedes cerrar la sesión aquí.
        </p>
        <LogoutButton />
      </section>
    </div>
  );
}
