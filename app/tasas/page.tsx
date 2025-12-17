"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, RefreshCw, Search, Bell, Star, StarOff } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllRatesForCurrency, getExchangeRate, type ExchangeRate } from "@/lib/exchange-rates"
import { currencies, getCurrencyByCode } from "@/lib/currencies"
import { cn } from "@/lib/utils"

const popularPairs = [
  "USD-MXN",
  "USD-COP",
  "EUR-USD",
  "USD-PEN",
  "GBP-USD",
  "USD-CLP",
  "USD-BRL",
  "EUR-MXN",
  "USD-ARS",
  "USD-VES",
]

export default function TasasPage() {
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState<string[]>(["USD-MXN", "USD-COP", "EUR-USD"])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchRates = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const newRates = getAllRatesForCurrency(baseCurrency)
      setRates(newRates)
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 500)
  }

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 5000)
    return () => clearInterval(interval)
  }, [baseCurrency])

  const toggleFavorite = (pair: string) => {
    setFavorites((prev) => (prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]))
  }

  const filteredRates = rates.filter((rate) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    const currency = getCurrencyByCode(rate.to)
    return (
      rate.to.toLowerCase().includes(searchLower) ||
      currency?.name.toLowerCase().includes(searchLower) ||
      currency?.country.toLowerCase().includes(searchLower)
    )
  })

  const favoriteRates = popularPairs
    .filter((pair) => favorites.includes(pair))
    .map((pair) => {
      const [from, to] = pair.split("-")
      return getExchangeRate(from, to)
    })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tasas de Cambio en Vivo</h1>
              <p className="text-muted-foreground">Actualizadas en tiempo real cada 5 segundos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span>Última actualización: {lastUpdate.toLocaleTimeString("es-ES")}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRates}
                disabled={isRefreshing}
                className="bg-transparent"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                Actualizar
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="all">Todas las Tasas</TabsTrigger>
                <TabsTrigger value="favorites">Favoritos ({favorites.length})</TabsTrigger>
                <TabsTrigger value="calculator">Calculadora</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar moneda..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-64 bg-secondary/50 border-0"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              {/* Base currency selector */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-muted-foreground">Moneda base:</span>
                    {["USD", "EUR", "GBP", "MXN", "COP"].map((code) => {
                      const currency = getCurrencyByCode(code)
                      return (
                        <Button
                          key={code}
                          variant={baseCurrency === code ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBaseCurrency(code)}
                          className={baseCurrency !== code ? "bg-transparent" : ""}
                        >
                          {currency?.flag} {code}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Rates grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRates.map((rate) => {
                  const currency = getCurrencyByCode(rate.to)
                  const pairKey = `${rate.from}-${rate.to}`
                  const isFavorite = favorites.includes(pairKey)

                  return (
                    <Card key={rate.to} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{currency?.flag}</span>
                            <div>
                              <p className="font-semibold text-foreground">{rate.to}</p>
                              <p className="text-xs text-muted-foreground">{currency?.name}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleFavorite(pairKey)}
                          >
                            {isFavorite ? (
                              <Star className="h-4 w-4 fill-warning text-warning" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold font-mono text-foreground">{rate.rate.toFixed(4)}</p>
                            <p className="text-xs text-muted-foreground">
                              1 {rate.from} = {rate.rate.toFixed(4)} {rate.to}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              rate.change24h >= 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive",
                            )}
                          >
                            {rate.change24h >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {rate.change24h >= 0 ? "+" : ""}
                            {rate.change24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              {favorites.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <StarOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No tienes favoritos</h3>
                    <p className="text-muted-foreground">
                      Marca pares de divisas como favoritos para acceder rápidamente a ellos
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteRates.map((rate) => {
                    const fromCurrency = getCurrencyByCode(rate.from)
                    const toCurrency = getCurrencyByCode(rate.to)
                    const pairKey = `${rate.from}-${rate.to}`

                    return (
                      <Card key={pairKey} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{fromCurrency?.flag}</span>
                              <span className="font-semibold">{rate.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-xl">{toCurrency?.flag}</span>
                              <span className="font-semibold">{rate.to}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleFavorite(pairKey)}
                            >
                              <Star className="h-4 w-4 fill-warning text-warning" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-3xl font-bold font-mono text-foreground">{rate.rate.toFixed(4)}</p>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  rate.change24h >= 0
                                    ? "bg-accent/10 text-accent"
                                    : "bg-destructive/10 text-destructive",
                                )}
                              >
                                {rate.change24h >= 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {rate.change24h >= 0 ? "+" : ""}
                                {rate.change24h.toFixed(2)}%
                              </Badge>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <Bell className="h-4 w-4 mr-2" />
                                Alertas
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Calculadora de Cambio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RateCalculator />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function RateCalculator() {
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("MXN")
  const [amount, setAmount] = useState("1000")
  const [rate, setRate] = useState<ExchangeRate | null>(null)

  useEffect(() => {
    const newRate = getExchangeRate(fromCurrency, toCurrency)
    setRate(newRate)

    const interval = setInterval(() => {
      setRate(getExchangeRate(fromCurrency, toCurrency))
    }, 3000)

    return () => clearInterval(interval)
  }, [fromCurrency, toCurrency])

  const parsedAmount = Number.parseFloat(amount) || 0
  const convertedAmount = rate ? parsedAmount * rate.rate : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">De</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full h-12 px-3 rounded-lg bg-secondary/50 border-0 text-foreground"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">A</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full h-12 px-3 rounded-lg bg-secondary/50 border-0 text-foreground"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Monto</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-14 text-2xl font-bold bg-secondary/50 border-0"
          placeholder="0.00"
        />
      </div>

      {rate && (
        <div className="p-6 rounded-xl bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tipo de cambio</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-foreground">
                1 {fromCurrency} = {rate.rate.toFixed(4)} {toCurrency}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  rate.change24h >= 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive",
                )}
              >
                {rate.change24h >= 0 ? "+" : ""}
                {rate.change24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Recibirás aproximadamente</p>
            <p className="text-4xl font-bold text-accent">
              {getCurrencyByCode(toCurrency)?.symbol}
              {convertedAmount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xl ml-2 text-muted-foreground">{toCurrency}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
