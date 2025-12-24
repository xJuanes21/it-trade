import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Note: PrismaAdapter is not compatible with @prisma/adapter-pg
// Using JWT-only strategy with manual user management in callbacks
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
});
