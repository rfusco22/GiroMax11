// Blob Storage Service for Document Uploads
// Integrates with Vercel Blob or other storage providers

import { put, del } from "@vercel/blob"

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export class BlobStorageService {
  private provider: "vercel-blob" | "local"

  constructor() {
    this.provider = process.env.BLOB_STORAGE_PROVIDER === "vercel-blob" ? "vercel-blob" : "local"
  }

  async uploadDocument(file: File, documentType: string, userId: string): Promise<UploadResult> {
    try {
      if (this.provider === "vercel-blob") {
        return await this.uploadToVercelBlob(file, documentType, userId)
      } else {
        return await this.uploadLocally(file, documentType, userId)
      }
    } catch (error) {
      console.error("[v0] Error uploading document:", error)
      return {
        success: false,
        error: "Error al subir el documento",
      }
    }
  }

  private async uploadToVercelBlob(file: File, documentType: string, userId: string): Promise<UploadResult> {
    try {
      const filename = `kyc/${userId}/${documentType}_${Date.now()}.${file.name.split(".").pop()}`

      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      })

      return {
        success: true,
        url: blob.url,
      }
    } catch (error) {
      console.error("[v0] Error uploading to Vercel Blob:", error)
      return {
        success: false,
        error: "Error al conectar con el servicio de almacenamiento",
      }
    }
  }

  private async uploadLocally(file: File, documentType: string, userId: string): Promise<UploadResult> {
    // For development: create a placeholder URL
    // In production, you would upload to your file storage service
    const timestamp = Date.now()
    const filename = `${userId}_${documentType}_${timestamp}.${file.name.split(".").pop()}`
    const placeholderUrl = `/uploads/kyc/${filename}`

    console.log(`[v0] [LocalStorage] Simulating upload of ${file.name} to ${placeholderUrl}`)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      success: true,
      url: placeholderUrl,
    }
  }

  async deleteDocument(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.provider === "vercel-blob") {
        await del(url)
      }

      return { success: true }
    } catch (error) {
      console.error("[v0] Error deleting document:", error)
      return { success: false, error: "Error al eliminar el documento" }
    }
  }
}

export const blobStorage = new BlobStorageService()
