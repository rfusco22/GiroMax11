"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTransactions, type Transaction } from "@/lib/transactions"
import { getCurrencyByCode } from "@/lib/currencies"
import { cn } from "@/lib/utils"

const statusConfig = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-warning/10 text-warning border-warning/20" },
  processing: { label: "Procesando", icon: Loader, color: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Completado", icon: CheckCircle, color: "bg-accent/10 text-accent border-accent/20" },
  failed: { label: "Fallido", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-muted text-muted-foreground border-muted" },
}

const typeLabels = {
  exchange: "Cambio",
  transfer: "Transferencia",
  deposit: "Depósito",
  withdrawal: "Retiro",
}

function TransactionDetail({ transaction }: { transaction: Transaction }) {
  const fromCurrency = getCurrencyByCode(transaction.fromCurrency)
  const toCurrency = getCurrencyByCode(transaction.toCurrency)
  const status = statusConfig[transaction.status]

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("text-sm py-1 px-3", status.color)}>
          <status.icon className="h-4 w-4 mr-2" />
          {status.label}
        </Badge>
        <span className="text-sm text-muted-foreground">Ref: {transaction.reference}</span>
      </div>

      {/* Amount display */}
      <div className="p-6 rounded-xl bg-secondary/30 text-center">
        <p className="text-sm text-muted-foreground mb-2">Monto enviado</p>
        <p className="text-3xl font-bold text-foreground">
          {fromCurrency?.flag} {fromCurrency?.symbol}
          {transaction.fromAmount.toLocaleString("es-ES", { minimumFractionDigits: 2 })} {transaction.fromCurrency}
        </p>
        <div className="my-4 flex items-center justify-center gap-2 text-muted-foreground">
          <div className="h-px w-12 bg-border" />
          <span className="text-sm">Tasa: {transaction.rate.toFixed(4)}</span>
          <div className="h-px w-12 bg-border" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">Monto recibido</p>
        <p className="text-2xl font-semibold text-accent">
          {toCurrency?.flag} {toCurrency?.symbol}
          {transaction.toAmount.toLocaleString("es-ES", { minimumFractionDigits: 2 })} {transaction.toCurrency}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-secondary/20">
          <p className="text-sm text-muted-foreground">Tipo</p>
          <p className="font-medium text-foreground">{typeLabels[transaction.type]}</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/20">
          <p className="text-sm text-muted-foreground">Comisión</p>
          <p className="font-medium text-foreground">${transaction.fee.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/20">
          <p className="text-sm text-muted-foreground">Fecha de creación</p>
          <p className="font-medium text-foreground">
            {transaction.createdAt.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/20">
          <p className="text-sm text-muted-foreground">Fecha de completado</p>
          <p className="font-medium text-foreground">
            {transaction.completedAt
              ? transaction.completedAt.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </p>
        </div>
      </div>

      {/* Recipient info */}
      {transaction.recipient && (
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-3">Información del destinatario</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nombre</p>
              <p className="font-medium text-foreground">{transaction.recipient.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Banco</p>
              <p className="font-medium text-foreground">{transaction.recipient.bank}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cuenta</p>
              <p className="font-medium text-foreground">{transaction.recipient.account}</p>
            </div>
            <div>
              <p className="text-muted-foreground">País</p>
              <p className="font-medium text-foreground">{transaction.recipient.country}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistorialPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currencyFilter, setCurrencyFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const allTransactions = getTransactions("demo")

  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.reference.toLowerCase().includes(searchLower) ||
          t.fromCurrency.toLowerCase().includes(searchLower) ||
          t.toCurrency.toLowerCase().includes(searchLower) ||
          t.recipient?.name.toLowerCase().includes(searchLower),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // Currency filter
    if (currencyFilter !== "all") {
      filtered = filtered.filter((t) => t.fromCurrency === currencyFilter || t.toCurrency === currencyFilter)
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((t) => t.createdAt >= filterDate)
    }

    return filtered
  }, [allTransactions, search, statusFilter, typeFilter, currencyFilter, dateRange])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const uniqueCurrencies = [...new Set(allTransactions.flatMap((t) => [t.fromCurrency, t.toCurrency]))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historial de Transacciones</h1>
          <p className="text-muted-foreground">Consulta y filtra todas tus operaciones</p>
        </div>
        <Button variant="outline" className="bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por referencia, moneda, destinatario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-0"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-36 bg-secondary/50 border-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-secondary/50 border-0">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 bg-secondary/50 border-0">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="exchange">Cambio</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                  <SelectItem value="withdrawal">Retiro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="w-32 bg-secondary/50 border-0">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {getCurrencyByCode(currency)?.flag} {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {paginatedTransactions.length} de {filteredTransactions.length} transacciones
        </p>
      </div>

      {/* Transactions table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">De / A</TableHead>
              <TableHead className="font-semibold text-right">Monto</TableHead>
              <TableHead className="font-semibold text-right">Recibido</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => {
              const fromCurrency = getCurrencyByCode(transaction.fromCurrency)
              const toCurrency = getCurrencyByCode(transaction.toCurrency)
              const status = statusConfig[transaction.status]
              const StatusIcon = status.icon

              return (
                <TableRow key={transaction.id} className="hover:bg-secondary/20">
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {transaction.createdAt.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        {transaction.createdAt.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          transaction.type === "deposit" || transaction.type === "exchange"
                            ? "bg-accent/10"
                            : "bg-primary/10",
                        )}
                      >
                        {transaction.type === "deposit" || transaction.type === "exchange" ? (
                          <ArrowDownLeft className="h-4 w-4 text-accent" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{typeLabels[transaction.type]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">
                        {fromCurrency?.flag} {transaction.fromCurrency}
                      </span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="font-medium">
                        {toCurrency?.flag} {transaction.toCurrency}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fromCurrency?.symbol}
                    {transaction.fromAmount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-accent">
                    {toCurrency?.symbol}
                    {transaction.toAmount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", status.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Detalle de Transacción</DialogTitle>
                          <DialogDescription>Información completa de la operación</DialogDescription>
                        </DialogHeader>
                        <TransactionDetail transaction={transaction} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage !== pageNum ? "bg-transparent" : ""}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
