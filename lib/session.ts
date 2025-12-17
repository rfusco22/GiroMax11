import { cookies } from "next/headers"
import crypto from "crypto"

const SESSION_SECRET = process.env.SESSION_SECRET || ""

if (!SESSION_SECRET) {
  console.error("⚠️  SESSION_SECRET is not configured. Session security is compromised!")
}

export interface SessionData {
  token: string
  userId: string
  expiresAt: number
}

/**
 * Sign session data with HMAC to prevent tampering
 */
export function signSessionData(data: SessionData): string {
  const payload = JSON.stringify(data)
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")

  return `${Buffer.from(payload).toString("base64")}.${signature}`
}

/**
 * Verify and parse signed session data
 */
export function verifySessionData(signedData: string): SessionData | null {
  try {
    const [payloadBase64, signature] = signedData.split(".")

    if (!payloadBase64 || !signature) {
      return null
    }

    const payload = Buffer.from(payloadBase64, "base64").toString("utf-8")
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")

    // Prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }

    const data = JSON.parse(payload) as SessionData

    // Check if session is expired
    if (Date.now() > data.expiresAt) {
      return null
    }

    return data
  } catch (error) {
    console.error("Error verifying session data:", error)
    return null
  }
}

/**
 * Set secure session cookie
 */
export async function setSessionCookie(token: string, userId: string, expiresAt: Date): Promise<void> {
  const sessionData: SessionData = {
    token,
    userId,
    expiresAt: expiresAt.getTime(),
  }

  const signedData = signSessionData(sessionData)
  const cookieStore = await cookies()

  cookieStore.set("session_token", signedData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

/**
 * Get session token from cookie
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const signedData = cookieStore.get("session_token")?.value

  if (!signedData) {
    return null
  }

  const sessionData = verifySessionData(signedData)

  if (!sessionData) {
    // Invalid or expired session, clear cookie
    cookieStore.delete("session_token")
    return null
  }

  return sessionData.token
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session_token")
}

/**
 * Generate secure random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
