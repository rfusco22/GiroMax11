"use client"

import type React from "react"
import { Camera, Upload, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MisDatosTabProps {
  userData: any
  kycData: any
  verificationStatus: string
  profilePhotoPreview: string | null
  handleProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selfiePreview: string | null
  handleSelfieChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  documentPhotoPreview: string | null
  handleDocumentPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selfieWithDocumentPreview: string | null
  handleSelfieWithDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploading: boolean
  uploadError: string | null
  handleSubmitDocuments: () => void
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  editedData: any
  setEditedData: (value: any) => void
  handleSaveProfileChanges: () => void
  setSelfie: (file: File | null) => void
  setSelfiePreview: (url: string | null) => void
  setDocumentPhoto: (file: File | null) => void
  setDocumentPhotoPreview: (url: string | null) => void
  setSelfieWithDocument: (file: File | null) => void
  setSelfieWithDocumentPreview: (url: string | null) => void
}

export default function MisDatosTab({
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
}: MisDatosTabProps) {
  const getStatusColor = () => {
    switch (verificationStatus) {
      case "approved":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "rejected":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusLabel = () => {
    switch (verificationStatus) {
      case "approved":
        return "Verificado"
      case "pending":
        return "En Verificación"
      case "rejected":
        return "Rechazado"
      default:
        return "No Verificado"
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "approved":
        return "Aprobado"
      case "pending":
        return "Pendiente"
      case "rejected":
        return "Rechazado"
      default:
        return ""
    }
  }

  const canEditDocuments = verificationStatus === "none" || verificationStatus === "rejected"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Mi Perfil</h2>
          <p className="text-sm text-white/60 mt-1">Gestiona tu información personal y documentos de verificación</p>
        </div>
        <Button
          onClick={() => {
            if (isEditing) {
              setIsEditing(false)
            } else {
              setIsEditing(true)
            }
          }}
          variant="outline"
          className="bg-[#F5A017] hover:bg-[#F5A017]/90 text-white border-0"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      {verificationStatus !== "none" && (
        <div
          className={`p-4 rounded-lg border ${verificationStatus === "approved" ? "bg-green-500/10 border-green-500/20" : verificationStatus === "pending" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-2 ${verificationStatus === "approved" ? "bg-green-500/20" : verificationStatus === "pending" ? "bg-yellow-500/20" : "bg-red-500/20"}`}
            >
              {verificationStatus === "approved" && (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {verificationStatus === "pending" && (
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {verificationStatus === "rejected" && (
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold ${verificationStatus === "approved" ? "text-green-500" : verificationStatus === "pending" ? "text-yellow-500" : "text-red-500"}`}
                >
                  {verificationStatus === "approved"
                    ? "Cuenta Verificada"
                    : verificationStatus === "pending"
                      ? "Verificación en proceso"
                      : "Verificación Rechazada"}
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${verificationStatus === "approved" ? "bg-green-500/20 text-green-500" : verificationStatus === "pending" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}
                >
                  {getStatusBadge()}
                </span>
              </div>
              <p
                className={`text-sm mt-1 ${verificationStatus === "approved" ? "text-green-500/80" : verificationStatus === "pending" ? "text-yellow-500/80" : "text-red-500/80"}`}
              >
                {verificationStatus === "approved"
                  ? "Tu cuenta ha sido verificada exitosamente."
                  : verificationStatus === "pending"
                    ? "Tu solicitud de verificación está siendo revisada por nuestro equipo. Esto generalmente toma de 24 a 48 horas."
                    : "Tu solicitud de verificación fue rechazada. Por favor, actualiza tus documentos y vuelve a intentarlo."}
              </p>
              {kycData?.createdAt && verificationStatus === "pending" && (
                <p className="text-xs text-white/60 mt-2">
                  Enviado el:{" "}
                  {new Date(kycData.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {kycData?.rejectionReason && verificationStatus === "rejected" && (
                <p className="text-sm text-red-500/80 mt-2">
                  <strong>Razón del rechazo:</strong> {kycData.rejectionReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1E2541] rounded-xl p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview || "/placeholder.svg"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white/40" />
              )}
            </div>
            <label
              htmlFor="profile-photo"
              className="absolute bottom-0 right-0 bg-[#F5A017] hover:bg-[#F5A017]/90 text-white rounded-full p-2 cursor-pointer transition-colors"
            >
              <Camera className="h-4 w-4" />
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="sr-only"
              />
            </label>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">
              {userData?.firstName || "undefined"} {userData?.lastName || "undefined"}
            </h3>
            <p className="text-sm text-white/60">{userData?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-white/80 text-sm">
              Nombre(s)
            </Label>
            <Input
              id="firstName"
              value={isEditing ? editedData.firstName : userData?.firstName || ""}
              onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
              disabled={!isEditing}
              className="bg-[#2A3254] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-white/80 text-sm">
              Apellido(s)
            </Label>
            <Input
              id="lastName"
              value={isEditing ? editedData.lastName : userData?.lastName || ""}
              onChange={(e) => setEditedData({ ...editedData, lastName: e.target.value })}
              disabled={!isEditing}
              className="bg-[#2A3254] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-white/80 text-sm">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              value={userData?.email || ""}
              disabled
              className="bg-[#2A3254] border-white/10 text-white/60 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-white/80 text-sm">
              Teléfono
            </Label>
            <Input
              id="phone"
              value={isEditing ? editedData.phone : userData?.phone?.split(":")[1] || ""}
              onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
              disabled={!isEditing}
              className="bg-[#2A3254] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth" className="text-white/80 text-sm">
              Fecha de Nacimiento
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={
                isEditing
                  ? editedData.dateOfBirth
                  : userData?.dateOfBirth
                    ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
                    : ""
              }
              onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
              disabled={!isEditing}
              className="bg-[#2A3254] border-white/10 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nationality" className="text-white/80 text-sm">
              Nacionalidad
            </Label>
            <Select
              value={isEditing ? editedData.nationality : userData?.nationality || "VE"}
              onValueChange={(value) => setEditedData({ ...editedData, nationality: value })}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-[#2A3254] border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VE">Venezuela</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="CO">Colombia</SelectItem>
                <SelectItem value="EC">Ecuador</SelectItem>
                <SelectItem value="PE">Perú</SelectItem>
                <SelectItem value="AR">Argentina</SelectItem>
                <SelectItem value="CL">Chile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="residenceCountry" className="text-white/80 text-sm">
              País de Residencia
            </Label>
            <Select
              value={isEditing ? editedData.residenceCountry : userData?.residenceCountry || "VE"}
              onValueChange={(value) => setEditedData({ ...editedData, residenceCountry: value })}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-[#2A3254] border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VE">Venezuela</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
                <SelectItem value="CO">Colombia</SelectItem>
                <SelectItem value="EC">Ecuador</SelectItem>
                <SelectItem value="PE">Perú</SelectItem>
                <SelectItem value="AR">Argentina</SelectItem>
                <SelectItem value="CL">Chile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="documentType" className="text-white/80 text-sm">
              Tipo de Documento
            </Label>
            <Select
              value={isEditing ? editedData.documentType : userData?.documentType || "cedula"}
              onValueChange={(value) => setEditedData({ ...editedData, documentType: value })}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-[#2A3254] border-white/10 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cedula">Cédula</SelectItem>
                <SelectItem value="dni">DNI</SelectItem>
                <SelectItem value="pasaporte">Pasaporte</SelectItem>
                <SelectItem value="licencia">Licencia de Conducir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="documentNumber" className="text-white/80 text-sm">
              Número de Documento
            </Label>
            <Input
              id="documentNumber"
              value={isEditing ? editedData.documentNumber : userData?.documentNumber || ""}
              onChange={(e) => setEditedData({ ...editedData, documentNumber: e.target.value })}
              disabled={!isEditing}
              className="bg-[#2A3254] border-white/10 text-white mt-1"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="border-white/10 text-white">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfileChanges}
              disabled={uploading}
              className="bg-[#F5A017] hover:bg-[#F5A017]/90 text-white"
            >
              {uploading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-[#1E2541] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Documentos de Verificación</h3>
        <p className="text-sm text-white/60 mb-6">
          {verificationStatus === "pending"
            ? "Tus documentos están siendo revisados"
            : verificationStatus === "rejected"
              ? "Actualiza tus documentos para reintentar la verificación"
              : "Sube tus documentos para completar la verificación de identidad"}
        </p>

        {uploadError && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {uploadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#F5A017]" />
              <h4 className="font-medium text-white">1. Foto de tu rostro</h4>
            </div>
            <div className="relative aspect-[4/3] bg-[#2A3254] rounded-lg border-2 border-dashed border-white/10 overflow-hidden">
              {selfiePreview ? (
                <>
                  <img
                    src={selfiePreview || "/placeholder.svg"}
                    alt="Selfie"
                    className="h-full w-full object-contain"
                  />
                  {canEditDocuments && (
                    <button
                      onClick={() => {
                        setSelfie(null)
                        setSelfiePreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <label
                  htmlFor="selfie"
                  className={`flex flex-col items-center justify-center h-full ${canEditDocuments ? "cursor-pointer hover:bg-[#2A3254]/80" : "cursor-not-allowed opacity-50"}`}
                >
                  <Upload className="h-8 w-8 text-white/40 mb-2" />
                  <span className="text-sm text-white/60">Click para subir</span>
                  <input
                    id="selfie"
                    type="file"
                    accept="image/*"
                    onChange={handleSelfieChange}
                    disabled={!canEditDocuments}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#F5A017]" />
              <h4 className="font-medium text-white">2. Foto del Documento</h4>
            </div>
            <div className="relative aspect-[4/3] bg-[#2A3254] rounded-lg border-2 border-dashed border-white/10 overflow-hidden">
              {documentPhotoPreview ? (
                <>
                  <img
                    src={documentPhotoPreview || "/placeholder.svg"}
                    alt="Documento"
                    className="h-full w-full object-contain"
                  />
                  {canEditDocuments && (
                    <button
                      onClick={() => {
                        setDocumentPhoto(null)
                        setDocumentPhotoPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <label
                  htmlFor="document"
                  className={`flex flex-col items-center justify-center h-full ${canEditDocuments ? "cursor-pointer hover:bg-[#2A3254]/80" : "cursor-not-allowed opacity-50"}`}
                >
                  <Upload className="h-8 w-8 text-white/40 mb-2" />
                  <span className="text-sm text-white/60">Click para subir</span>
                  <input
                    id="document"
                    type="file"
                    accept="image/*"
                    onChange={handleDocumentPhotoChange}
                    disabled={!canEditDocuments}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#F5A017]" />
              <h4 className="font-medium text-white">3. Selfie con Documento</h4>
            </div>
            <div className="relative aspect-[4/3] bg-[#2A3254] rounded-lg border-2 border-dashed border-white/10 overflow-hidden">
              {selfieWithDocumentPreview ? (
                <>
                  <img
                    src={selfieWithDocumentPreview || "/placeholder.svg"}
                    alt="Selfie con Documento"
                    className="h-full w-full object-contain"
                  />
                  {canEditDocuments && (
                    <button
                      onClick={() => {
                        setSelfieWithDocument(null)
                        setSelfieWithDocumentPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <label
                  htmlFor="selfieWithDocument"
                  className={`flex flex-col items-center justify-center h-full ${canEditDocuments ? "cursor-pointer hover:bg-[#2A3254]/80" : "cursor-not-allowed opacity-50"}`}
                >
                  <Upload className="h-8 w-8 text-white/40 mb-2" />
                  <span className="text-sm text-white/60">Click para subir</span>
                  <input
                    id="selfieWithDocument"
                    type="file"
                    accept="image/*"
                    onChange={handleSelfieWithDocumentChange}
                    disabled={!canEditDocuments}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {canEditDocuments && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSubmitDocuments}
              disabled={uploading}
              className="bg-[#F5A017] hover:bg-[#F5A017]/90 text-white"
            >
              {uploading ? "Actualizando..." : "Actualizar Documentos"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function User({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}
