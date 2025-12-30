import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { canAccessRoute, type UserRole } from "./lib/auth-utils"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Si no hay sesión, dejar que NextAuth maneje la redirección
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Verificar acceso basado en rol
  const userRole = (req.auth.user.role || "user") as UserRole
  
  if (!canAccessRoute(userRole, pathname)) {
    // Redirigir a dashboard según el rol
    const redirectPath = userRole === "superadmin" ? "/dashboard/bots" : "/dashboard"
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Protege todo lo bajo /dashboard (incluye subrutas)
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
  ],
}
