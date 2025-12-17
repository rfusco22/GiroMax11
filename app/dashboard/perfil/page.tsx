"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Camera,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Lock,
  Bell,
  LinkIcon,
  Edit,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, updatePassword, requestProfileUpdate } from "@/app/actions/auth"
import { uploadDocumentFile, getUserKYC } from "@/app/actions/kyc"
import { cn } from "@/lib/utils"

interface UserData {
  id: string
  email: string
  name: string
  phone?: string
  country?: string
  documentType?: string
  documentNumber?: string
  nationality?: string
  residenceCountry?: string
  kycStatus?: "none" | "pending" | "approved" | "rejected"
  kycVerifiedAt?: Date
  avatarUrl?: string
  dateOfBirth?: string
}

interface KYCData {
  id: string
  status: "pending" | "approved" | "rejected" | "expired"
  firstName: string
  lastName: string
  dateOfBirth: Date
  nationality: string
  residenceCountry: string
  documentType: "cedula" | "dni" | "pasaporte" | "licencia"
  documentNumber: string
  documentFrontUrl?: string
  selfieUrl?: string
  selfieWithDocumentUrl?: string
  phoneNumber: string
  phoneVerified: boolean
  createdAt: Date
  rejectionReason?: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"datos" | "seguridad" | "notificaciones" | "conexiones">("datos")

  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    residenceCountry: "",
    documentType: "",
    documentNumber: "",
  })

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)

  const [selfie, setSelfie] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null)
  const [documentPhotoPreview, setDocumentPhotoPreview] = useState<string | null>(null)

  const [selfieWithDocument, setSelfieWithDocument] = useState<File | null>(null)
  const [selfieWithDocumentPreview, setSelfieWithDocumentPreview] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const user = await getCurrentUser()
      console.log("[v0] User loaded:", user)
      if (!user) {
        router.push("/login")
        return
      }

      setUserData(user)
      if (user.avatarUrl) {
        setProfilePhotoPreview(user.avatarUrl)
      }

      const kycResult = await getUserKYC()
      console.log("[v0] KYC Result:", kycResult)

      // Split the name into firstName and lastName
      const nameParts = user.name?.split(" ") || []
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      // Extract phone number without country code prefix
      const phoneWithoutPrefix = user.phone?.includes(":") ? user.phone.split(":")[1] : user.phone || ""

      // Format date of birth if it exists
      let formattedDateOfBirth = ""
      if (user.dateOfBirth) {
        try {
          formattedDateOfBirth = new Date(user.dateOfBirth).toISOString().split("T")[0]
        } catch (e) {
          console.error("[v0] Error formatting date of birth:", e)
        }
      }

      // Load data primarily from users table with fallbacks
      const profileData = {
        firstName: firstName,
        lastName: lastName,
        phone: phoneWithoutPrefix,
        dateOfBirth: formattedDateOfBirth,
        nationality: user.nationality || user.country || "",
        residenceCountry: user.residenceCountry || user.country || "",
        documentType: user.documentType || "",
        documentNumber: user.documentNumber || "",
      }

      console.log("[v0] Setting editedData with fallbacks:", profileData)
      setEditedData(profileData)

      // Load KYC data for document images if available
      if (kycResult.kyc) {
        console.log("[v0] KYC Data available for documents:", kycResult.kyc)
        setKycData(kycResult.kyc)

        if (kycResult.kyc.selfieUrl) {
          setSelfiePreview(kycResult.kyc.selfieUrl)
        }
        if (kycResult.kyc.documentFrontUrl) {
          setDocumentPhotoPreview(kycResult.kyc.documentFrontUrl)
        }
        if (kycResult.kyc.selfieWithDocumentUrl) {
          setSelfieWithDocumentPreview(kycResult.kyc.selfieWithDocumentUrl)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleProfilePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("La imagen no debe superar los 5MB")
        return
      }
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("La imagen no debe superar los 5MB")
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
        setUploadError("La imagen no debe superar los 5MB")
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
        setUploadError("La imagen no debe superar los 5MB")
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
    if (!kycData?.id) {
      setUploadError("No se encontró la verificación KYC")
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Upload new documents only if they were changed
      if (selfie) {
        const selfieFormData = new FormData()
        selfieFormData.append("file", selfie)
        selfieFormData.append("type", "selfie")
        selfieFormData.append("kycId", kycData.id)
        const selfieResult = await uploadDocumentFile(selfieFormData)
        if (selfieResult.error) throw new Error(selfieResult.error)
      }

      if (documentPhoto) {
        const docFormData = new FormData()
        docFormData.append("file", documentPhoto)
        docFormData.append("type", "document_front")
        docFormData.append("kycId", kycData.id)
        const docResult = await uploadDocumentFile(docFormData)
        if (docResult.error) throw new Error(docResult.error)
      }

      if (selfieWithDocument) {
        const selfieDocFormData = new FormData()
        selfieDocFormData.append("file", selfieWithDocument)
        selfieDocFormData.append("type", "selfie_with_document")
        selfieDocFormData.append("kycId", kycData.id)
        const selfieDocResult = await uploadDocumentFile(selfieDocFormData)
        if (selfieDocResult.error) throw new Error(selfieDocResult.error)
      }

      await loadUserData()
      alert("Documentos actualizados exitosamente")
    } catch (err: any) {
      setUploadError(err.message || "Error al subir los documentos")
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveProfileChanges() {
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("firstName", editedData.firstName)
      formData.append("lastName", editedData.lastName)
      formData.append("phone", editedData.phone)
      formData.append("dateOfBirth", editedData.dateOfBirth)
      formData.append("nationality", editedData.nationality)
      formData.append("residenceCountry", editedData.residenceCountry)
      formData.append("documentType", editedData.documentType)
      formData.append("documentNumber", editedData.documentNumber)

      const result = await requestProfileUpdate(formData)

      if (result.error) {
        setUploadError(result.error)
      } else {
        alert(result.message || "Solicitud enviada exitosamente")
        setIsEditing(false)
      }
    } catch (err: any) {
      setUploadError(err.message || "Error al enviar la solicitud")
    } finally {
      setUploading(false)
    }
  }

  const verificationStatus = userData?.kycStatus || "none"

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5A017]" />
      </div>
    )
  }

  const tabs = [
    { id: "datos", label: "MIS DATOS", icon: User },
    { id: "seguridad", label: "SEGURIDAD", icon: Lock },
    { id: "notificaciones", label: "NOTIFICACIONES", icon: Bell },
    { id: "conexiones", label: "CONEXIONES", icon: LinkIcon },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-[#2A3254]">
        <CardContent className="p-6">
          <div className="flex gap-6 border-b border-white/10 mb-6 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                    activeTab === tab.id
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white"
                      : "text-white/60 hover:text-white/80",
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === "datos" && (
            <MisDatosTab
              userData={userData}
              kycData={kycData}
              verificationStatus={verificationStatus}
              profilePhotoPreview={profilePhotoPreview}
              handleProfilePhotoChange={handleProfilePhotoChange}
              selfiePreview={selfiePreview}
              handleSelfieChange={handleSelfieChange}
              documentPhotoPreview={documentPhotoPreview}
              handleDocumentPhotoChange={handleDocumentPhotoChange}
              selfieWithDocumentPreview={selfieWithDocumentPreview}
              handleSelfieWithDocumentChange={handleSelfieWithDocumentChange}
              uploading={uploading}
              uploadError={uploadError}
              handleSubmitDocuments={handleSubmitDocuments}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editedData={editedData}
              setEditedData={setEditedData}
              handleSaveProfileChanges={handleSaveProfileChanges}
              setSelfie={setSelfie}
              setSelfiePreview={setSelfiePreview}
              setDocumentPhoto={setDocumentPhoto}
              setDocumentPhotoPreview={setDocumentPhotoPreview}
              setSelfieWithDocument={setSelfieWithDocument}
              setSelfieWithDocumentPreview={setSelfieWithDocumentPreview}
            />
          )}
          {activeTab === "seguridad" && <SeguridadTab />}
          {activeTab === "notificaciones" && <NotificacionesTab />}
          {activeTab === "conexiones" && <ConexionesTab />}
        </CardContent>
      </Card>
    </div>
  )
}

