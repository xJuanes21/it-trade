import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, verifyPassword } from "@/services/user.service"
import { z } from "zod"

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUserByEmail(email)
          
          if (!user || !user.passwordHash) return null

          const passwordsMatch = await verifyPassword(password, user.passwordHash)
          
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          }
        }
        
        return null
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
