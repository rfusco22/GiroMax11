import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Reset password request received")
    const { token, password } = await request.json()
    console.log("[v0] Token received (first 10 chars):", token?.substring(0, 10))
    console.log("[v0] Password length:", password?.length)

    if (!token || !password) {
      console.log("[v0] Missing token or password")
      return NextResponse.json({ success: false, error: "Token y contraseña requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      console.log("[v0] Password too short")
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      )
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    console.log("[v0] Token hash created (first 10 chars):", tokenHash.substring(0, 10))

    const resetTokens = (await db.query(
      "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [tokenHash],
    )) as any[]
    console.log("[v0] Reset tokens found:", resetTokens?.length || 0)

    if (resetTokens && resetTokens.length > 0) {
      console.log("[v0] Token details:", {
        user_id: resetTokens[0].user_id,
        expires_at: resetTokens[0].expires_at,
        created_at: resetTokens[0].created_at,
      })
    }

    if (!Array.isArray(resetTokens) || resetTokens.length === 0) {
      console.log("[v0] No valid token found - token may be expired or invalid")
      return NextResponse.json(
        { success: false, error: "Token inválido o expirado. Por favor solicita un nuevo enlace." },
        { status: 400 },
      )
    }

    const resetToken = resetTokens[0] as { user_id: string }
    console.log("[v0] Found reset token for user:", resetToken.user_id)

    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("[v0] Password hashed successfully")

    const updateResult = (await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      resetToken.user_id,
    ])) as any
    console.log("[v0] User password updated, affected rows:", updateResult?.affectedRows || 0)

    await db.query("DELETE FROM password_resets WHERE token = ?", [tokenHash])
    console.log("[v0] Used token deleted")

    await db.query("DELETE FROM password_resets WHERE user_id = ?", [resetToken.user_id])
    console.log("[v0] All tokens for user deleted")

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("[v0] Error in password reset:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        success: false,
        error: `Error al procesar la solicitud: ${error instanceof Error ? error.message : "Error desconocido"}`,
      },
      { status: 500 },
    )
  }
}
