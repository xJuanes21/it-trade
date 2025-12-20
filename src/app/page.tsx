import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <h1 className="text-4xl font-bold mb-4 text-foreground">iTtrade</h1>
      <p className="text-muted-foreground mb-8">Proyecto en modo público temporalmente. Explora el dashboard.</p>
      <Button asChild>
        <Link href="/dashboard">Ir al Dashboard</Link>
      </Button>
    </div>
  )
}
