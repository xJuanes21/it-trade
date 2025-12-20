export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col gap-4 p-4 md:p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground max-w-prose">
        Bienvenido a iTtrade. Esta página es pública por ahora mientras dejamos el proyecto sin autenticación.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card rounded-lg border border-border">Bloque A</div>
        <div className="p-4 bg-card rounded-lg border border-border">Bloque B</div>
      </div>
    </div>
  )
}
