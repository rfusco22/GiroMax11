"use client"

import { FileCheck, CreditCard, Clock, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: {
    pendingValidation: number
    pendingPayment: number
    todayTransactions: number
    totalUsers: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Por Validar",
      subtitle: "Transacciones",
      value: stats.pendingValidation,
      icon: FileCheck,
      color: "text-[#F5A017]",
      bgColor: "bg-[#F5A017]/10",
    },
    {
      title: "Por Pagar",
      subtitle: "Transacciones",
      value: stats.pendingPayment,
      icon: CreditCard,
      color: "text-[#DB530F]",
      bgColor: "bg-[#DB530F]/10",
    },
    {
      title: "Hoy",
      subtitle: "Transacciones",
      value: stats.todayTransactions,
      icon: Clock,
      color: "text-[#F5A017]",
      bgColor: "bg-[#F5A017]/10",
    },
    {
      title: "Registrados",
      subtitle: "Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-[#121A56]",
      bgColor: "bg-[#121A56]/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
          className="border border-[#121A56]/20 shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group cursor-pointer"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "p-3 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                  card.bgColor,
                )}
              >
                <card.icon className={cn("h-6 w-6 transition-transform duration-300", card.color)} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-[#121A56] transition-all duration-300 group-hover:scale-105">
                {card.value}
              </p>
              <p className="text-sm text-[#121A56] font-medium">{card.title}</p>
              <p className="text-xs text-[#121A56]/60">{card.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
