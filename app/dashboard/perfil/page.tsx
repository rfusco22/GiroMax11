"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, redirect } from "next/navigation"
import { Loader2, User, Lock, Bell, LinkIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser, requestProfileUpdate } from "@/app/actions/auth"
import { uploadDocumentFile, getUserKYC, getOrCreateKYC, getUserProfile } from "@/app/actions/kyc"
import { cn } from "@/lib/utils"
import SeguridadTab from "@/app/dashboard/perfil/seguridadTab"
import NotificacionesTab from "@/app/dashboard/perfil/notificacionesTab"
import ConexionesTab from "@/app/dashboard/perfil/conexionesTab"
import MisDatosTab from "@/app/dashboard/perfil/misDatosTab"

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
  firstName?: string
  lastName?: string
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
  const [verificationStatus, setVerificationStatus] = useState<"none" | "pending" | "approved" | "rejected">("none")

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
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    residenceCountry: "",
    documentType: "",
    documentNumber: "",
  })

  useEffect(() => {
    async function loadProfileData() {
      try {
        const session = await getCurrentUser()
        if (!session) {
          redirect("/auth/login")
        }

        // Load user data from database
        const result = await getUserProfile()

        if (result.error) {
          setError(result.error)
          return
        }

        setUserData(result.user!)
        setVerificationStatus(result.user?.kycStatus || "none")
        setFormData({
          firstName: result.user?.firstName || "",
          lastName: result.user?.lastName || "",
          email: result.user?.email || "",
          phone: result.user?.phone || "",
          dateOfBirth: result.user?.dateOfBirth || "",
          nationality: result.user?.nationality || "VE",
          residenceCountry: result.user?.residenceCountry || "VE",
          documentType: result.user?.documentType || "cedula",
          documentNumber: result.user?.documentNumber || "",
        })

        if (result.user?.avatarUrl) {
          setProfilePhotoPreview(result.user.avatarUrl)
        }

        // Load KYC data to get document images
        const kycResult = await getUserKYC()

        if (kycResult.kyc) {
          console.log("[v0] KYC Data available:", kycResult.kyc)
          setKycData(kycResult.kyc)

          // Only load existing photos if status is pending or approved
          // If rejected, clear photos to allow new uploads
          if (kycResult.kyc.status === "rejected") {
            console.log("[v0] KYC rejected, clearing photos for re-upload")
            setSelfiePreview(null)
            setDocumentPhotoPreview(null)
            setSelfieWithDocumentPreview(null)
          } else {
            // Load existing photos for pending or approved statuses
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
        }
      } catch (error) {
        console.error("[v0] Error loading profile data:", error)
        setError("Error al cargar el perfil")
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
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
      console.log("[v0] No KYC found, creating new KYC verification...")
      const createResult = await getOrCreateKYC()

      if (createResult.error) {
        setUploadError(createResult.error)
        return
      }

      // Reload user data to get the new KYC ID
      await loadUserData()

      // Get the updated KYC data
      const kycResult = await getUserKYC()
      if (kycResult.error || !kycResult.kyc?.id) {
        setUploadError("Error al crear la verificación KYC")
        return
      }

      // Update local kycData state
      setKycData(kycResult.kyc)

      // Use the new KYC ID for uploads
      const newKycId = kycResult.kyc.id

      setUploading(true)
      setUploadError(null)

      try {
        // Upload new documents
        if (selfie) {
          const selfieFormData = new FormData()
          selfieFormData.append("file", selfie)
          selfieFormData.append("type", "selfie")
          selfieFormData.append("kycId", newKycId)
          const selfieResult = await uploadDocumentFile(selfieFormData)
          if (selfieResult.error) throw new Error(selfieResult.error)
        }

        if (documentPhoto) {
          const docFormData = new FormData()
          docFormData.append("file", documentPhoto)
          docFormData.append("type", "document_front")
          docFormData.append("kycId", newKycId)
          const docResult = await uploadDocumentFile(docFormData)
          if (docResult.error) throw new Error(docResult.error)
        }

        if (selfieWithDocument) {
          const selfieDocFormData = new FormData()
          selfieDocFormData.append("file", selfieWithDocument)
          selfieDocFormData.append("type", "selfie_with_document")
          selfieDocFormData.append("kycId", newKycId)
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

  const tabs = [
    { id: "datos", label: "MIS DATOS", icon: User },
    { id: "seguridad", label: "SEGURIDAD", icon: Lock },
    { id: "notificaciones", label: "NOTIFICACIONES", icon: Bell },
    { id: "conexiones", label: "CONEXIONES", icon: LinkIcon },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5A017]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
      )}
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
