import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"


export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
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
        const user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            credential: { select: { passwordHash: true } },
            role: true,
            isApproved: true,
            isActive: true,
          }
        });
        
        if (!user || !user.credential?.passwordHash) return null;

        if (!user.isApproved) {
            console.log("User not approved:", user.email);
            throw new Error("AccessDenied: Pending Approval"); 
        }

        if (user.isActive === false) { 
             console.log("User disabled:", user.email);
             throw new Error("AccessDenied: Account Disabled");
        }
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password.toString(),
          user.credential.passwordHash
        );

        if (passwordsMatch) {
          // Retornar usuario con el rol incluido
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            role: user.role as "user" | "superadmin",
            isApproved: user.isApproved,
            isActive: user.isActive,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SI_CB:", account?.provider, user?.email);
      
      if (account?.provider === "google" && user?.email) {
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { isApproved: true, isActive: true }
        });

        if (dbUser) {
          console.log("SI_CB_DB:", dbUser.isApproved, dbUser.isActive);
          if (!dbUser.isApproved) return "/login?error=PendingApproval";
          if (!dbUser.isActive) return "/login?error=AccountDisabled";
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // En el primer login, cargar el rol desde el usuario
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isApproved = user.isApproved;
        token.isActive = user.isActive;
      }
      
      // CARGA DINÁMICA: Si no tenemos el rol o si el usuario AÚN no está aprobado, 
      // re-consultar la DB para ver si ya lo aprobaron.
      if ((!token.role || !token.isApproved || token.isActive === false) && token.sub) {
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({ 
          where: { id: token.sub },
          select: { role: true, isApproved: true, isActive: true }
        });
        if (dbUser) {
          token.role = dbUser.role as "user" | "superadmin";
          token.isApproved = dbUser.isApproved;
          token.isActive = dbUser.isActive;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Pasar ID y rol del token a la sesión
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as "user" | "superadmin";
      }
      // Pasar estados de aprobación y actividad
      session.user.isApproved = token.isApproved as boolean;
      session.user.isActive = token.isActive as boolean;
      
      return session;
    }
  }
}

