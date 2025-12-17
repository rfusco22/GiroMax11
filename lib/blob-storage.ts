// Blob Storage Service for Document Uploads
// Integrates with Vercel Blob or other storage providers

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
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/upload?type=${documentType}&userId=${userId}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || "Error al subir el archivo",
        }
      }

      const data = await response.json()
      return {
        success: true,
        url: data.url,
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
        const response = await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          return { success: false, error: "Error al eliminar el archivo" }
        }
      }

      return { success: true }
    } catch (error) {
      console.error("[v0] Error deleting document:", error)
      return { success: false, error: "Error al eliminar el documento" }
    }
  }
}

export const blobStorage = new BlobStorageService()
