import { NextResponse } from "next/server"
import { getAllRatesForCurrency, getExchangeRate } from "@/lib/exchange-rates"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const base = searchParams.get("base") || "USD"
  const target = searchParams.get("target")

  try {
    if (target) {
      // Tasa específica
      const rate = getExchangeRate(base, target)
      return NextResponse.json({
        success: true,
        data: rate,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Todas las tasas para la moneda base
      const rates = getAllRatesForCurrency(base)
      return NextResponse.json({
        success: true,
        base,
        data: rates,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error fetching rates" }, { status: 500 })
  }
}
