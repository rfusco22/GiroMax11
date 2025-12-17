"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const exchangeRates = [
  { from: "🇨🇱 Chile", to: "🇨🇴 Colombia", rate: "3,74 $", updated: "15/12/2025 10:20" },
  { from: "🇨🇱 Chile", to: "🇵🇪 Peru (Sol)", rate: "300,15 $", updated: "15/12/2025 10:20" },
  { from: "🇨🇱 Chile", to: "🇺🇸 Zelle", rate: "1.009,39 $", updated: "15/12/2025 10:20" },
  { from: "🇨🇱 Chile", to: "Tether", rate: "0 $", updated: "15/12/2025 10:21" },
  { from: "🇨🇱 Chile", to: "🇻🇪 Recarga de Saldo", rate: "0,21902 Bs.", updated: "09/12/2025 00:52" },
  { from: "🇨🇱 Chile", to: "🇻🇪 Recarga Digitel", rate: "0,21902 Bs.", updated: "09/12/2025 00:52" },
  { from: "🇨🇱 Chile", to: "🇻🇪 Recarga Movinet", rate: "0,21902 Bs.", updated: "09/12/2025 00:52" },
  { from: "🇨🇱 Chile", to: "🇻🇪 Venezuela", rate: "0,42159 Bs.", updated: "15/12/2025 10:20" },
  { from: "🇨🇴 Colombia", to: "🇨🇱 Chile", rate: "4,52 $", updated: "15/12/2025 10:20" },
  { from: "🇨🇴 Colombia", to: "🇵🇪 Peru (Sol)", rate: "1.196,72 $", updated: "15/12/2025 10:21" },
  { from: "🇨🇴 Colombia", to: "🇺🇸 Zelle", rate: "4.023,56 $", updated: "15/12/2025 10:21" },
  { from: "🇨🇴 Colombia", to: "Tether", rate: "0 $", updated: "15/12/2025 10:21" },
]

export default function TasasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tasas Actuales</h1>
        <p className="text-muted-foreground">Consulta las tasas de cambio en tiempo real</p>
      </div>

      {/* Rates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {exchangeRates.map((rate, index) => (
          <Card key={index} className="border-0 shadow-sm bg-[#2A3254]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>{rate.from}</span>
                <span>→</span>
                <span>{rate.to}</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{rate.rate}</p>
                <p className="text-xs text-white/60 mt-2">Actualizado el: {rate.updated}</p>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">CREAR</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
