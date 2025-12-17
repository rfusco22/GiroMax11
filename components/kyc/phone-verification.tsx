"use client"

import { useState } from "react"
import { Loader2, Check, AlertCircle, MessageSquare, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface PhoneVerificationProps {
  kycId: string
  phoneNumber: string
  onVerified: () => void
  onSendCode: (method: "sms" | "whatsapp") => Promise<{ success: boolean; error?: string }>
  onVerifyCode: (code: string) => Promise<{ success: boolean; error?: string }>
}

export function PhoneVerification({
  kycId,
  phoneNumber,
  onVerified,
  onSendCode,
  onVerifyCode,
}: PhoneVerificationProps) {
  const [verificationMethod, setVerificationMethod] = useState<"sms" | "whatsapp">("whatsapp")
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  async function handleSendCode() {
    setIsLoading(true)
    setError(null)

    const result = await onSendCode(verificationMethod)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setCodeSent(true)
    setIsLoading(false)

    // Start countdown for resend
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleVerifyCode() {
    if (verificationCode.length !== 6) {
      setError("El código debe tener 6 dígitos")
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await onVerifyCode(verificationCode)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onVerified()
  }

  return (
    <div className="space-y-6">
      {/* Phone number display */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Número a verificar</p>
              <p className="text-lg font-semibold text-blue-900">{phoneNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method selection */}
      {!codeSent && (
        <div className="space-y-4">
          <Label className="text-base font-semibold">Selecciona el método de verificación</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setVerificationMethod("sms")}
              className={`p-4 rounded-lg border-2 transition-all ${
                verificationMethod === "sms"
                  ? "border-[#F5A017] bg-[#F5A017]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <MessageSquare
                className={`h-6 w-6 mx-auto mb-2 ${verificationMethod === "sms" ? "text-[#F5A017]" : "text-gray-400"}`}
              />
              <p className="font-medium text-sm">SMS</p>
              <p className="text-xs text-muted-foreground mt-1">Código por mensaje de texto</p>
            </button>

            <button
              type="button"
              onClick={() => setVerificationMethod("whatsapp")}
              className={`p-4 rounded-lg border-2 transition-all ${
                verificationMethod === "whatsapp"
                  ? "border-[#F5A017] bg-[#F5A017]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <MessageSquare
                className={`h-6 w-6 mx-auto mb-2 ${
                  verificationMethod === "whatsapp" ? "text-[#F5A017]" : "text-gray-400"
                }`}
              />
              <p className="font-medium text-sm">WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-1">Código por WhatsApp</p>
            </button>
          </div>

          <Button
            onClick={handleSendCode}
            className="w-full bg-[#F5A017] hover:bg-[#F5A017]/90 h-12"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando código...
              </>
            ) : (
              <>Enviar código por {verificationMethod === "sms" ? "SMS" : "WhatsApp"}</>
            )}
          </Button>
        </div>
      )}

      {/* Code verification */}
      {codeSent && (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Código enviado</p>
                  <p className="text-sm text-green-700">
                    Hemos enviado un código de 6 dígitos a tu {verificationMethod === "sms" ? "teléfono" : "WhatsApp"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-base font-semibold">
              Ingresa el código de verificación
            </Label>
            <Input
              id="code"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setVerificationCode(value)
              }}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl font-bold tracking-widest h-14"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground text-center">El código expira en 10 minutos</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCodeSent(false)
                setVerificationCode("")
                setError(null)
              }}
              disabled={countdown > 0}
              className="flex-1"
            >
              {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código"}
            </Button>
            <Button
              onClick={handleVerifyCode}
              className="flex-1 bg-[#121A56] hover:bg-[#121A56]/90"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ¿No recibiste el código? Verifica que tu número sea correcto o intenta con otro método
          </p>
        </div>
      )}
    </div>
  )
}
