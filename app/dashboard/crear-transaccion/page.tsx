"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, User, Users, CreditCard, CheckCircle, ChevronRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/app/actions/auth"

type Step = "operacion" | "remitente" | "destinatario" | "pago" | "confirmacion"

const steps: { id: Step; label: string; icon: any }[] = [
  { id: "operacion", label: "Operación", icon: ShoppingCart },
  { id: "remitente", label: "Remitente", icon: User },
  { id: "destinatario", label: "Destinatario", icon: Users },
  { id: "pago", label: "Pago", icon: CreditCard },
  { id: "confirmacion", label: "Confirmación", icon: CheckCircle },
]

export default function CrearTransaccionPage() {
  const [currentStep, setCurrentStep] = useState<Step>("operacion")
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Operacion
    origenFondos: "",
    montoDepositar: "",
    destinoFondos: "",
    montoRecibir: "",
    // Remitente
    // Destinatario
    // Pago
  })

  useEffect(() => {
    checkVerification()
  }, [])

  async function checkVerification() {
    const user = await getCurrentUser()
    if (user && user.kycStatus === "approved") {
      setIsVerified(true)
    }
    setIsLoading(false)
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A017]"></div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crear Transacción</h1>
          <p className="text-muted-foreground">Completa el formulario para crear una nueva transacción</p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-900 mb-2">Verificación Requerida</h3>
            <p className="text-yellow-800 mb-6 max-w-md mx-auto">
              Para crear transacciones, primero debes completar la verificación de tu identidad. Sube tus documentos de
              identificación para poder realizar operaciones.
            </p>
            <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
              <Link href="/subir-documentos">Subir Documentos de Verificación</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crear Transacción</h1>
        <p className="text-muted-foreground">Completa el formulario para crear una nueva transacción</p>
      </div>

      {/* Progress Stepper */}
      <Card className="border-0 shadow-sm bg-[#2A3254]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const isFirst = index === 0

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {!isFirst && <ChevronRight className="h-5 w-5 text-white/40 mx-2" />}
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 flex-1",
                      isActive && "opacity-100",
                      !isActive && !isCompleted && "opacity-40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        isActive && "bg-red-600 text-white",
                        isCompleted && "bg-white/20 text-white",
                        !isActive && !isCompleted && "bg-white/10 text-white/60",
                      )}
                    >
                      <StepIcon className="h-6 w-6" />
                    </div>
                    <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-white/60")}>
                      {step.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-0 shadow-sm bg-[#2A3254]">
        <CardContent className="p-8">
          {currentStep === "operacion" && <OperacionStep formData={formData} setFormData={setFormData} />}
          {currentStep === "remitente" && <RemitenteStep />}
          {currentStep === "destinatario" && <DestinatarioStep />}
          {currentStep === "pago" && <PagoStep />}
          {currentStep === "confirmacion" && <ConfirmacionStep formData={formData} />}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent text-white">
                Atrás
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {currentStepIndex === steps.length - 1 ? "Finalizar" : "Siguiente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OperacionStep({
  formData,
  setFormData,
}: {
  formData: any
  setFormData: (data: any) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="origenFondos" className="text-white">
            Origen de los Fondos
          </Label>
          <Select
            value={formData.origenFondos}
            onValueChange={(value) => setFormData({ ...formData, origenFondos: value })}
          >
            <SelectTrigger id="origenFondos" className="bg-[#1E2640] border-0 text-white">
              <SelectValue placeholder="Venezuela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VE">🇻🇪 Venezuela</SelectItem>
              <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
              <SelectItem value="CL">🇨🇱 Chile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="montoDepositar" className="text-white">
            Monto que usted va depositar
          </Label>
          <Input
            id="montoDepositar"
            type="number"
            placeholder="0"
            value={formData.montoDepositar}
            onChange={(e) => setFormData({ ...formData, montoDepositar: e.target.value })}
            className="bg-[#1E2640] border-0 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destinoFondos" className="text-white">
            Destino de los Fondos
          </Label>
          <Select
            value={formData.destinoFondos}
            onValueChange={(value) => setFormData({ ...formData, destinoFondos: value })}
          >
            <SelectTrigger id="destinoFondos" className="bg-[#1E2640] border-0 text-white">
              <SelectValue placeholder="Chile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CL">🇨🇱 Chile</SelectItem>
              <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
              <SelectItem value="PE">🇵🇪 Peru (Sol)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="montoRecibir" className="text-white">
            Monto que va recibir
          </Label>
          <Input
            id="montoRecibir"
            type="number"
            placeholder="0"
            value={formData.montoRecibir}
            onChange={(e) => setFormData({ ...formData, montoRecibir: e.target.value })}
            className="bg-[#1E2640] border-0 text-white"
          />
        </div>
      </div>

      {/* Details Panel */}
      <div className="bg-[#1E2640] rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Detalles de la Operación</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Origen</span>
            <span className="text-white font-medium">Bolivar Soberano</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Destino</span>
            <span className="text-white font-medium">Pesos Chilenos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Tasa</span>
            <span className="text-white font-medium">1,99 $</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Depositar</span>
            <span className="text-white font-medium">- Bs.</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-white font-semibold">Monto a Recibir</span>
            <span className="text-white font-semibold">- $</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RemitenteStep() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-6">Información del Remitente</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Nombre completo</Label>
          <Input className="bg-[#1E2640] border-0 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Teléfono</Label>
          <Input className="bg-[#1E2640] border-0 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Email</Label>
          <Input type="email" className="bg-[#1E2640] border-0 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">País</Label>
          <Select>
            <SelectTrigger className="bg-[#1E2640] border-0 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VE">Venezuela</SelectItem>
              <SelectItem value="CO">Colombia</SelectItem>
              <SelectItem value="CL">Chile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function DestinatarioStep() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-6">Información del Destinatario</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Nombre completo</Label>
          <Input className="bg-[#1E2640] border-0 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Banco</Label>
          <Input className="bg-[#1E2640] border-0 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Número de cuenta</Label>
          <Input className="bg-[#1E2640] border-0 text-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-white">País</Label>
          <Select>
            <SelectTrigger className="bg-[#1E2640] border-0 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CL">Chile</SelectItem>
              <SelectItem value="CO">Colombia</SelectItem>
              <SelectItem value="PE">Perú</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function PagoStep() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-6">Información de Pago</h3>
      <div className="space-y-4">
        <div className="bg-[#1E2640] rounded-lg p-6">
          <p className="text-white/80 text-sm mb-4">
            El pago será procesado manualmente por nuestro equipo. Una vez enviado el comprobante de pago, un
            administrador validará la transacción.
          </p>
          <div className="space-y-2">
            <Label className="text-white">Subir comprobante de pago</Label>
            <Input type="file" accept="image/*,application/pdf" className="bg-[#1E2640] border-0 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmacionStep({ formData }: { formData: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-white">Transacción Creada</h3>
        <p className="text-white/60">
          Tu transacción ha sido creada exitosamente y está pendiente de validación por parte de nuestro equipo.
        </p>
      </div>

      <div className="bg-[#1E2640] rounded-lg p-6 space-y-3">
        <h4 className="font-semibold text-white mb-4">Resumen de la Transacción</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Referencia</span>
            <span className="text-white font-medium">REF{Date.now()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Estado</span>
            <span className="text-yellow-500 font-medium">Pendiente de Validación</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Origen</span>
            <span className="text-white font-medium">{formData.origenFondos || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Destino</span>
            <span className="text-white font-medium">{formData.destinoFondos || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
