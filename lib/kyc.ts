import { query, queryOne } from "./db"
import { v4 as uuidv4 } from "uuid"
import { smsService } from "./sms-provider"

export interface KYCVerification {
  id: string
  userId: string
  status: "pending" | "approved" | "rejected" | "expired"
  firstName: string
  lastName: string
  dateOfBirth: Date
  nationality: string
  residenceCountry: string
  documentType: "cedula" | "dni" | "pasaporte" | "licencia"
  documentNumber: string
  documentFrontUrl?: string
  documentBackUrl?: string
  selfieUrl?: string
  selfieWithDocumentUrl?: string
  phoneNumber: string
  phoneVerified: boolean
  phoneVerificationCode?: string
  phoneVerificationExpiresAt?: Date
  phoneVerificationAttempts: number
  phoneVerifiedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface KYCDocument {
  type: "document_front" | "document_back" | "selfie" | "selfie_with_document"
  url: string
}

export async function createKYCVerification(data: {
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  nationality: string
  residenceCountry: string
  documentType: "cedula" | "dni" | "pasaporte" | "licencia"
  documentNumber: string
  phoneNumber: string
}): Promise<{ success: boolean; kycId?: string; error?: string }> {
  try {
    const kycId = uuidv4()

    await query(
      `INSERT INTO kyc_verifications (
        id, user_id, first_name, last_name, date_of_birth, 
        nationality, residence_country, document_type, document_number, 
        phone_number, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        kycId,
        data.userId,
        data.firstName,
        data.lastName,
        data.dateOfBirth,
        data.nationality,
        data.residenceCountry,
        data.documentType,
        data.documentNumber,
        data.phoneNumber,
      ],
    )

    // Update user KYC status
    await query(`UPDATE users SET kyc_status = 'pending', kyc_id = ? WHERE id = ?`, [kycId, data.userId])

    return { success: true, kycId }
  } catch (error) {
    console.error("[v0] Error creating KYC verification:", error)
    return { success: false, error: "Error al crear la verificación KYC" }
  }
}

export async function sendPhoneVerificationCode(
  kycId: string,
  method: "sms" | "whatsapp" = "sms",
): Promise<{ success: boolean; error?: string }> {
  try {
    const kyc = await queryOne<{ phone_number: string; phone_verification_attempts: number }>(
      `SELECT phone_number, phone_verification_attempts FROM kyc_verifications WHERE id = ?`,
      [kycId],
    )

    if (!kyc) {
      return { success: false, error: "Verificación KYC no encontrada" }
    }

    if (kyc.phone_verification_attempts >= 5) {
      return { success: false, error: "Máximo de intentos alcanzado" }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const sendResult = await smsService.sendVerificationCode(kyc.phone_number, code, method)

    if (!sendResult.success) {
      return { success: false, error: sendResult.error }
    }

    // Update KYC with verification code
    await query(
      `UPDATE kyc_verifications 
       SET phone_verification_code = ?, 
           phone_verification_expires_at = ?,
           phone_verification_attempts = phone_verification_attempts + 1,
           updated_at = NOW()
       WHERE id = ?`,
      [code, expiresAt, kycId],
    )

    // Log the verification attempt
    await query(
      `INSERT INTO phone_verification_logs (kyc_id, phone_number, verification_code, method, status, expires_at, created_at)
       VALUES (?, ?, ?, ?, 'sent', ?, NOW())`,
      [kycId, kyc.phone_number, code, method, expiresAt],
    )

    console.log(`[v0] Verification code sent for KYC ${kycId} via ${method}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending verification code:", error)
    return { success: false, error: "Error al enviar el código de verificación" }
  }
}

export async function verifyPhoneCode(kycId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const kyc = await queryOne<{
      phone_verification_code: string
      phone_verification_expires_at: Date
      phone_verification_attempts: number
    }>(
      `SELECT phone_verification_code, phone_verification_expires_at, phone_verification_attempts
       FROM kyc_verifications WHERE id = ?`,
      [kycId],
    )

    if (!kyc) {
      return { success: false, error: "Verificación KYC no encontrada" }
    }

    if (kyc.phone_verification_attempts >= 5) {
      return { success: false, error: "Máximo de intentos alcanzado. Solicita un nuevo código" }
    }

    if (new Date() > new Date(kyc.phone_verification_expires_at)) {
      return { success: false, error: "El código ha expirado. Solicita uno nuevo" }
    }

    if (kyc.phone_verification_code !== code) {
      return { success: false, error: "Código incorrecto" }
    }

    // Mark phone as verified
    await query(
      `UPDATE kyc_verifications 
       SET phone_verified = TRUE, phone_verified_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [kycId],
    )

    // Update verification log
    await query(
      `UPDATE phone_verification_logs 
       SET status = 'verified', verified_at = NOW()
       WHERE kyc_id = ? AND verification_code = ?`,
      [kycId, code],
    )

    return { success: true }
  } catch (error) {
    console.error("[v0] Error verifying phone code:", error)
    return { success: false, error: "Error al verificar el código" }
  }
}

export async function uploadKYCDocument(
  kycId: string,
  documentType: "document_front" | "document_back" | "selfie" | "selfie_with_document",
  documentUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const fieldMap = {
      document_front: "document_front_url",
      document_back: "document_back_url",
      selfie: "selfie_url",
      selfie_with_document: "selfie_with_document_url",
    }

    const field = fieldMap[documentType]

    await query(`UPDATE kyc_verifications SET ${field} = ?, updated_at = NOW() WHERE id = ?`, [documentUrl, kycId])

    return { success: true }
  } catch (error) {
    console.error("[v0] Error uploading KYC document:", error)
    return { success: false, error: "Error al subir el documento" }
  }
}

export async function getKYCByUserId(userId: string): Promise<KYCVerification | null> {
  try {
    const kyc = await queryOne<KYCVerification>(
      `SELECT * FROM kyc_verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId],
    )
    return kyc
  } catch (error) {
    console.error("[v0] Error getting KYC by user ID:", error)
    return null
  }
}

