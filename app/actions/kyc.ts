"use server"
import { getSession } from "@/lib/auth"
import {
  createKYCVerification,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  uploadKYCDocument,
  getKYCByUserId,
  approveKYC,
  rejectKYC,
  getPendingKYCVerifications,
  submitKYCForReview as submitKYCLib,
} from "@/lib/kyc"
import { blobStorage } from "@/lib/blob-storage"

export async function submitKYCVerification(formData: FormData) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const nationality = formData.get("nationality") as string
    const residenceCountry = formData.get("residenceCountry") as string
    const documentType = formData.get("documentType") as "cedula" | "dni" | "pasaporte" | "licencia"
    const documentNumber = formData.get("documentNumber") as string
    const phoneNumber = formData.get("phoneNumber") as string

    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !nationality ||
      !residenceCountry ||
      !documentType ||
      !documentNumber ||
      !phoneNumber
    ) {
      return { error: "Todos los campos son requeridos" }
    }

    const result = await createKYCVerification({
      userId: session.user.id,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      nationality,
      residenceCountry,
      documentType,
      documentNumber,
      phoneNumber,
    })

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true, kycId: result.kycId }
  } catch (error) {
    console.error("[v0] Error submitting KYC:", error)
    return { error: "Error al enviar la verificación" }
  }
}

export async function sendVerificationCode(kycId: string, method: "sms" | "whatsapp" = "sms") {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const result = await sendPhoneVerificationCode(kycId, method)

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending verification code:", error)
    return { error: "Error al enviar el código" }
  }
}

export async function verifyPhone(kycId: string, code: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const result = await verifyPhoneCode(kycId, code)

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error verifying phone:", error)
    return { error: "Error al verificar el teléfono" }
  }
}

export async function uploadDocument(kycId: string, documentType: string, documentUrl: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const result = await uploadKYCDocument(
      kycId,
      documentType as "document_front" | "document_back" | "selfie" | "selfie_with_document",
      documentUrl,
    )

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error uploading document:", error)
    return { error: "Error al subir el documento" }
  }
}

export async function uploadDocumentFile(formData: FormData) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const file = formData.get("file") as File
    const documentType = formData.get("type") as string
    const kycId = formData.get("kycId") as string

    if (!file || !documentType || !kycId) {
      return { error: "Datos incompletos" }
    }

    // Upload to blob storage
    const uploadResult = await blobStorage.uploadDocument(file, documentType, session.user.id)

    if (!uploadResult.success) {
      return { error: uploadResult.error }
    }

    // Save URL to database
    const result = await uploadKYCDocument(
      kycId,
      documentType as "document_front" | "document_back" | "selfie" | "selfie_with_document",
      uploadResult.url!,
    )

    if (!result.success) {
      // If database update fails, try to delete the uploaded file
      await blobStorage.deleteDocument(uploadResult.url!)
      return { error: result.error }
    }

    return { success: true, url: uploadResult.url }
  } catch (error) {
    console.error("[v0] Error uploading document file:", error)
    return { error: "Error al subir el documento" }
  }
}

export async function getUserKYC() {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const kyc = await getKYCByUserId(session.user.id)
    return { kyc }
  } catch (error) {
    console.error("[v0] Error getting user KYC:", error)
    return { error: "Error al obtener la verificación" }
  }
}

export async function getPendingKYCs() {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    if (session.user.role !== "gerencia" && session.user.role !== "administrador") {
      return { error: "No autorizado" }
    }

    const kycs = await getPendingKYCVerifications()
    return { kycs }
  } catch (error) {
    console.error("[v0] Error getting pending KYCs:", error)
    return { error: "Error al obtener verificaciones pendientes" }
  }
}

export async function approveKYCVerification(kycId: string, notes?: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    if (session.user.role !== "gerencia") {
      return { error: "No autorizado" }
    }

    const result = await approveKYC(kycId, session.user.id, notes)

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error approving KYC:", error)
    return { error: "Error al aprobar la verificación" }
  }
}

export async function rejectKYCVerification(kycId: string, reason: string) {
  try {
    console.log("[v0] rejectKYCVerification called with:", { kycId, reason })
    const session = await getSession()
    if (!session) {
      console.log("[v0] No session found")
      return { error: "No autenticado" }
    }

    console.log("[v0] Session user role:", session.user.role)
    if (session.user.role !== "gerencia" && session.user.role !== "administrador") {
      console.log("[v0] User not authorized, role:", session.user.role)
      return { error: "No autorizado" }
    }

    console.log("[v0] Calling rejectKYC lib function")
    const result = await rejectKYC(kycId, session.user.id, reason)

    if (!result.success) {
      console.log("[v0] rejectKYC failed:", result.error)
      return { error: result.error }
    }

    console.log("[v0] KYC rejection successful")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error rejecting KYC:", error)
    return { error: "Error al rechazar la verificación" }
  }
}

export async function submitKYCForReview(kycId: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    const result = await submitKYCLib(kycId)

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error submitting KYC for review:", error)
    return { error: "Error al enviar para revisión" }
  }
}

export async function getOrCreateKYC() {
  try {
    const session = await getSession()
    if (!session) {
      return { error: "No autenticado" }
    }

    // Check if KYC already exists
    const kyc = await getKYCByUserId(session.user.id)

    if (kyc) {
      return { success: true, kycId: kyc.id }
    }

    // Get user data from database to create KYC
    const { query: dbQuery } = await import("@/lib/db")
    const user = await dbQuery(
      `SELECT name, date_of_birth, document_type, document_number, nationality, residence_country, phone 
       FROM users WHERE id = ?`,
      [session.user.id],
    )

    if (!user || user.length === 0) {
      return { error: "Usuario no encontrado" }
    }

    const userData = user[0]

    // Split name into first and last name
    const nameParts = (userData.name || "").trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Validate required fields
    if (!firstName || !userData.date_of_birth || !userData.document_type || !userData.document_number) {
      return { error: "Faltan datos del perfil. Por favor completa tu información personal primero." }
    }

    // Extract phone number without country code
    const phoneNumber = userData.phone?.includes(":") ? userData.phone.split(":")[1] : userData.phone || ""

    // Create KYC verification
    const result = await createKYCVerification({
      userId: session.user.id,
      firstName,
      lastName,
      dateOfBirth: new Date(userData.date_of_birth),
      nationality: userData.nationality || "VE",
      residenceCountry: userData.residence_country || "VE",
      documentType: userData.document_type,
      documentNumber: userData.document_number,
      phoneNumber,
    })

    if (!result.success) {
      return { error: result.error }
    }

    return { success: true, kycId: result.kycId }
  } catch (error) {
    console.error("[v0] Error getting or creating KYC:", error)
    return { error: "Error al crear la verificación KYC" }
  }
}
