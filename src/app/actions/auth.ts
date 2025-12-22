 "use server";

// Server actions respaldadas por NextAuth/Prisma
// authenticate: usa NextAuth Credentials
// register: crea usuario en DB y devuelve estado

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export type ActionResult = {
  error?: string;
  success?: string;
  redirectTo?: string;
} | null;

function isNextRedirectError(error: unknown): error is { digest: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function handleSignInError(error: unknown) {
  if (isNextRedirectError(error)) throw error;
  if (error instanceof AuthError) {
    if (error.type === "CredentialsSignin") {
      return "Credenciales inválidas";
    }
    return "Error de autenticación";
  }
  console.error("Unexpected signIn error", error);
  return "Error inesperado al autenticar";
}

export async function authenticate(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!email || !password) return { error: "Email y password requeridos" };

  try {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      return { error: "Credenciales inválidas" };
    }

    return {
      success: "Inicio de sesión exitoso",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    const message = handleSignInError(error);
    return { error: message ?? "Error inesperado al autenticar" };
  }
}

export async function register(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirmPassword") ?? "").toString();

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Todos los campos son obligatorios" };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { error: "El email ya está registrado" };

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, passwordHash } });

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        return { success: "Cuenta creada. Inicia sesión." };
      }

      return {
        success: "Cuenta creada. Redirigiendo al dashboard...",
        redirectTo: "/dashboard",
      };
    } catch (error) {
      const message = handleSignInError(error);
      if (message === "Credenciales inválidas") {
        return { success: "Cuenta creada. Inicia sesión." };
      }
      return { error: message ?? "Error auto-iniciando sesión" };
    }
  } catch (error) {
    console.error("Register action error", error);
    return { error: "Error registrando usuario" };
  }
}
