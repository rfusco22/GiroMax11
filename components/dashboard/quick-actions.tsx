"use client"

import Link from "next/link"
import { ArrowLeftRight, Send, Download, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions = [
  {
    icon: ArrowLeftRight,
    label: "Cambiar",
    description: "Cambiar divisas",
    href: "/dashboard/cambio",
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    icon: Send,
    label: "Enviar",
    description: "Transferir dinero",
    href: "/dashboard/enviar",
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    icon: Download,
    label: "Depositar",
    description: "Añadir fondos",
    href: "/dashboard/depositar",
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  {
    icon: CreditCard,
    label: "Retirar",
    description: "Retirar fondos",
    href: "/dashboard/retirar",
    color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
  },
]

export function QuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                variant="ghost"
                className={`w-full h-auto py-4 flex flex-col items-center gap-2 ${action.color} transition-colors`}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
