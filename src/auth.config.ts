import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"


export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        if (!credentials?.email || !credentials?.password) return null;
        
        // Dynamic imports to avoid bundling in Edge Runtime (Middleware)
        const { prisma } = await import("@/lib/prisma"); 
        const bcrypt = await import("bcryptjs");
        
        const email = credentials.email.toString();
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || !user.passwordHash) return null;
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password.toString(),
          user.passwordHash
        );

        if (passwordsMatch) return user;
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // Al usar adaptador, el user ya viene de DB con ID estable
        // No necesitamos lógica compleja aquí, el adaptador hace el link
      }
      return token;
    },
    async session({ session, token }) {
      // Pasar ID del token a la sesión
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
}

