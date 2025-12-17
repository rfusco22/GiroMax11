import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "administrador" || session.user.role === "gerencia") {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <DashboardHeader user={session.user} />
        <main className="p-4 lg:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</main>
      </div>
    </div>
  )
}
