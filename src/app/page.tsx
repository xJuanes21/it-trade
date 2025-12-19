import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <h1 className="text-4xl font-bold mb-8 text-foreground">iTtrade Demo</h1>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  )
}