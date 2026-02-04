"use client";

import Link from "next/link";
import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  authenticate,
  signInWithGoogle,
  type ActionResult,
} from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="mt-2 w-full bg-primary text-white hover:bg-primary/90"
      disabled={pending}
    >
      {pending ? "Iniciando sesión..." : "INICIAR SESIÓN →"}
    </Button>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="outline"
      className="w-full border-none bg-white text-black hover:bg-gray-200"
      disabled={pending}
      type="submit"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        ></path>
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        ></path>
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
      </svg>
      {pending ? "Conectando..." : "CONTINUAR CON GOOGLE"}
    </Button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    authenticate,
    null,
  );

  useEffect(() => {
    // Handle error from query params (needed for OAuth redirects like Google)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");

    if (errorParam === "PendingApproval") {
      toast.error(
        "Tu cuenta está pendiente de aprobación por un administrador.",
      );
    } else if (errorParam === "AccountDisabled") {
      toast.error("Tu cuenta ha sido inhabilitada. Contacta al soporte.");
    } else if (errorParam === "CredentialsSignin") {
      toast.error("Credenciales inválidas");
    } else if (errorParam === "OAuthAccountNotLinked") {
      toast.error(
        "Este correo ya está asociado a otra cuenta (posiblemente creada con contraseña). Por favor, inicia sesión con tu método original.",
      );
    } else if (errorParam) {
      toast.error("Ocurrió un error al iniciar sesión.");
    }

    if (!state) return;
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state, router]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
        <CardTitle className="text-2xl text-center text-white">
          Bienvenido de Nuevo
        </CardTitle>
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
              <Link href="#" className="text-xs text-primary hover:underline">
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
          <LoginSubmitButton />
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              O continua con
            </span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <GoogleButton />
        </form>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
