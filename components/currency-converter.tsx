"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowDownUp, TrendingUp, TrendingDown, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { countries } from "@/lib/currencies"
import { getExchangeRate, type ExchangeRate } from "@/lib/exchange-rates"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

export function CurrencyConverter() {
  const { language, t } = useLanguage()
  const [fromCountry, setFromCountry] = useState("US")
  const [toCountry, setToCountry] = useState("CO")
  const [amount, setAmount] = useState("1000")
  const [rate, setRate] = useState<ExchangeRate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fromCurrency = countries.find((c) => c.code === fromCountry)?.currency || "USD"
  const toCurrency = countries.find((c) => c.code === toCountry)?.currency || "COP"

  const updateRate = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      const newRate = getExchangeRate(fromCurrency, toCurrency)
      setRate(newRate)
      setLastUpdate(new Date())
      setIsLoading(false)
    }, 300)
  }, [fromCurrency, toCurrency])

  useEffect(() => {
    updateRate()
    const interval = setInterval(updateRate, 5000)
    return () => clearInterval(interval)
  }, [updateRate])

  const handleSwap = () => {
    setFromCountry(toCountry)
    setToCountry(fromCountry)
  }

  const parsedAmount = Number.parseFloat(amount) || 0
  const convertedAmount = rate ? parsedAmount * rate.rate : 0

  return (
    <Card className="w-full max-w-lg shadow-2xl border-0 bg-card/95 backdrop-blur">
      <CardHeader className="pb-4 bg-[#121A56] rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            {language === "es" ? "Calculadora de Cambio" : "Exchange Calculator"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-[#F5A017]" />}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A017] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A017]"></span>
            </span>
            <span className="text-xs text-white/80">{language === "es" ? "En vivo" : "Live"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            {language === "es" ? "Tú envías desde" : "You send from"}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-14 pr-4 bg-secondary/50 border-0"
                placeholder="0.00"
              />
            </div>
            <Select value={fromCountry} onValueChange={setFromCountry}>
              <SelectTrigger className="w-40 h-14 bg-secondary/50 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="rounded-full h-10 w-10 bg-[#F5A017] text-white hover:bg-[#DB530F] border-0 shadow-lg"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            {language === "es" ? "Reciben en" : "They receive in"}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="text-2xl font-bold h-14 flex items-center px-3 rounded-lg bg-[#F5A017]/10 text-[#DB530F]">
                {convertedAmount.toLocaleString(language === "es" ? "es-ES" : "en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <Select value={toCountry} onValueChange={setToCountry}>
              <SelectTrigger className="w-40 h-14 bg-secondary/50 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {rate && (
          <div className="p-4 rounded-xl bg-secondary/30 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("exchangeRate")}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {language === "es" ? "Tasa oficial" : "Official rate"}: {rate.officialRate.toFixed(4)}
                      </p>
                      <p>
                        {language === "es" ? "Margen aplicado" : "Applied margin"}: {rate.margin}%
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  1 {fromCurrency} = {rate.rate.toFixed(4)} {toCurrency}
                </span>
                <span
                  className={cn(
                    "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
                    rate.change24h >= 0 ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600",
                  )}
                >
                  {rate.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {rate.change24h >= 0 ? "+" : ""}
                  {rate.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{language === "es" ? "Sin comisiones ocultas" : "No hidden fees"}</span>
              <span>
                {language === "es" ? "Actualizado" : "Updated"}:{" "}
                {lastUpdate.toLocaleTimeString(language === "es" ? "es-ES" : "en-US")}
              </span>
            </div>
          </div>
        )}

        <Button className="w-full h-14 text-lg font-semibold bg-[#121A56] hover:bg-[#121A56]/90 text-white" size="lg">
          {language === "es" ? "Realizar Envío" : "Send Money"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {language === "es"
            ? "Al continuar, aceptas nuestros términos y condiciones"
            : "By continuing, you accept our terms and conditions"}
        </p>
      </CardContent>
    </Card>
  )
}
