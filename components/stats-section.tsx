"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K"
    }
    return num.toLocaleString()
  }

  return (
    <span>
      {suffix === "%" ? count.toFixed(1) : formatNumber(count)}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  const { language } = useLanguage()

  const stats = [
    {
      value: 50000,
      suffix: "+",
      label: language === "es" ? "Usuarios activos" : "Active users",
    },
    {
      value: 7,
      suffix: "",
      label: language === "es" ? "Países disponibles" : "Countries available",
    },
    {
      value: 99.9,
      suffix: "%",
      label: language === "es" ? "Uptime garantizado" : "Guaranteed uptime",
    },
    {
      value: 10,
      suffix: "M+",
      label: language === "es" ? "USD procesados" : "USD processed",
    },
  ]

  return (
    <section className="py-16 bg-[#121A56]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#F5A017] mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
