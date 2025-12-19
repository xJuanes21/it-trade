import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

const secret = process.env.AUTH_SECRET || "fallback-secret-for-dev-only"

if (!process.env.AUTH_SECRET) {
  console.warn("⚠️ AUTH_SECRET is missing in .env, using fallback. Do not use in production!")
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      
      return true
    },
  },
} satisfies NextAuthConfig
