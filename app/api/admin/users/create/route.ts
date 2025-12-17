import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Only gerencia can create users with elevated roles
    if (session.user.role !== "gerencia") {
      return NextResponse.json({ error: "Solo gerencia puede crear usuarios" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, phone, country, role } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, contraseña y nombre son requeridos" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email])

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Create user
    await query(
      `INSERT INTO users (
        id, email, password_hash, name, phone, country, role, verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [userId, email, passwordHash, name, phone || null, country || null, role || "administrador"],
    )

    // Log the action
    await query(
      `INSERT INTO audit_log (
        user_id, action, entity_type, entity_id, new_values, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        session.user.id,
        "CREATE_USER",
        "user",
        userId,
        JSON.stringify({ email, name, role, created_by: session.user.email }),
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      userId,
    })
  } catch (error: any) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
  }
}
