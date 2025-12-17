"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Eye, Clock, User, FileText, Phone, Calendar, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getPendingKYCs, approveKYCVerification, rejectKYCVerification } from "@/app/actions/kyc"

interface KYCVerification {
  id: string
  userId: string
  email: string
  name: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  nationality: string
  residenceCountry: string
  documentType: string
  documentNumber: string
  phoneNumber: string
  phoneVerified: boolean
  documentFrontUrl?: string
  documentBackUrl?: string
  selfieUrl?: string
  selfieWithDocumentUrl?: string
  status: string
  createdAt: Date
}

export default function VerificacionesPage() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    loadVerifications()
  }, [])

  async function loadVerifications() {
    setIsLoading(true)
    const result = await getPendingKYCs()

    if (result.error) {
      console.error(result.error)
      setIsLoading(false)
      return
    }

    setVerifications(result.kycs || [])
    setIsLoading(false)
  }

  async function handleApprove() {
    if (!selectedKYC) return

    setIsProcessing(true)
    const result = await approveKYCVerification(selectedKYC.id, approvalNotes)

    if (result.error) {
      alert(result.error)
      setIsProcessing(false)
      return
    }

    setShowApproveDialog(false)
    setSelectedKYC(null)
    setApprovalNotes("")
    setIsProcessing(false)
    loadVerifications()
  }

  async function handleReject() {
    if (!selectedKYC || !rejectionReason.trim()) {
      alert("Debes proporcionar un motivo de rechazo")
      return
    }

    console.log("[v0] handleReject called with:", { kycId: selectedKYC.id, reason: rejectionReason })
    setIsProcessing(true)
    const result = await rejectKYCVerification(selectedKYC.id, rejectionReason)
    console.log("[v0] Rejection result:", result)

    if (result.error) {
      console.error("[v0] Rejection error:", result.error)
      alert(result.error)
      setIsProcessing(false)
      return
    }

    console.log("[v0] Rejection successful, closing dialog")
    setShowRejectDialog(false)
    setSelectedKYC(null)
    setRejectionReason("")
    setIsProcessing(false)
    loadVerifications()
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Fecha no disponible"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Fecha inválida"
      return dateObj.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5A017]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verificar Usuarios</h1>
        <p className="text-muted-foreground">Revisa y aprueba las solicitudes de verificación de identidad</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-foreground">{verifications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-[#F5A017]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas Hoy</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-foreground">-</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verifications List */}
      {verifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay verificaciones pendientes</h3>
            <p className="text-muted-foreground">Todas las solicitudes han sido procesadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((kyc) => (
            <Card key={kyc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    {/* User info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#F5A017]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-[#F5A017]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {kyc.firstName} {kyc.lastName}
                          </h3>
                          {kyc.phoneVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Teléfono Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{kyc.email}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Documento</p>
                          <p className="font-medium">
                            {kyc.documentType && kyc.documentNumber
                              ? `${kyc.documentType.toUpperCase()} - ${kyc.documentNumber}`
                              : "No especificado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{kyc.phoneNumber || "No especificado"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Nacionalidad</p>
                          <p className="font-medium">{kyc.nationality || "No especificado"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Submitted date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Enviado: {formatDate(kyc.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedKYC(kyc)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Documentos
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedKYC(kyc)
                        setShowApproveDialog(true)
                      }}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedKYC(kyc)
                        setShowRejectDialog(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Documents Dialog */}
      <Dialog
        open={selectedKYC !== null && !showApproveDialog && !showRejectDialog}
        onOpenChange={() => setSelectedKYC(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Documentos de {selectedKYC?.firstName} {selectedKYC?.lastName}
            </DialogTitle>
            <DialogDescription>
              Revisa cuidadosamente todos los documentos antes de aprobar o rechazar
            </DialogDescription>
          </DialogHeader>

          {selectedKYC && (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Nombre Completo</Label>
                    <p className="font-medium">
                      {selectedKYC.firstName} {selectedKYC.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Correo Electrónico</Label>
                    <p className="font-medium">{selectedKYC.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tipo de Documento</Label>
                    <p className="font-medium">{selectedKYC.documentType?.toUpperCase() || "No especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Número de Documento</Label>
                    <p className="font-medium">{selectedKYC.documentNumber || "No especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nacionalidad</Label>
                    <p className="font-medium">{selectedKYC.nationality || "No especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">País de Residencia</Label>
                    <p className="font-medium">{selectedKYC.residenceCountry || "No especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Teléfono</Label>
                    <p className="font-medium">{selectedKYC.phoneNumber || "No especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado del Teléfono</Label>
                    <Badge variant={selectedKYC.phoneVerified ? "default" : "secondary"} className="mt-1">
                      {selectedKYC.phoneVerified ? "Verificado" : "No Verificado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold">Documentos Subidos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedKYC.selfieUrl && (
                    <div className="space-y-2">
                      <Label className="font-semibold">1. Foto de tu rostro</Label>
                      <div
                        className="border rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setZoomedImage({ url: selectedKYC.selfieUrl!, title: "Foto de tu rostro" })}
                      >
                        <img src={selectedKYC.selfieUrl || "/placeholder.svg"} alt="Selfie" className="w-full h-auto" />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Click para ampliar</p>
                    </div>
                  )}

                  {selectedKYC.documentFrontUrl && (
                    <div className="space-y-2">
                      <Label className="font-semibold">2. Foto del Documento</Label>
                      <div
                        className="border rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          setZoomedImage({ url: selectedKYC.documentFrontUrl!, title: "Foto del Documento" })
                        }
                      >
                        <img
                          src={selectedKYC.documentFrontUrl || "/placeholder.svg"}
                          alt="Documento"
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Click para ampliar</p>
                    </div>
                  )}

                  {selectedKYC.selfieWithDocumentUrl && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-semibold">3. Selfie con Documento</Label>
                      <p className="text-sm text-muted-foreground">
                        Verifica que la cara y el documento sean visibles y coincidan con los datos proporcionados
                      </p>
                      <div
                        className="border rounded-lg overflow-hidden bg-gray-50 max-w-md mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          setZoomedImage({ url: selectedKYC.selfieWithDocumentUrl!, title: "Selfie con Documento" })
                        }
                      >
                        <img
                          src={selectedKYC.selfieWithDocumentUrl || "/placeholder.svg"}
                          alt="Selfie con Documento"
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Click para ampliar</p>
                    </div>
                  )}
                </div>

                {!selectedKYC.selfieUrl && !selectedKYC.documentFrontUrl && !selectedKYC.selfieWithDocumentUrl && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No se han subido documentos aún</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedKYC(null)}>
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowRejectDialog(true)
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
            <Button
              onClick={() => {
                setShowApproveDialog(true)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={zoomedImage !== null} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{zoomedImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <img src={zoomedImage?.url || "/placeholder.svg"} alt={zoomedImage?.title} className="w-full h-auto" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoomedImage(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Verificación</DialogTitle>
            <DialogDescription>
              Estás a punto de aprobar la verificación de{" "}
              <strong>
                {selectedKYC?.firstName} {selectedKYC?.lastName}
              </strong>
              . Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Agrega notas sobre esta aprobación..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar Verificación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Verificación</DialogTitle>
            <DialogDescription>
              Proporciona un motivo claro del rechazo para que el usuario pueda corregir los problemas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del rechazo *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Los documentos no son legibles, el documento está vencido, etc."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar Verificación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
