import { getSession } from "@/lib/auth"
import { StatsCards } from "@/components/dashboard/stats-cards"

// Mock function to get dashboard stats
function getDashboardStats() {
  return {
    pendingValidation: 0,
    pendingPayment: 0,
    todayTransactions: 0,
    totalUsers: 0,
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const stats = getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#121A56]">Dashboard</h1>
          <p className="text-[#121A56]/70">Bienvenido, {session?.user?.name?.split(" ")[0] || "Usuario"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar"
          className="w-full px-4 py-3 bg-white border border-[#121A56]/20 rounded-lg text-[#121A56] placeholder:text-[#121A56]/40 focus:ring-2 focus:ring-[#F5A017] focus:border-[#F5A017] transition-colors"
        />
      </div>
    </div>
  )
}
