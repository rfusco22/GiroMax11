"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Users, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { getPendingKYCs } from "@/app/actions/kyc"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Stats {
  pendingVerifications: number
  totalUsers: number
  todayTransactions: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    pendingVerifications: 0,
    totalUsers: 0,
    todayTransactions: 0,
    monthlyRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      // Load pending verifications
      const kycResult = await getPendingKYCs()
      const pendingCount = kycResult.kycs?.length || 0

      setStats({
        pendingVerifications: pendingCount,
        totalUsers: 0,
        todayTransactions: 0,
        monthlyRevenue: 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5A017]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Bienvenido al panel de gestión</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificaciones Pendientes</CardTitle>
            <Clock className="h-5 w-5 text-[#F5A017]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingVerifications > 0 ? "Requieren atención" : "Todo al día"}
            </p>
            {stats.pendingVerifications > 0 && (
              <Link href="/admin/verificaciones">
                <Button variant="link" className="px-0 mt-2 text-[#F5A017] hover:text-[#F5A017]/80">
                  Ver verificaciones
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Total en el sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Hoy</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Actividad del día</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Mes actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/verificaciones">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#F5A017]/10 rounded-lg group-hover:bg-[#F5A017]/20 transition-colors">
                  <CheckCircle className="h-6 w-6 text-[#F5A017]" />
                </div>
                <div>
                  <CardTitle className="text-base">Verificar Usuarios</CardTitle>
                  <CardDescription className="mt-1">Aprobar o rechazar documentos KYC</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/usuarios/crear">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Crear Usuario</CardTitle>
                  <CardDescription className="mt-1">Agregar administrador o gerencia</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/margenes">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Gestionar Márgenes</CardTitle>
                  <CardDescription className="mt-1">Configurar porcentajes de ganancia</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.pendingVerifications === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {stats.pendingVerifications}{" "}
                    {stats.pendingVerifications === 1 ? "verificación pendiente" : "verificaciones pendientes"}
                  </p>
                  <p className="text-xs text-muted-foreground">Requieren revisión</p>
                </div>
                <Link href="/admin/verificaciones">
                  <Button size="sm" variant="outline">
                    Revisar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
