import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { canAccessRoute, type UserRole } from "./lib/auth-utils"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Bypass total para rutas API para evitar redirecciones que devuelven RSC
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Si no hay sesión, dejar que NextAuth maneje la redirección
  if (!req.auth?.user) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return NextResponse.next()
  }

  const user = req.auth.user

  // Bloquear acceso si no está aprobado o está inactivo (excepto para superadmin tal vez, 
  // pero el schema dice que superadmin es un rol, no un bypass de aprobación)
  if (!user.isApproved || !user.isActive) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
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
