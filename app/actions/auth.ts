"use server"
import { redirect } from "next/navigation"
import { registerUser, loginUser, logout as logoutUser, getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const dateOfBirth = formData.get("dateOfBirth") as string
  const nationality = formData.get("nationality") as string
  const residenceCountry = formData.get("residenceCountry") as string
  const documentType = formData.get("documentType") as string
  const documentNumber = formData.get("documentNumber") as string

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !nationality ||
    !residenceCountry ||
    !documentType ||
    !documentNumber
  ) {
    return { error: "Todos los campos requeridos deben ser completados" }
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" }
  }

  const name = `${firstName} ${lastName}`

  const result = await registerUser({
    email,
    password,
    name,
    phone,
    country: residenceCountry,
    dateOfBirth,
    nationality,
    residenceCountry,
    documentType,
    documentNumber,
  })

  if (!result.success) {
    return { error: result.error }
  }

  // Auto login after registration
  const loginResult = await loginUser(email, password)

  if (!loginResult.success) {
    return { error: loginResult.error }
  }

  const userId = loginResult.userId

  try {
    const kycId = uuidv4()
    await db.query(
      `INSERT INTO kyc_verifications 
      (id, user_id, first_name, last_name, date_of_birth, nationality, residence_country, document_type, document_number, phone_number, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        kycId,
        userId,
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        residenceCountry,
        documentType,
        documentNumber,
        phone,
      ],
    )

    // Update user with draft KYC status
    await db.query(`UPDATE users SET kyc_status = 'none', kyc_id = ? WHERE id = ?`, [kycId, userId])
  } catch (error) {
    console.error("[v0] Error creating KYC record:", error)
  }

  redirect("/subir-documentos")
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = await loginUser(email, password)

  if (!result.success) {
    return { error: result.error }
  }

  redirect("/dashboard")
}

export async function logout() {
  await logoutUser()
  redirect("/")
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
  console.log("[v0] requestPasswordReset called")

  const email = formData.get("email") as string

  console.log("[v0] Email received:", email)

  if (!email) {
    return { error: "Por favor ingresa tu correo electrónico" }
  }

  try {
    console.log("[v0] Checking if user exists...")

    const users = await db.query("SELECT id, email, name FROM users WHERE email = ?", [email])

    console.log("[v0] Query result:", users)
    console.log("[v0] Users array length:", users?.length)
    console.log("[v0] Users array:", JSON.stringify(users))

    if (!Array.isArray(users) || users.length === 0) {
      console.log("[v0] User not found")
      return { error: "No existe una cuenta con este correo electrónico" }
    }

    const user = users[0] as { id: string; email: string; name: string }
    console.log("[v0] User found:", user.id, user.email)

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    console.log("[v0] Token generated, saving to database...")

    // Save reset token to database
    await db.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?, created_at = NOW()",
      [user.id, resetTokenHash, expiresAt, resetTokenHash, expiresAt],
    )

    console.log("[v0] Token saved, sending email...")

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken)

    console.log("[v0] Email result:", emailResult)

    if (!emailResult.success) {
      console.error("Error al enviar correo:", emailResult.error)
      return {
        error:
          "No se pudo enviar el correo. Verifica la configuración de correo electrónico o intenta de nuevo más tarde.",
      }
    }

    return {
      success: true,
      message: "Se han enviado las instrucciones para restablecer tu contraseña a tu correo electrónico",
    }
  } catch (error) {
    console.error("[v0] Error in password reset request:", error)
    if (error instanceof Error) {
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return { error: "Error al procesar la solicitud. Por favor intenta de nuevo." }
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    // Verify current password
    const users = await db.query("SELECT password_hash FROM users WHERE id = ?", [session.user.id])

    if (!Array.isArray(users) || users.length === 0) {
      return { error: "Usuario no encontrado" }
    }

    const user = users[0] as { password_hash: string }
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)

    if (!isValidPassword) {
      return { error: "La contraseña actual es incorrecta" }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const newPasswordHash = await bcrypt.hash(newPassword, salt)

    // Update password
    await db.query("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?", [
      newPasswordHash,
      session.user.id,
    ])

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating password:", error)
    return { error: "Error al actualizar la contraseña" }
  }
}

export async function requestProfileUpdate(formData: FormData) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const phone = formData.get("phone") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const nationality = formData.get("nationality") as string
    const residenceCountry = formData.get("residenceCountry") as string
    const documentType = formData.get("documentType") as string
    const documentNumber = formData.get("documentNumber") as string

    const requestId = uuidv4()

    // Create a profile update request that needs management approval
    await db.query(
      `INSERT INTO profile_update_requests 
      (id, user_id, first_name, last_name, phone, date_of_birth, nationality, 
       residence_country, document_type, document_number, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        requestId,
        session.user.id,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        nationality,
        residenceCountry,
        documentType,
        documentNumber,
      ],
    )

    return { success: true, message: "Solicitud de actualización enviada. Espera la aprobación de gerencia." }
  } catch (error) {
    console.error("[v0] Error requesting profile update:", error)
    return { error: "Error al solicitar la actualización de perfil" }
  }
}
