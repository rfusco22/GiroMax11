import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionToken = request.cookies.get("session_token")?.value

  const publicRoutes = [
    "/",
    "/login",
    "/registro",
    "/recuperar",
    "/restablecer",
    "/verificacion",
    "/terminos",
    "/privacidad",
  ]

  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/registro",
    "/api/auth/verificar",
    "/api/auth/reset-password",
    "/api/rates",
  ]

  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route))

  if (!sessionToken && !isPublicRoute && !isPublicApiRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (sessionToken && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)"],
}
