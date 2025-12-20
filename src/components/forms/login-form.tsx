"use client"

import Link from "next/link"
import Image from "next/image"
import { useActionState } from "react"
import { authenticate } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { InputWithIcon } from "@/components/ui/input-with-icon"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.svg"
            alt="iTtrade Logo"
            width={200}
            height={70}
            priority
          />
        </div>
        <CardTitle className="text-2xl text-center text-white">Bienvenido de Nuevo</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">EMAIL</Label>
            <InputWithIcon
              id="email"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              icon={Mail}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">PASSWORD</Label>
              <Link
                href="#"
                className="text-xs text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-2" disabled={isPending}>
            {isPending ? "Iniciando sesión..." : "INICIAR SESIÓN →"}
          </Button>
          
          {errorMessage && (
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
          )}
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">O continua con</span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full bg-white text-black hover:bg-gray-200 border-none">
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          CONTINUAR CON GOOGLE
        </Button>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground text-center w-full">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
