import Mt5ConnectForm from "@/components/dashboard/config/Mt5ConnectForm";

export const metadata = {
  title: "Configuración",
};

export default function ConfiguracionPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">
            Administre sus conexiones y preferencias de cuenta.
          </p>
        </div>

        <Mt5ConnectForm />
      </div>
    </div>
  );
}
