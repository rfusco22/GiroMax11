import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { setSessionCookie, generateSecureToken } from "@/lib/session"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  console.log("[v0] Google OAuth callback recibido")
  console.log("[v0] Code existe:", !!code)
  console.log("[v0] Error:", error)

  const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL
  const GOOGLE_REDIRECT_URI = NEXT_PUBLIC_URL
    ? `${NEXT_PUBLIC_URL}/api/auth/google/callback`
    : `${request.nextUrl.origin}/api/auth/google/callback`

  if (error) {
    console.error("[v0] Error de Google:", error)
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("error", "google_auth_failed")
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    console.error("[v0] No se recibió código de autorización")
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("error", "no_code")
    return NextResponse.redirect(loginUrl)
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("[v0] Faltan credenciales de Google en el servidor")
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("error", "google_not_configured")
    return NextResponse.redirect(loginUrl)
  }

  try {
    console.log("[v0] Intercambiando código por tokens...")

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("[v0] Error al intercambiar código:", tokenResponse.status, errorText)
      throw new Error("Failed to exchange code for tokens")
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()
    console.log("[v0] Tokens obtenidos exitosamente")

    // Get user info from Google
    console.log("[v0] Obteniendo información del usuario...")
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error("[v0] Error al obtener información del usuario:", userInfoResponse.status)
      throw new Error("Failed to get user info")
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()
    console.log("[v0] Usuario de Google:", googleUser.email)

    // Check if user exists
    const existingUser = await db.queryOne<{ id: string; email: string; name: string; role: string }>(
      "SELECT id, email, name, role FROM users WHERE email = ?",
      [googleUser.email],
    )

    let userId: string

    if (existingUser) {
      console.log("[v0] Usuario existente encontrado")
      userId = existingUser.id
    } else {
      console.log("[v0] Creando nuevo usuario")
      userId = uuidv4()
      await db.query(
        `INSERT INTO users (id, email, name, role, verified, created_at)
         VALUES (?, ?, ?, 'cliente', true, NOW())`,
        [userId, googleUser.email, googleUser.name],
      )
    }

    // Create session
    console.log("[v0] Creando sesión...")
    const sessionId = uuidv4()
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await db.query(
      `INSERT INTO sessions (id, token, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [sessionId, token, userId, expiresAt],
    )

    await setSessionCookie(token, userId, expiresAt)

    console.log("[v0] Sesión creada, redirigiendo a dashboard")

    // Redirect to dashboard
    const dashboardUrl = new URL("/dashboard", request.nextUrl.origin)
    return NextResponse.redirect(dashboardUrl)
  } catch (error) {
    console.error("[v0] Error durante Google OAuth:", error)
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("error", "auth_failed")
    return NextResponse.redirect(loginUrl)
  }
}
