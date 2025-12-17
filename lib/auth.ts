import { query, queryOne } from "./db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { setSessionCookie, getSessionToken, clearSessionCookie, generateSecureToken } from "./session"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  country?: string
  dateOfBirth?: string
  nationality?: string
  residenceCountry?: string
  documentType?: string
  documentNumber?: string
  verified: boolean
  kycStatus?: "none" | "pending" | "approved" | "rejected"
  kycId?: string
  kycVerifiedAt?: Date
  createdAt: Date
  avatar?: string
  role: "cliente" | "administrador" | "gerencia"
}

export interface Session {
  user: User
  token: string
  expiresAt: Date
}

function generateUUID(): string {
  return uuidv4()
}

export async function registerUser(data: {
  email: string
  password: string
  name: string
  phone?: string
  country?: string
  dateOfBirth?: string
  nationality?: string
  residenceCountry?: string
  documentType?: string
  documentNumber?: string
}): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const existingUser = await queryOne<{ id: string }>("SELECT id FROM users WHERE email = ?", [data.email])

    if (existingUser) {
      return { success: false, error: "El correo electrónico ya está registrado" }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const userId = generateUUID()

    await query(
      `INSERT INTO users (id, email, password_hash, name, phone, country, date_of_birth, 
       nationality, residence_country, document_type, document_number, role, verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cliente', false, NOW())`,
      [
        userId,
        data.email,
        hashedPassword,
        data.name,
        data.phone || null,
        data.country || null,
        data.dateOfBirth || null,
        data.nationality || null,
        data.residenceCountry || null,
        data.documentType || null,
        data.documentNumber || null,
      ],
    )

    const newUser = await queryOne<User>(
      `SELECT id, email, name, phone, country, date_of_birth as dateOfBirth,
              nationality, residence_country as residenceCountry,
              document_type as documentType, document_number as documentNumber,
              role, verified, created_at as createdAt 
       FROM users WHERE id = ?`,
      [userId],
    )

    if (!newUser) {
      return { success: false, error: "Error al crear el usuario" }
    }

    return { success: true, user: newUser }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      success: false,
      error: "Error al registrar el usuario: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; session?: Session }> {
  try {
    const foundUser = await queryOne<User & { password_hash: string }>(
      "SELECT id, email, name, phone, country, role, verified, created_at, password_hash FROM users WHERE email = ?",
      [email],
    )

    if (!foundUser) {
      return { success: false, error: "Credenciales inválidas" }
    }

    if (!foundUser.password_hash) {
      return { success: false, error: "Credenciales inválidas" }
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Credenciales inválidas" }
    }

    const sessionId = generateUUID()
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await query(
      `INSERT INTO sessions (id, token, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [sessionId, token, foundUser.id, expiresAt],
    )

    await setSessionCookie(token, foundUser.id, expiresAt)

    const { password_hash: _, ...userWithoutPassword } = foundUser

    const session: Session = {
      user: userWithoutPassword as User,
      token,
      expiresAt,
    }

    return { success: true, session }
  } catch (error) {
    console.error("Error logging in user:", error)
    return {
      success: false,
      error: "Error al iniciar sesión: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const token = await getSessionToken()

    if (!token) return null

    const sessionData = await queryOne<{ user_id: string; expires_at: Date }>(
      "SELECT user_id, expires_at FROM sessions WHERE token = ?",
      [token],
    )

    if (!sessionData) return null

    const expiresAt = new Date(sessionData.expires_at)

    if (new Date() > expiresAt) {
      await query("DELETE FROM sessions WHERE token = ?", [token])
      await clearSessionCookie()
      return null
    }

    const user = await queryOne<User>(
      `SELECT id, email, name, phone, country, role, verified, 
              date_of_birth as dateOfBirth,
              nationality,
              residence_country as residenceCountry,
              document_type as documentType,
              document_number as documentNumber,
              kyc_status as kycStatus, kyc_id as kycId, kyc_verified_at as kycVerifiedAt, 
              created_at as createdAt 
       FROM users WHERE id = ?`,
      [sessionData.user_id],
    )

    if (!user) return null

    return {
      user,
      token,
      expiresAt,
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    const token = await getSessionToken()

    if (token) {
      await query("DELETE FROM sessions WHERE token = ?", [token])
    }

    await clearSessionCookie()
  } catch (error) {
    console.error("Error logging out:", error)
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User | null> {
  try {
    const updates: string[] = []
    const values: any[] = []

    if (data.name) {
      updates.push("name = ?")
      values.push(data.name)
    }
    if (data.phone) {
      updates.push("phone = ?")
      values.push(data.phone)
    }
    if (data.country) {
      updates.push("country = ?")
      values.push(data.country)
    }
    if (data.dateOfBirth) {
      updates.push("date_of_birth = ?")
      values.push(data.dateOfBirth)
    }
    if (data.nationality) {
      updates.push("nationality = ?")
      values.push(data.nationality)
    }
    if (data.residenceCountry) {
      updates.push("residence_country = ?")
      values.push(data.residenceCountry)
    }
    if (data.documentType) {
      updates.push("document_type = ?")
      values.push(data.documentType)
    }
    if (data.documentNumber) {
      updates.push("document_number = ?")
      values.push(data.documentNumber)
    }
    if (data.verified !== undefined) {
      updates.push("verified = ?")
      values.push(data.verified)
    }
    if (data.kycStatus !== undefined) {
      updates.push("kyc_status = ?")
      values.push(data.kycStatus)
    }
    if (data.kycId) {
      updates.push("kyc_id = ?")
      values.push(data.kycId)
    }
    if (data.kycVerifiedAt) {
      updates.push("kyc_verified_at = ?")
      values.push(data.kycVerifiedAt)
    }

    if (updates.length === 0) return null

    values.push(userId)

    await query(`UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`, values)

    const updatedUser = await queryOne<User>(
      `SELECT id, email, name, phone, country, date_of_birth as dateOfBirth,
              nationality, residence_country as residenceCountry,
              document_type as documentType, document_number as documentNumber,
              role, verified, created_at as createdAt 
       FROM users WHERE id = ?`,
      [userId],
    )

    return updatedUser
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}
