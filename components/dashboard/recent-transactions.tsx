"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/transactions"
import { getCurrencyByCode } from "@/lib/currencies"
import { cn } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const statusConfig = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-warning/10 text-warning" },
  processing: { label: "Procesando", icon: Loader, color: "bg-primary/10 text-primary" },
  completed: { label: "Completado", icon: CheckCircle, color: "bg-accent/10 text-accent" },
  failed: { label: "Fallido", icon: XCircle, color: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-muted text-muted-foreground" },
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Transacciones Recientes</CardTitle>
        <Link href="/dashboard/historial">
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => {
            const fromCurrency = getCurrencyByCode(transaction.fromCurrency)
            const toCurrency = getCurrencyByCode(transaction.toCurrency)
            const status = statusConfig[transaction.status]
            const StatusIcon = status.icon

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      transaction.type === "deposit" || transaction.type === "exchange"
                        ? "bg-accent/10"
                        : "bg-primary/10",
                    )}
                  >
                    {transaction.type === "deposit" || transaction.type === "exchange" ? (
                      <ArrowDownLeft className="h-5 w-5 text-accent" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {fromCurrency?.flag} {transaction.fromCurrency} → {toCurrency?.flag} {transaction.toCurrency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.createdAt.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {fromCurrency?.symbol}
                    {transaction.fromAmount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant="secondary" className={cn("text-xs", status.color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
