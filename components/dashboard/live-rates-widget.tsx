"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getExchangeRate, type ExchangeRate } from "@/lib/exchange-rates"
import { cn } from "@/lib/utils"

const watchedPairs = [
  { from: "USD", to: "MXN" },
  { from: "USD", to: "COP" },
  { from: "EUR", to: "USD" },
  { from: "USD", to: "PEN" },
]

export function LiveRatesWidget() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRates = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const newRates = watchedPairs.map((pair) => getExchangeRate(pair.from, pair.to))
      setRates(newRates)
      setIsRefreshing(false)
    }, 500)
  }

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Tasas en Vivo</CardTitle>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRates} disabled={isRefreshing}>
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {rates.map((rate) => (
          <div
            key={`${rate.from}-${rate.to}`}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
          >
            <span className="font-medium text-foreground">
              {rate.from}/{rate.to}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-foreground">{rate.rate.toFixed(4)}</span>
              <span
                className={cn("flex items-center text-xs", rate.change24h >= 0 ? "text-accent" : "text-destructive")}
              >
                {rate.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {rate.change24h >= 0 ? "+" : ""}
                {rate.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
