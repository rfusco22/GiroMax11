import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID || "")
    googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
    googleAuthUrl.searchParams.append("response_type", "code")
    googleAuthUrl.searchParams.append("scope", "openid email profile")
    googleAuthUrl.searchParams.append("access_type", "offline")
    googleAuthUrl.searchParams.append("prompt", "select_account")

    console.log("[v0] Redirigiendo a Google OAuth")
    console.log("[v0] Redirect URI:", redirectUri)
    console.log("[v0] Google URL:", googleAuthUrl.toString())

    return NextResponse.redirect(googleAuthUrl.toString())
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.redirect(new URL("/login?error=google_failed", request.nextUrl.origin))
  }
}