export async function getPendingKYCVerifications(): Promise<KYCVerification[]> {
  try {
    const verifications = await query<any>(
      `SELECT 
        k.id,
        k.user_id as userId,
        k.first_name as firstName,
        k.last_name as lastName,
        k.date_of_birth as dateOfBirth,
        k.nationality,
        k.residence_country as residenceCountry,
        k.document_type as documentType,
        k.document_number as documentNumber,
        k.phone_number as phoneNumber,
        k.phone_verified as phoneVerified,
        k.document_front_url as documentFrontUrl,
        k.document_back_url as documentBackUrl,
        k.selfie_url as selfieUrl,
        k.selfie_with_document_url as selfieWithDocumentUrl,
        k.status,
        k.created_at as createdAt,
        k.updated_at as updatedAt,
        k.reviewed_by as reviewedBy,
        k.reviewed_at as reviewedAt,
        k.rejection_reason as rejectionReason,
        k.notes,
        u.email,
        CONCAT(k.first_name, ' ', k.last_name) as name
       FROM kyc_verifications k
       JOIN users u ON k.user_id = u.id
       WHERE k.status = 'pending'
       ORDER BY k.created_at ASC`,
    )
    return verifications
  } catch (error) {
    console.error("[v0] Error getting pending KYC verifications:", error)
    return []
  }
}

export async function approveKYC(
  kycId: string,
  reviewedBy: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await query(`CALL approve_kyc_verification(?, ?, ?)`, [kycId, reviewedBy, notes || ""])
    return { success: true }
  } catch (error) {
    console.error("[v0] Error approving KYC:", error)
    return { success: false, error: "Error al aprobar la verificación" }
  }
}

export async function rejectKYC(
  kycId: string,
  reviewedBy: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] Rejecting KYC:", { kycId, reviewedBy, reason })
    await query(`CALL reject_kyc_verification(?, ?, ?)`, [kycId, reviewedBy, reason])
    console.log("[v0] KYC rejected successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error rejecting KYC:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al rechazar la verificación"
    return { success: false, error: errorMessage }
  }
}

export async function submitKYCForReview(kycId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if all required documents are uploaded
    const kyc = await queryOne<{
      selfie_url: string | null
      document_front_url: string | null
      selfie_with_document_url: string | null
      user_id: string
    }>(
      `SELECT selfie_url, document_front_url, selfie_with_document_url, user_id 
       FROM kyc_verifications WHERE id = ?`,
      [kycId],
    )

    if (!kyc) {
      return { success: false, error: "Verificación KYC no encontrada" }
    }

    if (!kyc.selfie_url || !kyc.document_front_url || !kyc.selfie_with_document_url) {
      return { success: false, error: "Faltan documentos por subir" }
    }

    // Update KYC status to pending
    await query(
      `UPDATE kyc_verifications 
       SET status = 'pending', updated_at = NOW()
       WHERE id = ?`,
      [kycId],
    )

    // Update user KYC status
    await query(`UPDATE users SET kyc_status = 'pending' WHERE id = ?`, [kyc.user_id])

    return { success: true }
  } catch (error) {
    console.error("[v0] Error submitting KYC for review:", error)
    return { success: false, error: "Error al enviar la verificación para revisión" }
  }
}
