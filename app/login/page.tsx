"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedLogo } from "@/components/dashboard/animated-logo"
import { PageLoader } from "@/components/page-loader"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPageLoader, setShowPageLoader] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const hasShownLoginLoader = sessionStorage.getItem("hasShownLoginLoader")
    if (hasShownLoginLoader !== "true") {
      setShowPageLoader(true)
      sessionStorage.setItem("hasShownLoginLoader", "true")

      const timer = setTimeout(() => {
        setShowPageLoader(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        google_not_configured: "Google OAuth no está configurado. Contacta al administrador.",
        google_url_failed: "Error al iniciar sesión con Google. Intenta de nuevo.",
        google_auth_failed: "La autenticación con Google falló. Intenta de nuevo.",
        no_code: "No se recibió código de autorización de Google.",
        auth_failed: "Error en la autenticación. Intenta de nuevo.",
      }
      setError(errorMessages[errorParam] || "Error desconocido al iniciar sesión con Google.")
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (e) {
      // Redirect happened
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log("[v0] Iniciando autenticación con Google")
    window.location.href = "/api/auth/google"
  }

  return (
    <>
      {showPageLoader && <PageLoader />}

      <div className="min-h-screen bg-background flex">
        {/* Left side - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0">
              <div className="flex items-center justify-start gap-3 mb-6">
                <AnimatedLogo />
                <span className="text-[#DB530F] font-bold italic text-2xl tracking-wide bg-gradient-to-r from-[#DB530F] via-[#F5A017] to-[#DB530F] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                  GIROS MAX
                </span>
              </div>
              <CardTitle className="text-2xl font-bold">Bienvenido de vuelta</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form action={handleSubmit} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="h-12" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/recuperar" className="text-sm text-[#DB530F] hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-12 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-[#121A56] hover:bg-[#121A56]/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 bg-transparent"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="text-[#DB530F] font-medium hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0a0f3d] via-[#121A56] to-[#1a1147] relative overflow-hidden">
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F5A017]/20 via-transparent to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#DB530F]/20 via-transparent to-transparent animate-pulse delay-1000" />
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center justify-center w-full px-12 py-16">
            {/* Speed emphasis hero section */}
            <div className="text-center mb-12 z-10">
              <div className="inline-block mb-4">
                <div className="bg-gradient-to-r from-[#F5A017] to-[#DB530F] text-white px-6 py-2 rounded-full text-sm font-bold animate-pulse-slow">
                  🚀 TRANSFERENCIAS INSTANTÁNEAS
                </div>
              </div>
              <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-[#F5A017] to-white bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                La Velocidad que
                <br />
                Necesitas
              </h2>
              <p className="text-white/80 text-xl max-w-xl mx-auto">
                Envía dinero a 7 países en <span className="text-[#F5A017] font-bold">menos de 45 minutos</span>
              </p>
            </div>

            {/* Speed comparison visualization */}
            <div className="relative w-full max-w-2xl mb-12">
              <div className="flex items-center justify-center gap-8">
                {/* Giros Max - Fast */}
                <div className="flex-1 text-center">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 border-4 border-white/30 shadow-2xl transform hover:scale-105 transition-all">
                    <div className="text-white/80 text-sm mb-2">Giros Max</div>
                    <div className="text-white text-5xl font-bold mb-2">45min</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                      <span className="text-emerald-200 text-xs">Instantáneo</span>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F5A017] to-[#DB530F] flex items-center justify-center text-white font-bold text-xl shadow-2xl animate-pulse-slow">
                    VS
                  </div>
                </div>

                {/* Other Banks - Slow */}
                <div className="flex-1 text-center">
                  <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-6 border-4 border-white/10 shadow-xl opacity-60">
                    <div className="text-white/60 text-sm mb-2">Otros Bancos</div>
                    <div className="text-white/80 text-5xl font-bold mb-2">3-5días</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-white/40 text-xs">Lento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7 Countries Map with animated connections */}
            <div className="relative w-full max-w-3xl mb-12">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-white text-2xl font-bold text-center mb-6">Conectamos 7 Países</h3>

                {/* Countries grid with flags */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { name: "Venezuela", flag: "🇻🇪", color: "from-yellow-400 to-red-600" },
                    { name: "Colombia", flag: "🇨🇴", color: "from-yellow-300 to-blue-600" },
                    { name: "EE.UU.", flag: "🇺🇸", color: "from-blue-500 to-red-500" },
                    { name: "Chile", flag: "🇨🇱", color: "from-blue-500 to-red-600" },
                    { name: "Perú", flag: "🇵🇪", color: "from-red-500 to-white" },
                    { name: "Ecuador", flag: "🇪🇨", color: "from-yellow-400 to-blue-600" },
                    { name: "Panamá", flag: "🇵🇦", color: "from-blue-500 to-red-500" },
                  ].map((country, index) => (
                    <div
                      key={country.name}
                      className="bg-gradient-to-br from-white/20 to-white/5 rounded-xl p-4 border border-white/30 hover:scale-110 transition-all cursor-pointer animate-float"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="text-4xl mb-2 text-center">{country.flag}</div>
                      <div className="text-white text-xs text-center font-semibold">{country.name}</div>
                    </div>
                  ))}
                </div>

                {/* Speed stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-[#F5A017] text-3xl font-bold animate-pulse-slow">45min</div>
                    <div className="text-white/70 text-sm">Tiempo máximo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-emerald-400 text-3xl font-bold animate-pulse-slow">💰</div>
                    <div className="text-white/70 text-sm">Las mejores tasas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 text-3xl font-bold animate-pulse-slow">✓</div>
                    <div className="text-white/70 text-sm">Tu cambio de confianza</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated speed particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-gradient-to-b from-[#F5A017] to-transparent rounded-full animate-speed-line opacity-40"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
