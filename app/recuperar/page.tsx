"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedLogo } from "@/components/dashboard/animated-logo"
import { requestPasswordReset } from "@/app/actions/auth"
import { useActionState } from "react"

export default function RecuperarPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-6">
              <AnimatedLogo />
              <span className="text-[#DB530F] font-bold italic text-2xl tracking-wide bg-gradient-to-r from-[#DB530F] via-[#F5A017] to-[#DB530F] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                GIROS MAX
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {state.message}
              </div>
            )}
            {state?.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="h-12"
                  disabled={isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-[#121A56] hover:bg-[#121A56]/90"
                disabled={isPending}
              >
                {isPending ? "Enviando..." : "Enviar instrucciones"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="text-[#DB530F] font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
