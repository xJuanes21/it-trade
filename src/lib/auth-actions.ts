"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";

export type ActionResult = {
  error?: string;
  success?: string;
  redirectTo?: string;
} | null;

export async function authenticate(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!email || !password) return { error: "Email y password requeridos" };

  try {
    await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return {
      success: "Inicio de sesión exitoso",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    if (error instanceof Error) {
        // NextAuth wraps generic errors, but sometimes custom throws propagate as CallbackRouteError
        // Checking message content is the most reliable way for custom throws in credentials
        if (error.message.includes("AccessDenied: Pending Approval") || error.message.includes("Pending Approval")) {
            return { error: "Tu cuenta está pendiente de aprobación por un administrador." };
        }
        if (error.message.includes("AccessDenied: Account Disabled") || error.message.includes("Account Disabled")) {
            return { error: "Tu cuenta ha sido inhabilitada. Contacta al soporte." };
        }
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
        case "CallbackRouteError": // Often wraps the thrown error
             // Try to see if the cause message matches (sometimes double wrapped)
             const cause = error.cause as { err?: { message?: string } } | undefined;
             const errMessage = cause?.err?.message || error.message;
             if (errMessage?.includes("Pending Approval")) return { error: "Tu cuenta está pendiente de aprobación." };
             if (errMessage?.includes("Account Disabled")) return { error: "Tu cuenta ha sido inhabilitada." };
            
             return { error: "Credenciales inválidas" };
        default:
          return { error: "Error de autenticación" };
      }
    }
    throw error;
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

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ 
      data: { 
        name, 
        email, 
        role: "user", // Asignar rol user por defecto
        credential: {
          create: { passwordHash }
        }
      } 
    });

    // Auto-login after registration could be attempted here,
    // but for simplicity/safety we ask them to login.
    // Or we can call authenticate logic.
    return { success: "Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.", redirectTo: "/login" };

  } catch (error) {
    console.error("Register action error", error);
    return { error: "Error registrando usuario" };
  }
}

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logOut(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
