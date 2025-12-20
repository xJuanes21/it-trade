"use server";

// Mock server actions for UI-only flows
// Estas funciones son temporales, reemplazar al integrar NextAuth.

export type RegisterResult = { error?: string; success?: string } | null;

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  // Simula retardo de red/servidor
  await new Promise((r) => setTimeout(r, 500));

  if (!email || !password) return "Email y password requeridos";

  // Regla mock: si el email contiene "fail" devolvemos error
  if (email.includes("fail")) return "Credenciales inválidas (mock)";

  // Éxito (no hace nada real)
  return undefined;
}

export async function register(
  _prevState: RegisterResult,
  formData: FormData
): Promise<RegisterResult> {
  const name = (formData.get("name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirmPassword") ?? "").toString();

  await new Promise((r) => setTimeout(r, 600));

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Todos los campos son obligatorios" };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }
  if (email.includes("fail")) {
    return { error: "Registro rechazado (mock)" };
  }

  return { success: "Cuenta creada (mock)" };
}
