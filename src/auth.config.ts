import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  // Usamos JWT para evitar acceso a DB desde middleware (Edge)
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Importamos prisma solo en Node.js (evita bundling en middleware/edge)
        const { prisma } = await import("@/lib/prisma");
        const email = credentials?.email?.toString().trim() || ""
        const password = credentials?.password?.toString() || ""
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
}
