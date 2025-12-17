"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { getExchangeRate, type ExchangeRate } from "@/lib/exchange-rates"
import { cn } from "@/lib/utils"

const popularPairs = [
  { from: "USD", to: "COP" },
  { from: "USD", to: "PEN" },
  { from: "USD", to: "CLP" },
  { from: "USD", to: "VES" },
  { from: "COP", to: "USD" },
  { from: "PEN", to: "USD" },
  { from: "CLP", to: "USD" },
  { from: "VES", to: "USD" },
]

export function LiveRatesTicker() {
  const [rates, setRates] = useState<ExchangeRate[]>([])

  useEffect(() => {
    const updateRates = () => {
      const newRates = popularPairs.map((pair) => getExchangeRate(pair.from, pair.to))
      setRates(newRates)
    }

    updateRates()
    const interval = setInterval(updateRates, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#121A56]/5 border-y border-[#121A56]/10 py-2 overflow-hidden">
      <div className="flex animate-[scroll_30s_linear_infinite] hover:pause">
        <div className="flex gap-8 px-4 min-w-max">
          {[...rates, ...rates].map((rate, index) => (
            <div key={`${rate.from}-${rate.to}-${index}`} className="flex items-center gap-3 text-sm">
              <span className="font-medium text-foreground">
                {rate.from}/{rate.to}
              </span>
              <span className="font-mono text-foreground">{rate.rate.toFixed(4)}</span>
              <span
                className={cn("flex items-center text-xs", rate.change24h >= 0 ? "text-[#F5A017]" : "text-destructive")}
              >
                {rate.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {rate.change24h >= 0 ? "+" : ""}
                {rate.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
