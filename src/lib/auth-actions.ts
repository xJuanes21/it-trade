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
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
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
        passwordHash,
        role: "user", // Asignar rol user por defecto
      } 
    });

    // Auto-login after registration could be attempted here,
    // but for simplicity/safety we ask them to login.
    // Or we can call authenticate logic.
    return { success: "Cuenta creada. Por favor inicia sesión.", redirectTo: "/login" };

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
