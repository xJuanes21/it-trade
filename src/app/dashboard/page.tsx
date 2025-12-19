import { auth, signOut } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {session?.user?.name || session?.user?.email}!</p>
      
      <div className="p-4 bg-card rounded-lg border border-border">
        <pre className="text-xs text-muted-foreground overflow-auto max-w-lg mb-4">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <form
        action={async () => {
          "use server"
          await signOut()
        }}
        className="mt-6"
      >
        <button className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-md">
          Sign Out
        </button>
      </form>
    </div>
  )
}
