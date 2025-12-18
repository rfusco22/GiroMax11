"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

export function VerificationStatusBadge() {
  const [status, setStatus] = useState<"none" | "pending" | "approved" | "rejected">("none")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    const result = await getCurrentUser()

    if (result.user) {
      setStatus(result.user.kyc_status || "none")
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Badge
        variant="outline"
        className="w-fit flex items-center gap-1.5 px-2 py-1 bg-gray-500/20 text-gray-400 border-gray-500/30"
      >
        <AlertCircle className="h-3 w-3" />
        <span className="text-xs font-medium">Cargando...</span>
      </Badge>
    )
  }

  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          label: "Verificado",
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-400 border-green-500/30",
        }
      case "pending":
        return {
          label: "En Verificación",
          icon: Clock,
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        }
      case "rejected":
      case "none":
      default:
        return {
          label: "No Verificado",
          icon: XCircle,
          className: "bg-red-500/20 text-red-400 border-red-500/30",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("w-fit flex items-center gap-1.5 px-2 py-1", config.className)}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  )
}
