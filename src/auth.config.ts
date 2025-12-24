import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  // Usamos JWT para evitar acceso a DB desde middleware (Edge)
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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
        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Para OAuth (Google), crear/actualizar usuario y cuenta en DB
      if (account?.provider === "google" && profile?.email) {
        const { prisma } = await import("@/lib/prisma");
        
        // Buscar o crear usuario
        let dbUser = await prisma.user.findUnique({
          where: { email: profile.email }
        });

        if (!dbUser) {
          // Crear nuevo usuario
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || null,
              image: profile.image || (profile as any).picture || null,
              emailVerified: new Date(),
            }
          });
        } else {
          // Actualizar imagen si existe
          if (profile.image || (profile as any).picture) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                image: profile.image || (profile as any).picture,
                emailVerified: dbUser.emailVerified || new Date(),
              }
            });
          }
        }

        // Verificar si la cuenta de Google ya está vinculada
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          }
        });

        if (!existingAccount) {
          // Crear cuenta vinculada
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | null,
            }
          });
        }

        // Asignar el id de la base de datos al user object
        user.id = dbUser.id;
      }
      
      return true;
    },
    async session({ session, token }) {
      // Agregar información del usuario al session
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.picture) {
        session.user.image = token.picture;
      }
      if (token.name) {
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Al hacer login por primera vez, user está disponible
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  },
}
