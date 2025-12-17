"use client"

import type React from "react"
import cn from "classnames"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  MessageSquare,
  FileText,
  User,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GirosMaxLogo } from "@/components/giros-max-logo"
import { PhoneInput } from "@/components/ui/phone-input"
import { submitKYCVerification, sendVerificationCode, verifyPhone, uploadDocument } from "@/app/actions/kyc"
import {
  validatePhoneNumber,
  validateDocumentNumber,
  validateAge,
  validateName,
  getAvailableDocumentTypes,
  countryValidationRules,
} from "@/lib/validation"

type Step = "personal" | "phone" | "documents" | "complete"

export default function VerificacionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kycId, setKycId] = useState<string | null>(null)

  // Personal info
  const [firstName, setFirstName] = useState("")
  const [firstNameError, setFirstNameError] = useState("")
  const [lastName, setLastName] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [dateOfBirthError, setDateOfBirthError] = useState("")
  const [nationality, setNationality] = useState("")
  const [residenceCountry, setResidenceCountry] = useState("")
  const [phoneCountry, setPhoneCountry] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [documentNumberError, setDocumentNumberError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneNumberError, setPhoneNumberError] = useState("")

  // Phone verification
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationMethod, setVerificationMethod] = useState<"sms" | "whatsapp">("whatsapp")
  const [codeSent, setCodeSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)

  // Document types to match requirements: selfie, document (Cedula/Licencia/Pasaporte), selfie with document
  const [selfie, setSelfie] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null)
  const [documentPhotoPreview, setDocumentPhotoPreview] = useState<string | null>(null)
  const [selfieWithDocument, setSelfieWithDocument] = useState<File | null>(null)
  const [selfieWithDocumentPreview, setSelfieWithDocumentPreview] = useState<string | null>(null)
  const [uploadingDocuments, setUploadingDocuments] = useState(false)

  const handleFirstNameBlur = () => {
    const result = validateName(firstName, "firstName")
    setFirstNameError(result.valid ? "" : result.error || "")
  }

  const handleLastNameBlur = () => {
    const result = validateName(lastName, "lastName")
    setLastNameError(result.valid ? "" : result.error || "")
  }

  const handleDateOfBirthBlur = () => {
    if (!dateOfBirth) {
      setDateOfBirthError("La fecha de nacimiento es requerida")
      return
    }
    const result = validateAge(dateOfBirth, 18)
    setDateOfBirthError(result.valid ? "" : result.error || "")
  }

  const handleDocumentNumberBlur = () => {
    if (!residenceCountry || !documentType || !documentNumber) {
      return
    }
    const result = validateDocumentNumber(
      documentNumber,
      documentType as "cedula" | "dni" | "pasaporte" | "licencia",
      residenceCountry,
    )
    setDocumentNumberError(result.valid ? "" : result.error || "")
  }

  const handlePhoneNumberBlur = () => {
    if (!phoneCountry || !phoneNumber) {
      return
    }
    const result = validatePhoneNumber(phoneNumber, phoneCountry)
    setPhoneNumberError(result.valid ? "" : result.error || "")
  }

  const handleResidenceCountryChange = (value: string) => {
    setResidenceCountry(value)
    setDocumentType("")
    setDocumentNumber("")
    setDocumentNumberError("")
  }

  async function handlePersonalInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const firstNameValidation = validateName(firstName, "firstName")
    const lastNameValidation = validateName(lastName, "lastName")
    const ageValidation = validateAge(dateOfBirth, 18)
    const documentValidation = validateDocumentNumber(
      documentNumber,
      documentType as "cedula" | "dni" | "pasaporte" | "licencia",
      residenceCountry,
    )
    const phoneValidation = validatePhoneNumber(phoneNumber, phoneCountry)

    if (!firstNameValidation.valid) {
      setFirstNameError(firstNameValidation.error || "")
      setIsLoading(false)
      return
    }

    if (!lastNameValidation.valid) {
      setLastNameError(lastNameValidation.error || "")
      setIsLoading(false)
      return
    }

    if (!ageValidation.valid) {
      setDateOfBirthError(ageValidation.error || "")
      setIsLoading(false)
      return
    }

    if (!documentValidation.valid) {
      setDocumentNumberError(documentValidation.error || "")
      setIsLoading(false)
      return
    }

    if (!phoneValidation.valid) {
      setPhoneNumberError(phoneValidation.error || "")
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("firstName", firstName.trim())
    formData.append("lastName", lastName.trim())
    formData.append("dateOfBirth", dateOfBirth)
    formData.append("nationality", nationality)
    formData.append("residenceCountry", residenceCountry)
    formData.append("documentType", documentType)
    formData.append("documentNumber", documentNumber)
    formData.append("phoneNumber", `${phoneCountry}:${phoneNumber}`)

    const result = await submitKYCVerification(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setKycId(result.kycId!)
    setCurrentStep("phone")
    setIsLoading(false)
  }

  async function handleSendCode() {
    if (!kycId) return

    setIsLoading(true)
    setError(null)

    const result = await sendVerificationCode(kycId, verificationMethod)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setCodeSent(true)
    setIsLoading(false)
  }

  async function handleVerifyPhone(e: React.FormEvent) {
    e.preventDefault()
    if (!kycId) return

    setIsLoading(true)
    setError(null)

    const result = await verifyPhone(kycId, verificationCode)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setPhoneVerified(true)
    setCurrentStep("documents")
    setIsLoading(false)
  }

  function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
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
      setSelfieWithDocument(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfieWithDocumentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleCompleteVerification() {
    if (!selfie || !documentPhoto || !selfieWithDocument) {
      setError("Debes subir los 3 documentos requeridos: Selfie, Foto del Documento y Selfie con Documento")
      return
    }

    setUploadingDocuments(true)
    setError(null)

    try {
      // TODO: Upload to Vercel Blob
      // For now using placeholder URLs
      const selfieUrl = `https://placeholder.com/selfie/${selfie.name}`
      const documentUrl = `https://placeholder.com/document/${documentPhoto.name}`
      const selfieWithDocUrl = `https://placeholder.com/selfie-with-doc/${selfieWithDocument.name}`

      if (kycId) {
        await uploadDocument(kycId, "selfie", selfieUrl)
        await uploadDocument(kycId, "document_front", documentUrl)
        await uploadDocument(kycId, "selfie_with_document", selfieWithDocUrl)
      }

      setCurrentStep("complete")
    } catch (err) {
      setError("Error al subir los documentos. Por favor intenta de nuevo.")
    } finally {
      setUploadingDocuments(false)
    }
  }

  const steps = [
    { id: "personal", label: "Datos Personales", icon: "1" },
    { id: "phone", label: "Verificación Telefónica", icon: "2" },
    { id: "documents", label: "Documentos", icon: "3" },
    { id: "complete", label: "Completado", icon: "✓" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const availableDocumentTypes = residenceCountry ? getAvailableDocumentTypes(residenceCountry) : []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <GirosMaxLogo size="sm" />
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Ir al dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                        index <= currentStepIndex ? "bg-[#F5A017] text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-xs text-center ${
                        index <= currentStepIndex ? "text-[#F5A017] font-medium" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${index < currentStepIndex ? "bg-[#F5A017]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === "personal" && "Datos Personales"}
                {currentStep === "phone" && "Verificación Telefónica"}
                {currentStep === "documents" && "Documentos de Identidad"}
                {currentStep === "complete" && "Verificación Completada"}
              </CardTitle>
              <CardDescription>
                {currentStep === "personal" && "Completa tu información personal para comenzar"}
                {currentStep === "phone" && "Verifica tu número de teléfono"}
                {currentStep === "documents" &&
                  "Sube 3 documentos: Selfie, Foto de tu documento y Selfie sosteniendo el documento"}
                {currentStep === "complete" && "Tu solicitud está siendo revisada"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Personal Info */}
              {currentStep === "personal" && (
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombres *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value)
                          setFirstNameError("")
                        }}
                        onBlur={handleFirstNameBlur}
                        placeholder="Juan Carlos"
                        required
                        className={cn(firstNameError && "border-red-500")}
                      />
                      {firstNameError && <p className="text-sm text-red-600">{firstNameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value)
                          setLastNameError("")
                        }}
                        onBlur={handleLastNameBlur}
                        placeholder="García Pérez"
                        required
                        className={cn(lastNameError && "border-red-500")}
                      />
                      {lastNameError && <p className="text-sm text-red-600">{lastNameError}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Fecha de Nacimiento * (Debes ser mayor de 18 años)</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value)
                        setDateOfBirthError("")
                      }}
                      onBlur={handleDateOfBirthBlur}
                      max={new Date().toISOString().split("T")[0]}
                      required
                      className={cn(dateOfBirthError && "border-red-500")}
                    />
                    {dateOfBirthError && <p className="text-sm text-red-600">{dateOfBirthError}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nacionalidad *</Label>
                      <Select value={nationality} onValueChange={setNationality}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu nacionalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryValidationRules.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="residenceCountry">País de Residencia *</Label>
                      <Select value={residenceCountry} onValueChange={handleResidenceCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryValidationRules.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Tipo de Documento *</Label>
                      <Select
                        value={documentType}
                        onValueChange={(value) => {
                          setDocumentType(value)
                          setDocumentNumber("")
                          setDocumentNumberError("")
                        }}
                        disabled={!residenceCountry}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={residenceCountry ? "Selecciona el tipo" : "Selecciona primero un país"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDocumentTypes.map((doc) => (
                            <SelectItem key={doc.value} value={doc.value}>
                              {doc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Número de Documento *</Label>
                      <Input
                        id="documentNumber"
                        value={documentNumber}
                        onChange={(e) => {
                          setDocumentNumber(e.target.value)
                          setDocumentNumberError("")
                        }}
                        onBlur={handleDocumentNumberBlur}
                        placeholder="12345678"
                        required
                        disabled={!documentType}
                        className={cn(documentNumberError && "border-red-500")}
                      />
                      {documentNumberError && <p className="text-sm text-red-600">{documentNumberError}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Teléfono Celular *</Label>
                    <PhoneInput
                      value={phoneNumber}
                      onChange={(value) => {
                        setPhoneNumber(value)
                        setPhoneNumberError("")
                      }}
                      selectedCountry={phoneCountry}
                      onCountryChange={(code) => {
                        setPhoneCountry(code)
                        setPhoneNumber("")
                        setPhoneNumberError("")
                      }}
                      error={phoneNumberError}
                    />
                    {phoneCountry && !phoneNumberError && (
                      <p className="text-xs text-muted-foreground">
                        Recibirás un código de verificación en este número
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#121A56] hover:bg-[#121A56]/90"
                    disabled={
                      isLoading ||
                      !firstName ||
                      !lastName ||
                      !dateOfBirth ||
                      !nationality ||
                      !residenceCountry ||
                      !documentType ||
                      !documentNumber ||
                      !phoneCountry ||
                      !phoneNumber ||
                      !!firstNameError ||
                      !!lastNameError ||
                      !!dateOfBirthError ||
                      !!documentNumberError ||
                      !!phoneNumberError
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: Phone Verification */}
              {currentStep === "phone" && !phoneVerified && (
                <div className="space-y-6">
                  {!codeSent ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Selecciona cómo deseas recibir el código de verificación</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setVerificationMethod("sms")}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-all",
                            verificationMethod === "sms"
                              ? "border-[#F5A017] bg-[#F5A017]/10"
                              : "border-gray-200 hover:border-[#F5A017]/50",
                          )}
                        >
                          <div className="text-center">
                            <Phone className="h-8 w-8 mx-auto mb-2 text-[#F5A017]" />
                            <p className="font-medium">SMS</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationMethod("whatsapp")}
                          className={cn(
                            "p-4 border-2 rounded-lg transition-all",
                            verificationMethod === "whatsapp"
                              ? "border-[#F5A017] bg-[#F5A017]/10"
                              : "border-gray-200 hover:border-[#F5A017]/50",
                          )}
                        >
                          <div className="text-center">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#F5A017]" />
                            <p className="font-medium">WhatsApp</p>
                          </div>
                        </button>
                      </div>
                      <Button
                        onClick={handleSendCode}
                        disabled={isLoading}
                        className="w-full bg-[#121A56] hover:bg-[#121A56]/90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          `Enviar código por ${verificationMethod === "sms" ? "SMS" : "WhatsApp"}`
                        )}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyPhone} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Código de Verificación</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Hemos enviado un código de 6 dígitos a tu{" "}
                          {verificationMethod === "sms" ? "teléfono" : "WhatsApp"}
                        </p>
                        <Input
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading || verificationCode.length !== 6}
                        className="w-full bg-[#121A56] hover:bg-[#121A56]/90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          "Verificar Código"
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {currentStep === "documents" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Documentos Requeridos</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Selfie: Una foto clara de tu rostro</li>
                      <li>✓ Documento: Foto de tu cédula, licencia o pasaporte (debe ser legible)</li>
                      <li>✓ Selfie con Documento: Una foto donde se vea tu cara y el documento al mismo tiempo</li>
                    </ul>
                  </div>

                  {/* Selfie */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">1. Selfie</Label>
                    <p className="text-sm text-muted-foreground">
                      Toma una foto clara de tu rostro, asegúrate de que esté bien iluminada
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F5A017] transition-colors">
                      {selfiePreview ? (
                        <div className="space-y-3">
                          <img
                            src={selfiePreview || "/placeholder.svg"}
                            alt="Selfie"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelfie(null)
                              setSelfiePreview(null)
                            }}
                          >
                            Cambiar foto
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleSelfieChange}
                            className="hidden"
                          />
                          <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm font-medium">Toca para tomar una selfie</p>
                          <p className="text-xs text-muted-foreground mt-1">o selecciona una imagen</p>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Document Photo */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">2. Foto del Documento</Label>
                    <p className="text-sm text-muted-foreground">
                      Foto de tu{" "}
                      {documentType === "cedula" ? "cédula" : documentType === "licencia" ? "licencia" : "pasaporte"}.
                      Asegúrate de que todos los datos sean legibles
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F5A017] transition-colors">
                      {documentPhotoPreview ? (
                        <div className="space-y-3">
                          <img
                            src={documentPhotoPreview || "/placeholder.svg"}
                            alt="Documento"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDocumentPhoto(null)
                              setDocumentPhotoPreview(null)
                            }}
                          >
                            Cambiar foto
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleDocumentPhotoChange}
                            className="hidden"
                          />
                          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm font-medium">Toca para fotografiar tu documento</p>
                          <p className="text-xs text-muted-foreground mt-1">o selecciona una imagen</p>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Selfie with Document */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">3. Selfie con Documento</Label>
                    <p className="text-sm text-muted-foreground">
                      Toma una foto donde se vea tu cara y tu documento claramente. Sostén el documento cerca de tu
                      rostro
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F5A017] transition-colors">
                      {selfieWithDocumentPreview ? (
                        <div className="space-y-3">
                          <img
                            src={selfieWithDocumentPreview || "/placeholder.svg"}
                            alt="Selfie con Documento"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelfieWithDocument(null)
                              setSelfieWithDocumentPreview(null)
                            }}
                          >
                            Cambiar foto
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleSelfieWithDocumentChange}
                            className="hidden"
                          />
                          <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm font-medium">Toca para tomar selfie con documento</p>
                          <p className="text-xs text-muted-foreground mt-1">o selecciona una imagen</p>
                        </label>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteVerification}
                    disabled={!selfie || !documentPhoto || !selfieWithDocument || uploadingDocuments}
                    className="w-full bg-[#121A56] hover:bg-[#121A56]/90"
                  >
                    {uploadingDocuments ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo documentos...
                      </>
                    ) : (
                      <>
                        Enviar Documentos
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Step 4: Complete */}
              {currentStep === "complete" && (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Documentos Enviados</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Tus documentos han sido enviados correctamente y están siendo revisados por nuestro equipo de
                      gerencia. Te notificaremos cuando tu cuenta sea verificada.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-900">
                      <strong>Tiempo estimado:</strong> 24-48 horas laborables
                    </p>
                  </div>
                  <Button asChild className="bg-[#121A56] hover:bg-[#121A56]/90">
                    <Link href="/dashboard">
                      Ir al Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
