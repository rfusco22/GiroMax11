"use client"

import { Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/auth"

interface DashboardHeaderProps {
  user?: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const userName = user?.name || "Usuario"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#121A56] border-b border-white/10">
      <div className="flex items-center justify-end h-full px-6 gap-4">
        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" className="text-white/80 hover:bg-[#F5A017]/10 hover:text-[#F5A017]">
          <Moon className="h-5 w-5" />
        </Button>

        {/* User avatar */}
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-[#DB530F] text-white text-sm">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
