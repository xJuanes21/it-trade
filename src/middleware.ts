import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  // Protege todo lo bajo /dashboard (incluye subrutas)
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
  ],
}
