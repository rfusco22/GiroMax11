"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GirosMaxLogo } from "@/components/giros-max-logo"
import { AnimatedLogo } from "@/components/dashboard/animated-logo"
import { uploadDocumentFile, getUserKYC, submitKYCForReview } from "@/app/actions/kyc"
import { getCurrentUser } from "@/app/actions/auth"

export default function SubirDocumentosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kycId, setKycId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const [selfie, setSelfie] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [selfieUploaded, setSelfieUploaded] = useState(false)

  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null)
  const [documentPhotoPreview, setDocumentPhotoPreview] = useState<string | null>(null)
  const [documentPhotoUploaded, setDocumentPhotoUploaded] = useState(false)

  const [selfieWithDocument, setSelfieWithDocument] = useState<File | null>(null)
  const [selfieWithDocumentPreview, setSelfieWithDocumentPreview] = useState<string | null>(null)
  const [selfieWithDocumentUploaded, setSelfieWithDocumentUploaded] = useState(false)

  useEffect(() => {
    loadUserKYC()
  }, [])

  async function loadUserKYC() {
    const user = await getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    const result = await getUserKYC()

    if (result.kyc) {
      setKycId(result.kyc.id)
      // Only redirect if already submitted for review or approved
      if (result.kyc.status === "pending" || result.kyc.status === "approved") {
        router.push("/dashboard")
        return
      }
    } else {
      // If no KYC record exists, redirect to profile to complete registration
      setError("Por favor completa tu perfil antes de subir documentos")
      router.push("/dashboard/perfil")
      return
    }

    setInitialLoading(false)
  }

  function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB")
        return
      }
      setSelfie(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleDocumentPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB")
        return
      }
      setDocumentPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocumentPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSelfieWithDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB")
        return
      }
      setSelfieWithDocument(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfieWithDocumentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmitDocuments() {
    if (!selfie || !documentPhoto || !selfieWithDocument) {
      setError("Debes subir los 3 documentos requeridos")
      return
    }

    if (!kycId) {
      setError("Error: No se encontró la solicitud de verificación")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Upload selfie
      const selfieFormData = new FormData()
      selfieFormData.append("file", selfie)
      selfieFormData.append("type", "selfie")
      selfieFormData.append("kycId", kycId)
      const selfieResult = await uploadDocumentFile(selfieFormData)
      if (selfieResult.error) {
        throw new Error(selfieResult.error)
      }
      setSelfieUploaded(true)

      // Upload document photo
      const docFormData = new FormData()
      docFormData.append("file", documentPhoto)
      docFormData.append("type", "document_front")
      docFormData.append("kycId", kycId)
      const docResult = await uploadDocumentFile(docFormData)
      if (docResult.error) {
        throw new Error(docResult.error)
      }
      setDocumentPhotoUploaded(true)

      // Upload selfie with document
      const selfieDocFormData = new FormData()
      selfieDocFormData.append("file", selfieWithDocument)
      selfieDocFormData.append("type", "selfie_with_document")
      selfieDocFormData.append("kycId", kycId)
      const selfieDocResult = await uploadDocumentFile(selfieDocFormData)
      if (selfieDocResult.error) {
        throw new Error(selfieDocResult.error)
      }
      setSelfieWithDocumentUploaded(true)

      const submitResult = await submitKYCForReview(kycId)
      if (submitResult.error) {
        throw new Error(submitResult.error)
      }

      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Error al subir los documentos")
      setSelfieUploaded(false)
      setDocumentPhotoUploaded(false)
      setSelfieWithDocumentUploaded(false)
    } finally {
      setIsLoading(false)
    }
  }

  const allDocsUploaded = selfieUploaded && documentPhotoUploaded && selfieWithDocumentUploaded

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5A017]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:flex-1 bg-[#121A56] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F5A017]/10 to-transparent" />
        <div className="relative flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <AnimatedLogo />
            <span className="text-[#F5A017] font-bold italic text-3xl tracking-wide">GIROS MAX</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6">Solo un paso más</h2>
          <p className="text-xl text-white/80 mb-12">
            Verifica tu identidad para poder realizar transacciones sin límites
          </p>

          <div className="space-y-6">
            {[
              "Proceso rápido y seguro",
              "Revisión en 24-48 horas",
              "Datos protegidos con encriptación",
              "Soporte 24/7 disponible",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F5A017]/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#F5A017]" />
                </div>
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col px-4 py-12 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Ir al dashboard
            </Link>
            <div className="lg:hidden">
              <GirosMaxLogo size="sm" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Verificación de Identidad</h1>
            <p className="text-muted-foreground">
              Sube los siguientes documentos para verificar tu identidad y comenzar a usar Giros Max
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {allDocsUploaded && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Documentos subidos exitosamente</p>
                <p className="text-sm text-green-700">
                  Tu solicitud está siendo revisada por nuestro equipo. Serás redirigido al dashboard...
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Selfie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  1. Selfie (Foto de tu rostro)
                  {selfieUploaded && <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />}
                </CardTitle>
                <CardDescription>
                  Toma una foto clara de tu rostro, asegurándote de que se vea completamente y con buena iluminación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selfiePreview ? (
                    <div className="relative">
                      <img
                        src={selfiePreview || "/placeholder.svg"}
                        alt="Selfie"
                        className="w-full max-w-xs mx-auto rounded-lg"
                      />
                      {!selfieUploaded && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => {
                            setSelfie(null)
                            setSelfiePreview(null)
                          }}
                        >
                          Cambiar foto
                        </Button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click para subir</span> o arrastra tu foto
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSelfieChange}
                        disabled={selfieUploaded}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  2. Foto del Documento (Cédula, Licencia o Pasaporte)
                  {documentPhotoUploaded && <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />}
                </CardTitle>
                <CardDescription>
                  Fotografía clara de tu documento de identidad. Asegúrate de que todos los datos sean legibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentPhotoPreview ? (
                    <div className="relative">
                      <img
                        src={documentPhotoPreview || "/placeholder.svg"}
                        alt="Documento"
                        className="w-full max-w-xs mx-auto rounded-lg"
                      />
                      {!documentPhotoUploaded && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => {
                            setDocumentPhoto(null)
                            setDocumentPhotoPreview(null)
                          }}
                        >
                          Cambiar foto
                        </Button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click para subir</span> o arrastra tu foto
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleDocumentPhotoChange}
                        disabled={documentPhotoUploaded}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selfie with Document */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  3. Selfie con el Documento
                  {selfieWithDocumentUploaded && <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />}
                </CardTitle>
                <CardDescription>
                  Toma una foto de ti sosteniendo tu documento de identidad. Ambos deben ser visibles y claros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selfieWithDocumentPreview ? (
                    <div className="relative">
                      <img
                        src={selfieWithDocumentPreview || "/placeholder.svg"}
                        alt="Selfie con documento"
                        className="w-full max-w-xs mx-auto rounded-lg"
                      />
                      {!selfieWithDocumentUploaded && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => {
                            setSelfieWithDocument(null)
                            setSelfieWithDocumentPreview(null)
                          }}
                        >
                          Cambiar foto
                        </Button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click para subir</span> o arrastra tu foto
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSelfieWithDocumentChange}
                        disabled={selfieWithDocumentUploaded}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex gap-4">
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Hacer después
              </Link>
            </Button>
            <Button
              onClick={handleSubmitDocuments}
              disabled={!selfie || !documentPhoto || !selfieWithDocument || isLoading || allDocsUploaded}
              className="flex-1 bg-[#121A56] hover:bg-[#121A56]/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : allDocsUploaded ? (
                "Documentos Enviados"
              ) : (
                "Enviar Documentos"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
