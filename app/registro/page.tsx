"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { GirosMaxLogo } from "@/components/giros-max-logo"
import { PhoneInput } from "@/components/ui/phone-input"
import { register } from "@/app/actions/auth"
import { countryValidationRules, validateName, validateAge, validatePhoneNumber } from "@/lib/validation"

const passwordRequirements = [
  { label: "Al menos 8 caracteres", check: (p: string) => p.length >= 8 },
  { label: "Una letra mayúscula", check: (p: string) => /[A-Z]/.test(p) },
  { label: "Una letra minúscula", check: (p: string) => /[a-z]/.test(p) },
  { label: "Un número", check: (p: string) => /[0-9]/.test(p) },
]

const documentTypes = [
  { value: "cedula", label: "Cédula" },
  { value: "dni", label: "DNI" },
  { value: "pasaporte", label: "Pasaporte" },
  { value: "licencia", label: "Licencia de Conducir" },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [firstNameError, setFirstNameError] = useState("")
  const [lastName, setLastName] = useState("")
  const [lastNameError, setLastNameError] = useState("")

  const [dateOfBirth, setDateOfBirth] = useState("")
  const [dateOfBirthError, setDateOfBirthError] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [phoneCountry, setPhoneCountry] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneNumberError, setPhoneNumberError] = useState("")

  const [nationality, setNationality] = useState("")
  const [residenceCountry, setResidenceCountry] = useState("")

  const [documentType, setDocumentType] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")

  const [acceptTerms, setAcceptTerms] = useState(false)

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

  const handlePhoneNumberBlur = () => {
    if (!phoneCountry || !phoneNumber) {
      return
    }
    const result = validatePhoneNumber(phoneNumber, phoneCountry)
    setPhoneNumberError(result.valid ? "" : result.error || "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    const firstNameValidation = validateName(firstName, "firstName")
    const lastNameValidation = validateName(lastName, "lastName")
    const ageValidation = validateAge(dateOfBirth, 18)
    const phoneValidation = validatePhoneNumber(phoneNumber, phoneCountry)

    if (!firstNameValidation.valid) {
      setFirstNameError(firstNameValidation.error || "")
      return
    }

    if (!lastNameValidation.valid) {
      setLastNameError(lastNameValidation.error || "")
      return
    }

    if (!ageValidation.valid) {
      setDateOfBirthError(ageValidation.error || "")
      return
    }

    if (!phoneValidation.valid) {
      setPhoneNumberError(phoneValidation.error || "")
      return
    }

    if (!email || !password || !nationality || !residenceCountry || !documentType || !documentNumber) {
      setError("Todos los campos son requeridos")
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set("firstName", firstName.trim())
    formData.set("lastName", lastName.trim())
    formData.set("dateOfBirth", dateOfBirth)
    formData.set("email", email.trim())
    formData.set("password", password)
    formData.set("phone", `${phoneCountry}:${phoneNumber}`)
    formData.set("nationality", nationality)
    formData.set("residenceCountry", residenceCountry)
    formData.set("documentType", documentType)
    formData.set("documentNumber", documentNumber.trim())

    try {
      const result = await register(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (e) {
      // Redirect happened
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-[#121A56] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F5A017]/10 to-transparent" />
        <div className="relative flex flex-col justify-center px-12">
          <h2 className="text-4xl font-bold text-white mb-6">
            Únete a <span className="text-[#F5A017]">Giros Max</span>
          </h2>
          <p className="text-xl text-white/80 mb-12">
            Abre tu cuenta en minutos y comienza a enviar dinero a Ecuador, Chile, Colombia, Perú, Panamá, Venezuela y
            Estados Unidos.
          </p>

          <div className="space-y-6">
            {[
              "Sin comisiones ocultas",
              "Transferencias en minutos",
              "Soporte 24/7 por WhatsApp",
              "App móvil disponible",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F5A017]/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#F5A017]" />
                </div>
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>

          {/* Banderas de países */}
          <div className="mt-12 flex gap-3 flex-wrap">
            {countryValidationRules.slice(0, 6).map((c) => (
              <div
                key={c.code}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl"
                title={c.name}
              >
                {c.flag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0">
              <div className="mb-4">
                <GirosMaxLogo size="md" />
              </div>
              <CardTitle className="text-2xl font-bold">Crea tu cuenta</CardTitle>
              <CardDescription>Completa tus datos para comenzar a usar Giros Max</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
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
                      className={firstNameError ? "border-red-500" : ""}
                    />
                    {firstNameError && <p className="text-xs text-red-600">{firstNameError}</p>}
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
                      className={lastNameError ? "border-red-500" : ""}
                    />
                    {lastNameError && <p className="text-xs text-red-600">{lastNameError}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
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
                    className={dateOfBirthError ? "border-red-500 h-12" : "h-12"}
                  />
                  {dateOfBirthError && <p className="text-xs text-red-600">{dateOfBirthError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">País de Nacimiento *</Label>
                    <Select value={nationality} onValueChange={setNationality}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryValidationRules.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <div className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="residenceCountry">País de Residencia *</Label>
                    <Select value={residenceCountry} onValueChange={setResidenceCountry}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryValidationRules.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <div className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecciona tu documento" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((doc) => (
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
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Ingresa el número de tu documento"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-12 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                  {/* Password requirements */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          req.check(password) ? "text-[#F5A017]" : "text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            req.check(password) ? "bg-[#F5A017]/20" : "bg-muted"
                          }`}
                        >
                          {req.check(password) && <Check className="h-3 w-3" />}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-[#DB530F] hover:underline">
                      términos de servicio
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-[#DB530F] hover:underline">
                      política de privacidad
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-[#121A56] hover:bg-[#121A56]/90"
                  disabled={isLoading || !acceptTerms}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-[#DB530F] font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
