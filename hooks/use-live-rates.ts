"use client"

import { useState, useEffect, useCallback } from "react"
import type { ExchangeRate } from "@/lib/exchange-rates"

interface UseLiveRatesOptions {
  pairs?: string[]
  refreshInterval?: number
  useSSE?: boolean
}

export function useLiveRates(options: UseLiveRatesOptions = {}) {
  const { pairs = ["USD-MXN", "USD-COP", "EUR-USD", "USD-PEN"], refreshInterval = 5000, useSSE = false } = options

  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchRates = useCallback(async () => {
    try {
      const ratePromises = pairs.map(async (pair) => {
        const [from, to] = pair.split("-")
        const res = await fetch(`/api/rates?base=${from}&target=${to}`)
        const json = await res.json()
        return json.data as ExchangeRate
      })

      const newRates = await Promise.all(ratePromises)
      setRates(newRates)
      setLastUpdate(new Date())
      setError(null)
    } catch (e) {
      setError("Error al obtener tasas")
    } finally {
      setIsLoading(false)
    }
  }, [pairs])

  useEffect(() => {
    if (useSSE) {
      // Server-Sent Events para tiempo real
      const eventSource = new EventSource(`/api/rates/stream?pairs=${pairs.join(",")}`)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setRates(data.rates)
        setLastUpdate(new Date(data.timestamp))
        setIsLoading(false)
      }

      eventSource.onerror = () => {
        setError("Conexión perdida, reconectando...")
        eventSource.close()
        // Fallback a polling
        fetchRates()
      }

      return () => eventSource.close()
    } else {
      // Polling tradicional
      fetchRates()
      const interval = setInterval(fetchRates, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [useSSE, pairs, refreshInterval, fetchRates])

  return { rates, isLoading, error, lastUpdate, refresh: fetchRates }
}
