export interface Transaction {
  id: string
  userId: string
  type: "exchange" | "transfer" | "deposit" | "withdrawal"
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  rate: number
  fee: number
  recipient?: {
    name: string
    bank?: string
    account?: string
    country?: string
  }
  createdAt: Date
  completedAt?: Date
  reference: string
}

// Generar transacciones de ejemplo
function generateTransactions(userId: string): Transaction[] {
  const statuses: Transaction["status"][] = ["completed", "completed", "completed", "pending", "processing"]
  const types: Transaction["type"][] = ["exchange", "transfer", "exchange", "deposit", "withdrawal"]
  const currencies = ["USD", "EUR", "MXN", "COP", "PEN", "CLP"]

  const transactions: Transaction[] = []

  for (let i = 0; i < 50; i++) {
    const fromCurrency = currencies[Math.floor(Math.random() * currencies.length)]
    let toCurrency = currencies[Math.floor(Math.random() * currencies.length)]
    while (toCurrency === fromCurrency) {
      toCurrency = currencies[Math.floor(Math.random() * currencies.length)]
    }

    const fromAmount = Math.floor(Math.random() * 5000) + 100
    const rate = Math.random() * 20 + 0.1
    const toAmount = fromAmount * rate

    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 90))

    transactions.push({
      id: `txn_${Date.now()}_${i}`,
      userId,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      rate,
      fee: fromAmount * 0.001,
      recipient:
        Math.random() > 0.5
          ? {
              name: ["María García", "Juan López", "Ana Martínez", "Carlos Rodríguez"][Math.floor(Math.random() * 4)],
              bank: ["BBVA", "Santander", "Banorte", "Scotiabank"][Math.floor(Math.random() * 4)],
              account: `****${Math.floor(Math.random() * 9000) + 1000}`,
              country: ["MX", "CO", "PE", "CL"][Math.floor(Math.random() * 4)],
            }
          : undefined,
      createdAt: date,
      completedAt: Math.random() > 0.3 ? new Date(date.getTime() + Math.random() * 3600000) : undefined,
      reference: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
    })
  }

  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Cache de transacciones por usuario
const transactionsCache: Map<string, Transaction[]> = new Map()

export function getTransactions(userId: string): Transaction[] {
  if (!transactionsCache.has(userId)) {
    transactionsCache.set(userId, generateTransactions(userId))
  }
  return transactionsCache.get(userId)!
}

export function getTransactionById(userId: string, transactionId: string): Transaction | undefined {
  return getTransactions(userId).find((t) => t.id === transactionId)
}

export function getTransactionStats(userId: string) {
  const transactions = getTransactions(userId)
  const now = new Date()
  const thisMonth = transactions.filter(
    (t) => t.createdAt.getMonth() === now.getMonth() && t.createdAt.getFullYear() === now.getFullYear(),
  )

  const lastMonth = transactions.filter((t) => {
    const lastMonthDate = new Date(now)
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    return (
      t.createdAt.getMonth() === lastMonthDate.getMonth() && t.createdAt.getFullYear() === lastMonthDate.getFullYear()
    )
  })

  const totalVolume = thisMonth.reduce((sum, t) => sum + t.fromAmount, 0)
  const lastMonthVolume = lastMonth.reduce((sum, t) => sum + t.fromAmount, 0)
  const volumeChange = lastMonthVolume > 0 ? ((totalVolume - lastMonthVolume) / lastMonthVolume) * 100 : 0

  const completedThisMonth = thisMonth.filter((t) => t.status === "completed").length
  const completedLastMonth = lastMonth.filter((t) => t.status === "completed").length
  const transactionsChange =
    completedLastMonth > 0 ? ((completedThisMonth - completedLastMonth) / completedLastMonth) * 100 : 0

  const totalSaved = thisMonth.reduce((sum, t) => sum + t.fee * 0.5, 0) // Simulated savings

  return {
    totalVolume,
    volumeChange,
    transactionsThisMonth: completedThisMonth,
    transactionsChange,
    pendingTransactions: transactions.filter((t) => t.status === "pending" || t.status === "processing").length,
    totalSaved,
    averageRate: thisMonth.length > 0 ? thisMonth.reduce((sum, t) => sum + t.rate, 0) / thisMonth.length : 0,
  }
}

export function getMonthlyData(userId: string) {
  const transactions = getTransactions(userId)
  const months: { month: string; volume: number; transactions: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleDateString("es-ES", { month: "short" })

    const monthTransactions = transactions.filter(
      (t) => t.createdAt.getMonth() === date.getMonth() && t.createdAt.getFullYear() === date.getFullYear(),
    )

    months.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      volume: monthTransactions.reduce((sum, t) => sum + t.fromAmount, 0),
      transactions: monthTransactions.length,
    })
  }

  return months
}

export function getCurrencyDistribution(userId: string) {
  const transactions = getTransactions(userId)
  const distribution: Record<string, number> = {}

  transactions.forEach((t) => {
    distribution[t.fromCurrency] = (distribution[t.fromCurrency] || 0) + t.fromAmount
  })

  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0)

  return Object.entries(distribution)
    .map(([currency, amount]) => ({
      currency,
      amount,
      percentage: (amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}
