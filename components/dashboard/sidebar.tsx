"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Wallet,
  ArrowLeftRight,
  History,
  PlusCircle,
  LogOut,
  Users,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { AnimatedLogo } from "./animated-logo"
import { VerificationStatusBadge } from "./verification-status-badge"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/app/actions/auth"
import type { User as UserType } from "@/lib/auth"

const clientMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Mi Perfil", href: "/dashboard/perfil" },
  { icon: Wallet, label: "Cuentas", href: "/dashboard/cuentas" },
  { icon: ArrowLeftRight, label: "Tasas Actuales", href: "/dashboard/tasas" },
  { icon: History, label: "Transacciones", href: "/dashboard/transacciones" },
  { icon: PlusCircle, label: "Crear Transacción", href: "/dashboard/crear-transaccion" },
]

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: CheckCircle, label: "Verificaciones", href: "/admin/verificaciones" },
  { icon: Users, label: "Crear Usuario", href: "/admin/usuarios/crear" },
  { icon: TrendingUp, label: "Márgenes", href: "/admin/margenes" },
  { icon: User, label: "Mi Perfil", href: "/dashboard/perfil" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserType | null>(null)
  const [menuItems, setMenuItems] = useState(clientMenuItems)

  useEffect(() => {
    async function loadUser() {
      const result = await getCurrentUser()
      if (result.user) {
        setUser(result.user)
        if (result.user.role === "administrador" || result.user.role === "gerencia") {
          setMenuItems(adminMenuItems)
        } else {
          setMenuItems(clientMenuItems)
        }
      }
    }
    loadUser()
  }, [])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#121A56] border-r border-white/10">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AnimatedLogo />
            <span className="text-white font-bold italic text-xl tracking-wide">GIROS MAX</span>
          </div>
          {user?.role === "cliente" && (
            <div className="w-full flex justify-center mb-2">
              <VerificationStatusBadge />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-white/80 hover:bg-[#F5A017]/10 hover:text-[#F5A017] hover:translate-x-1 animate-in fade-in slide-in-from-left-3",
                  isActive && "bg-[#F5A017]/20 text-[#F5A017] font-medium shadow-lg shadow-[#F5A017]/20",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/10">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 hover:translate-x-1"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Salir</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
