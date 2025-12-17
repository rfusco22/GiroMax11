"use client"

import { useState, useMemo } from "react"
import { Download, FileText, Calendar, DollarSign, ArrowRightLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { getTransactions, getMonthlyData, getCurrencyDistribution } from "@/lib/transactions"
import { getCurrencyByCode } from "@/lib/currencies"

const COLORS = ["#3b5bdb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function ReportesPage() {
  const [period, setPeriod] = useState("month")
  const transactions = getTransactions("demo")
  const monthlyData = getMonthlyData("demo")
  const currencyDistribution = getCurrencyDistribution("demo")

  const reportData = useMemo(() => {
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredTransactions = transactions.filter((t) => t.createdAt >= startDate)
    const completedTransactions = filteredTransactions.filter((t) => t.status === "completed")

    const totalVolume = filteredTransactions.reduce((sum, t) => sum + t.fromAmount, 0)
    const totalReceived = completedTransactions.reduce((sum, t) => sum + t.toAmount, 0)
    const totalFees = filteredTransactions.reduce((sum, t) => sum + t.fee, 0)
    const avgTransactionSize = filteredTransactions.length > 0 ? totalVolume / filteredTransactions.length : 0

    // Volumen por tipo
    const volumeByType = {
      exchange: filteredTransactions.filter((t) => t.type === "exchange").reduce((sum, t) => sum + t.fromAmount, 0),
      transfer: filteredTransactions.filter((t) => t.type === "transfer").reduce((sum, t) => sum + t.fromAmount, 0),
      deposit: filteredTransactions.filter((t) => t.type === "deposit").reduce((sum, t) => sum + t.fromAmount, 0),
      withdrawal: filteredTransactions.filter((t) => t.type === "withdrawal").reduce((sum, t) => sum + t.fromAmount, 0),
    }

    // Transacciones por día para el período
    const dailyData: { date: string; volume: number; count: number }[] = []
    const dayCount = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    for (let i = Math.min(dayCount, 30); i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })

      const dayTransactions = filteredTransactions.filter((t) => t.createdAt.toDateString() === date.toDateString())

      dailyData.push({
        date: dateStr,
        volume: dayTransactions.reduce((sum, t) => sum + t.fromAmount, 0),
        count: dayTransactions.length,
      })
    }

    return {
      totalVolume,
      totalReceived,
      totalFees,
      avgTransactionSize,
      transactionCount: filteredTransactions.length,
      completedCount: completedTransactions.length,
      pendingCount: filteredTransactions.filter((t) => t.status === "pending" || t.status === "processing").length,
      failedCount: filteredTransactions.filter((t) => t.status === "failed").length,
      volumeByType,
      dailyData,
      topCurrencyPairs: filteredTransactions
        .reduce(
          (acc, t) => {
            const pair = `${t.fromCurrency}/${t.toCurrency}`
            const existing = acc.find((p) => p.pair === pair)
            if (existing) {
              existing.volume += t.fromAmount
              existing.count += 1
            } else {
              acc.push({ pair, volume: t.fromAmount, count: 1 })
            }
            return acc
          },
          [] as { pair: string; volume: number; count: number }[],
        )
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5),
    }
  }, [period, transactions])

  const typeChartData = [
    { name: "Cambio", value: reportData.volumeByType.exchange, color: COLORS[0] },
    { name: "Transferencia", value: reportData.volumeByType.transfer, color: COLORS[1] },
    { name: "Depósito", value: reportData.volumeByType.deposit, color: COLORS[2] },
    { name: "Retiro", value: reportData.volumeByType.withdrawal, color: COLORS[3] },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes y Contabilidad</h1>
          <p className="text-muted-foreground">Análisis detallado de tus operaciones</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-secondary/50 border-0">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volumen Total</p>
                <p className="text-2xl font-bold text-foreground">
                  ${reportData.totalVolume.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Operaciones</p>
                <p className="text-2xl font-bold text-foreground">{reportData.transactionCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <ArrowRightLeft className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio por Operación</p>
                <p className="text-2xl font-bold text-foreground">
                  ${reportData.avgTransactionSize.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-chart-3/10">
                <BarChart3 className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comisiones Pagadas</p>
                <p className="text-2xl font-bold text-foreground">${reportData.totalFees.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-chart-4/10">
                <FileText className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="volume">Volumen</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="pairs">Pares Populares</TabsTrigger>
        </TabsList>

        <TabsContent value="volume">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Volumen Diario</CardTitle>
              <CardDescription>Evolución del volumen de operaciones en el período seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b5bdb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Volumen"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#3b5bdb"
                      strokeWidth={2}
                      fill="url(#reportVolumeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Por Tipo de Operación</CardTitle>
                <CardDescription>Distribución del volumen según el tipo de transacción</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Volumen"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Por Moneda</CardTitle>
                <CardDescription>Distribución del volumen según la moneda de origen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currencyDistribution} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="currency"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Volumen"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="amount" fill="#3b5bdb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pairs">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Pares de Divisas Más Operados</CardTitle>
              <CardDescription>Los pares de monedas con mayor volumen de operaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Par</TableHead>
                    <TableHead className="font-semibold text-right">Volumen</TableHead>
                    <TableHead className="font-semibold text-right">Operaciones</TableHead>
                    <TableHead className="font-semibold text-right">% del Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.topCurrencyPairs.map((pair, index) => {
                    const [from, to] = pair.pair.split("/")
                    const fromCurrency = getCurrencyByCode(from)
                    const toCurrency = getCurrencyByCode(to)
                    const percentage = (pair.volume / reportData.totalVolume) * 100

                    return (
                      <TableRow key={pair.pair} className="hover:bg-secondary/20">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{fromCurrency?.flag}</span>
                            <span className="font-medium">{from}</span>
                            <span className="text-muted-foreground">→</span>
                            <span>{toCurrency?.flag}</span>
                            <span className="font-medium">{to}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${pair.volume.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="text-right">{pair.count}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="font-medium w-12">{percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Status Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Resumen de Estados</CardTitle>
          <CardDescription>Estado de las transacciones en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-accent/10 text-center">
              <p className="text-3xl font-bold text-accent">{reportData.completedCount}</p>
              <p className="text-sm text-muted-foreground">Completadas</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 text-center">
              <p className="text-3xl font-bold text-warning">{reportData.pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 text-center">
              <p className="text-3xl font-bold text-destructive">{reportData.failedCount}</p>
              <p className="text-sm text-muted-foreground">Fallidas</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 text-center">
              <p className="text-3xl font-bold text-primary">
                {((reportData.completedCount / reportData.transactionCount) * 100 || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
