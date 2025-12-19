"use server"

import { z } from "zod"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { createUser } from "@/services/user.service"
import type { AuthActionState } from "@/types/auth.types"

const RegisterSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function register(
  prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData))

  if (!validatedFields.success) {
    return { error: "Campos inválidos" }
  }

  const { email, name, password } = validatedFields.data

  try {
    await createUser({ name, email, password })
    
    return { success: "¡Cuenta creada exitosamente!" }
  } catch (err) {
    console.error("Error al crear usuario:", err)
    
    if (err instanceof Error && err.message.includes("ya está en uso")) {
      return { error: "El email ya está en uso" }
    }
    
    return { error: "Algo salió mal. Por favor intenta de nuevo" }
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas"
        default:
          return "Algo salió mal. Por favor intenta de nuevo"
      }
    }
    throw error
  }
}
