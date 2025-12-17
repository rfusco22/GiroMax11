"use client"

import { useState } from "react"
import { Save, RefreshCw, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { countries } from "@/lib/currencies"
import { getAllMargins, updateMargin } from "@/lib/exchange-rates"

export default function AdminMarginsPage() {
  const [margins, setMargins] = useState(getAllMargins())
  const [saved, setSaved] = useState(false)
  const [editedCurrencies, setEditedCurrencies] = useState<Set<string>>(new Set())

  const handleMarginChange = (currency: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setMargins((prev) => ({ ...prev, [currency]: numValue }))
    setEditedCurrencies((prev) => new Set(prev).add(currency))
    setSaved(false)
  }

  const handleSave = () => {
    Object.entries(margins).forEach(([currency, margin]) => {
      updateMargin(currency, margin)
    })
    setSaved(true)
    setEditedCurrencies(new Set())
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setMargins(getAllMargins())
    setEditedCurrencies(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración de Márgenes</h1>
          <p className="text-muted-foreground">Administra el porcentaje de ganancia por cada moneda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={editedCurrencies.size === 0}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#121A56] hover:bg-[#121A56]/90"
            disabled={editedCurrencies.size === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {saved && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Los márgenes han sido actualizados correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card className="border-[#F5A017]/30 bg-[#F5A017]/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#F5A017]/20">
              <TrendingUp className="h-5 w-5 text-[#DB530F]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">¿Cómo funcionan los márgenes?</h3>
              <p className="text-sm text-muted-foreground">
                El margen se aplica sobre la tasa oficial del mercado. Por ejemplo, si la tasa oficial USD/COP es 4,150
                y configuras un margen de 1.2%, la tasa final será 4,150 × 1.012 = 4,199.80. Este porcentaje representa
                la ganancia de Giros Max por cada operación.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margins Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => {
          const currency = country.currency
          const margin = margins[currency] || 0
          const isEdited = editedCurrencies.has(currency)

          return (
            <Card key={country.code} className={`transition-all ${isEdited ? "ring-2 ring-[#F5A017]" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <CardTitle className="text-base">{country.name}</CardTitle>
                      <CardDescription>{currency}</CardDescription>
                    </div>
                  </div>
                  {isEdited && <Badge className="bg-[#F5A017] text-white">Modificado</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`margin-${currency}`} className="text-sm text-muted-foreground">
                    Margen de ganancia (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id={`margin-${currency}`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={margin}
                      onChange={(e) => handleMarginChange(currency, e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Ganancia por operación en {currency}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Márgenes</CardTitle>
          <CardDescription>Vista rápida de todos los porcentajes configurados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">País</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Moneda</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Margen (%)</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => {
                  const currency = country.currency
                  const margin = margins[currency] || 0

                  return (
                    <tr key={country.code} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">{currency}</td>
                      <td className="py-3 px-4 text-right font-semibold">{margin.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={margin < 1 ? "secondary" : margin < 2 ? "default" : "destructive"}
                          className={margin < 1 ? "" : margin < 2 ? "bg-[#F5A017]" : ""}
                        >
                          {margin < 1 ? "Bajo" : margin < 2 ? "Normal" : "Alto"}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
