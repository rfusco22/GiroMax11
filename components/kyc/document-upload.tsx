"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Camera, CheckCircle2, AlertCircle, X, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface DocumentUploadProps {
  label: string
  description: string
  documentType: "document_front" | "document_back" | "selfie" | "selfie_with_document"
  onUpload: (file: File, type: string) => Promise<{ success: boolean; error?: string }>
  useCamera?: boolean
  value?: string | null
}

export function DocumentUpload({
  label,
  description,
  documentType,
  onUpload,
  useCamera = false,
  value,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(value || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo es muy grande. Máximo 10MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    setError(null)

    const result = await onUpload(file, documentType)

    if (result.error) {
      setError(result.error)
      setPreviewUrl(null)
      setIsUploading(false)
      return
    }

    setUploadedUrl(previewUrl)
    setIsUploading(false)
  }

  function handleRemove() {
    setUploadedUrl(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>

      <Card className="border-2 border-dashed hover:border-[#F5A017] transition-colors">
        <CardContent className="p-6">
          {!uploadedUrl && !previewUrl ? (
            <label htmlFor={documentType} className="cursor-pointer">
              <input
                ref={fileInputRef}
                id={documentType}
                type="file"
                accept="image/*"
                capture={useCamera ? "environment" : undefined}
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              <div className="flex flex-col items-center justify-center py-8">
                {useCamera ? (
                  <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                )}

                <p className="text-sm font-medium text-foreground mb-1">{useCamera ? "Tomar foto" : "Subir archivo"}</p>
                <p className="text-xs text-muted-foreground">PNG, JPG hasta 10MB</p>

                {isUploading && (
                  <div className="mt-4">
                    <Loader2 className="h-6 w-6 animate-spin text-[#F5A017]" />
                  </div>
                )}
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                {previewUrl && (
                  <img src={previewUrl || "/placeholder.svg"} alt={label} className="w-full h-48 object-contain" />
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                {uploadedUrl ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Documento cargado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#F5A017]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Subiendo...</span>
                  </div>
                )}

                {uploadedUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                    <X className="h-4 w-4 mr-1" />
                    Cambiar
                  </Button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface DocumentUploadGridProps {
  onUpload: (file: File, type: string) => Promise<{ success: boolean; error?: string; url?: string }>
  onComplete: () => void
  initialValues?: {
    documentFront?: string
    documentBack?: string
    selfie?: string
    selfieWithDoc?: string
  }
}

export function DocumentUploadGrid({ onUpload, onComplete, initialValues }: DocumentUploadGridProps) {
  const [documents, setDocuments] = useState({
    documentFront: initialValues?.documentFront || null,
    documentBack: initialValues?.documentBack || null,
    selfie: initialValues?.selfie || null,
    selfieWithDoc: initialValues?.selfieWithDoc || null,
  })

  async function handleDocumentUpload(
    file: File,
    type: string,
  ): Promise<{ success: boolean; error?: string; url?: string }> {
    const result = await onUpload(file, type)

    if (result.success && result.url) {
      setDocuments((prev) => ({
        ...prev,
        [type === "document_front"
          ? "documentFront"
          : type === "document_back"
            ? "documentBack"
            : type === "selfie"
              ? "selfie"
              : "selfieWithDoc"]: result.url,
      }))
    }

    return result
  }

  const allDocumentsUploaded =
    documents.documentFront && documents.documentBack && documents.selfie && documents.selfieWithDoc

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-900">Instrucciones importantes:</p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Las fotos deben ser claras y legibles</li>
                <li>El documento debe estar vigente (no vencido)</li>
                <li>Asegúrate de que no haya reflejos o sombras</li>
                <li>En la selfie con documento, tu rostro y el documento deben ser visibles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        <DocumentUpload
          label="Documento de Identidad (Frente)"
          description="Foto del frente de tu documento"
          documentType="document_front"
          onUpload={handleDocumentUpload}
          value={documents.documentFront}
        />

        <DocumentUpload
          label="Documento de Identidad (Reverso)"
          description="Foto del reverso de tu documento"
          documentType="document_back"
          onUpload={handleDocumentUpload}
          value={documents.documentBack}
        />

        <DocumentUpload
          label="Selfie"
          description="Una foto clara de tu rostro"
          documentType="selfie"
          onUpload={handleDocumentUpload}
          useCamera={true}
          value={documents.selfie}
        />

        <DocumentUpload
          label="Selfie con Documento"
          description="Foto sosteniendo tu documento junto a tu rostro"
          documentType="selfie_with_document"
          onUpload={handleDocumentUpload}
          useCamera={true}
          value={documents.selfieWithDoc}
        />
      </div>

      {/* Complete button */}
      <Button
        onClick={onComplete}
        className="w-full bg-[#121A56] hover:bg-[#121A56]/90 h-12"
        disabled={!allDocumentsUploaded}
      >
        {allDocumentsUploaded ? "Completar Verificación" : "Completa todos los documentos para continuar"}
      </Button>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>{Object.values(documents).filter(Boolean).length} de 4 documentos cargados</span>
      </div>
    </div>
  )
}