function MisDatosTab({
  userData,
  kycData,
  verificationStatus,
  profilePhotoPreview,
  handleProfilePhotoChange,
  selfiePreview,
  handleSelfieChange,
  documentPhotoPreview,
  handleDocumentPhotoChange,
  selfieWithDocumentPreview,
  handleSelfieWithDocumentChange,
  uploading,
  uploadError,
  handleSubmitDocuments,
  isEditing,
  setIsEditing,
  editedData,
  setEditedData,
  handleSaveProfileChanges,
  setSelfie,
  setSelfiePreview,
  setDocumentPhoto,
  setDocumentPhotoPreview,
  setSelfieWithDocument,
  setSelfieWithDocumentPreview,
}: any) {
  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <p className="text-white/60">Gestiona tu información personal y documentos de verificación</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-[#F5A017] hover:bg-[#F5A017]/90 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfileChanges}
              disabled={uploading}
              className="bg-[#F5A017] hover:bg-[#F5A017]/90 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {verificationStatus === "none" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Verifica tu identidad</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Para poder realizar transacciones sin límites, necesitas completar y subir tus documentos de
                  verificación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === "pending" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-blue-900">Verificación en proceso</h3>
                  <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>
                </div>
                <p className="text-sm text-blue-800">
                  Tu solicitud de verificación está siendo revisada por nuestro equipo. Esto generalmente toma de 24 a
                  48 horas.
                </p>
                {kycData && (
                  <p className="text-xs text-blue-700 mt-2">
                    Enviado el: {new Date(kycData.createdAt).toLocaleString("es-ES")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === "approved" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-green-900">Cuenta Verificada</h3>
                  <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
                </div>
                <p className="text-sm text-green-800">
                  Tu identidad ha sido verificada exitosamente. Ahora puedes realizar transacciones sin límites.
                </p>
                {userData?.kycVerifiedAt && (
                  <p className="text-xs text-green-700 mt-2">
                    Verificado el: {new Date(userData.kycVerifiedAt).toLocaleString("es-ES")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === "rejected" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-red-900">Verificación Rechazada</h3>
                  <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  Tu solicitud de verificación fue rechazada.
                  {kycData?.rejectionReason && (
                    <>
                      {" "}
                      <strong>Motivo:</strong> {kycData.rejectionReason}
                    </>
                  )}
                </p>
                <p className="text-sm text-red-800">
                  Por favor actualiza tus documentos a continuación y vuelve a enviarlos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#121A56] border-white/10">
        <CardContent className="p-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-[#1E2640] border-4 border-white/10 overflow-hidden flex items-center justify-center">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview || "/placeholder.svg"}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white/40" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#F5A017] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#F5A017]/90 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
              </label>
            </div>
            <h2 className="text-xl font-semibold text-white">
              {kycData ? `${kycData.firstName} ${kycData.lastName}` : userData?.name}
            </h2>
            <p className="text-white/60 text-sm">{userData?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">
                Nombre(s)
              </Label>
              <Input
                id="firstName"
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={editedData.firstName}
                onChange={(e) => isEditing && setEditedData({ ...editedData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">
                Apellido(s)
              </Label>
              <Input
                id="lastName"
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={editedData.lastName}
                onChange={(e) => isEditing && setEditedData({ ...editedData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Correo Electrónico
              </Label>
              <Input id="email" className="bg-[#1E2640] border-0 text-white" value={userData?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-white">
                Teléfono
              </Label>
              <Input
                id="telefono"
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={editedData.phone}
                onChange={(e) => isEditing && setEditedData({ ...editedData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-white">
                Fecha de Nacimiento
              </Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="bg-[#1E2640] border-0 text-white pr-10"
                  value={editedData.dateOfBirth}
                  onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                />
              ) : (
                <Input
                  id="dateOfBirth"
                  className="bg-[#1E2640] border-0 text-white pr-10"
                  value={formatDateDisplay(editedData.dateOfBirth)}
                  disabled
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-white">
                Nacionalidad
              </Label>
              <Input
                id="nationality"
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={editedData.nationality}
                onChange={(e) => isEditing && setEditedData({ ...editedData, nationality: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residenceCountry" className="text-white">
                País de Residencia
              </Label>
              <Input
                id="residenceCountry"
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={editedData.residenceCountry}
                onChange={(e) => isEditing && setEditedData({ ...editedData, residenceCountry: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-white">
                Tipo de Documento
              </Label>
              <Input
                id="documentType"
                className="bg-[#1E2640] border-0 text-white uppercase pr-10"
                value={editedData.documentType.toUpperCase()}
                onChange={(e) => isEditing && setEditedData({ ...editedData, documentType: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-white">
                Número de Documento
              </Label>
              <Input
                id="documentNumber"
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={editedData.documentNumber}
                onChange={(e) => isEditing && setEditedData({ ...editedData, documentNumber: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          {uploadError && (
            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {uploadError}
            </div>
          )}

          {/* Verification Documents Section - Always visible */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-xl font-semibold text-white mb-2">Documentos de Verificación</h3>
            <p className="text-white/60 text-sm mb-6">
              {verificationStatus === "none" && "Sube tus documentos para completar la verificación de identidad"}
              {verificationStatus === "pending" && "Tus documentos están siendo revisados"}
              {verificationStatus === "approved" && "Tus documentos han sido aprobados"}
              {verificationStatus === "rejected" && "Actualiza tus documentos y vuelve a enviarlos"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selfie Upload */}
              <Card className="bg-[#1E2640] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    1. Foto de tu rostro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selfiePreview ? (
                    <div className="space-y-2">
                      <img
                        src={selfiePreview || "/placeholder.svg"}
                        alt="Selfie"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {verificationStatus !== "approved" && verificationStatus !== "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent text-white border-white/20"
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
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5">
                      <Upload className="h-8 w-8 text-white/40 mb-2" />
                      <p className="text-xs text-white/60 text-center px-2">Click para subir</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSelfieChange}
                        disabled={verificationStatus === "approved" || verificationStatus === "pending"}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>

              {/* Document Photo Upload */}
              <Card className="bg-[#1E2640] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    2. Foto del Documento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documentPhotoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={documentPhotoPreview || "/placeholder.svg"}
                        alt="Documento"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {verificationStatus !== "approved" && verificationStatus !== "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent text-white border-white/20"
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
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5">
                      <Upload className="h-8 w-8 text-white/40 mb-2" />
                      <p className="text-xs text-white/60 text-center px-2">Click para subir</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleDocumentPhotoChange}
                        disabled={verificationStatus === "approved" || verificationStatus === "pending"}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>

              {/* Selfie with Document Upload */}
              <Card className="bg-[#1E2640] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    3. Selfie con Documento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selfieWithDocumentPreview ? (
                    <div className="space-y-2">
                      <img
                        src={selfieWithDocumentPreview || "/placeholder.svg"}
                        alt="Selfie con Documento"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {verificationStatus !== "approved" && verificationStatus !== "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent text-white border-white/20"
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
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5">
                      <Upload className="h-8 w-8 text-white/40 mb-2" />
                      <p className="text-xs text-white/60 text-center px-2">Click para subir</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSelfieWithDocumentChange}
                        disabled={verificationStatus === "approved" || verificationStatus === "pending"}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submit Button - Only show if not approved or pending */}
            {verificationStatus !== "approved" && verificationStatus !== "pending" && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSubmitDocuments}
                  disabled={uploading || (!selfiePreview && !documentPhotoPreview && !selfieWithDocumentPreview)}
                  className="bg-[#F5A017] hover:bg-[#F5A017]/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Actualizar Documentos"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SeguridadTab() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos son requeridos.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden.")
      return
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updatePassword(currentPassword, newPassword)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Contraseña actualizada exitosamente.")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      setError("Ocurrió un error al actualizar la contraseña.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Cambiar Contraseña</h3>
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">{error}</div>}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">{success}</div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Contraseña Actual
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              {showPassword ? (
                <EyeOff
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">
              Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {showNewPassword ? (
                <EyeOff
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 cursor-pointer"
                  onClick={() => setShowNewPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 cursor-pointer"
                  onClick={() => setShowNewPassword(true)}
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="bg-[#1E2640] border-0 text-white pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {showConfirmPassword ? (
                <EyeOff
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 cursor-pointer"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 cursor-pointer"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Button onClick={handlePasswordChange} disabled={isLoading} className="bg-[#F5A017] hover:bg-[#F5A017]/90">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Cambios"
        )}
      </Button>
    </div>
  )
}

function NotificacionesTab() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [transactionNotifications, setTransactionNotifications] = useState(true)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Preferencias de Notificaciones</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#1E2640] rounded-lg">
          <div>
            <p className="text-white font-medium">Notificaciones por Email</p>
            <p className="text-sm text-white/60">Recibe actualizaciones por correo electrónico</p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-white/20 bg-transparent checked:bg-[#F5A017] checked:border-[#F5A017]"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-[#1E2640] rounded-lg">
          <div>
            <p className="text-white font-medium">Notificaciones de Transacciones</p>
            <p className="text-sm text-white/60">Alertas sobre el estado de tus transacciones</p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-white/20 bg-transparent checked:bg-[#F5A017] checked:border-[#F5A017]"
            checked={transactionNotifications}
            onChange={(e) => setTransactionNotifications(e.target.checked)}
          />
        </div>
      </div>
      <Button className="bg-[#F5A017] hover:bg-[#F5A017]/90 mt-4">Guardar Preferencias</Button>
    </div>
  )
}

function ConexionesTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Conexiones Externas</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#1E2640] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Google Account</p>
              <p className="text-sm text-white/60">No conectado</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Conectar</button>
        </div>
      </div>
    </div>
  )
}
