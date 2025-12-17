"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, Bitcoin, Banknote, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GirosMaxLogo } from "@/components/giros-max-logo"
import { SpainFlag, USAFlag } from "@/components/flag-icons"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const services = [
  {
    id: "crypto",
    icon: Bitcoin,
    labelKey: "cryptocurrency" as const,
    descKey: "cryptocurrencyDesc" as const,
    href: "/crypto",
    badge: null,
  },
  {
    id: "currencies",
    icon: Banknote,
    labelKey: "currencies" as const,
    descKey: "currenciesDesc" as const,
    href: "/cambio",
    badge: null,
  },
  {
    id: "transfers",
    icon: Send,
    labelKey: "transfers" as const,
    descKey: "transfersDesc" as const,
    href: "/envios",
    badge: null,
  },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const CurrentFlag = language === "es" ? SpainFlag : USAFlag

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <GirosMaxLogo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <DropdownMenu open={servicesOpen} onOpenChange={setServicesOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t("services")}
                  <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", servicesOpen && "rotate-180")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[380px] p-2 bg-background/95 backdrop-blur-lg border border-border/50 shadow-xl rounded-xl"
              >
                {services.map((service) => (
                  <DropdownMenuItem key={service.id} asChild className="p-0 focus:bg-transparent">
                    <Link
                      href={service.href}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors w-full cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#121A56]/10 flex items-center justify-center flex-shrink-0">
                        <service.icon className="h-6 w-6 text-[#121A56]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{t(service.labelKey)}</span>
                          {service.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-[#F5A017] text-white rounded-full">
                              {service.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t(service.descKey)}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/tasas">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                {t("liveRates")}
              </Button>
            </Link>
            <Link href="/ayuda">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                {t("help")}
              </Button>
            </Link>
          </div>

          {/* Auth buttons + Language Selector */}
          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground px-2">
                  <CurrentFlag className="h-6 w-6 rounded-full" />
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem
                  onClick={() => setLanguage("es")}
                  className={cn("cursor-pointer gap-3 py-2.5", language === "es" && "bg-[#121A56]/10")}
                >
                  <SpainFlag className="h-6 w-6 rounded-full" />
                  <span className="font-medium">Español</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={cn("cursor-pointer gap-3 py-2.5", language === "en" && "bg-[#121A56]/10")}
                >
                  <USAFlag className="h-6 w-6 rounded-full" />
                  <span className="font-medium">English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground">
                {t("login")}
              </Button>
            </Link>
            <Link href="/registro">
              <Button className="bg-[#121A56] hover:bg-[#121A56]/90 text-white">{t("createAccount")}</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn("md:hidden transition-all duration-300 overflow-hidden", isOpen ? "max-h-[600px]" : "max-h-0")}
      >
        <div className="px-4 py-4 space-y-2 bg-background border-t border-border">
          {/* Mobile Services */}
          <div className="space-y-2">
            <p className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase">{t("services")}</p>
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-secondary/50"
                onClick={() => setIsOpen(false)}
              >
                <service.icon className="h-5 w-5 text-[#121A56]" />
                {t(service.labelKey)}
              </Link>
            ))}
          </div>

          <Link
            href="/tasas"
            className="block px-4 py-3 text-foreground rounded-lg hover:bg-secondary/50"
            onClick={() => setIsOpen(false)}
          >
            {t("liveRates")}
          </Link>
          <Link
            href="/ayuda"
            className="block px-4 py-3 text-foreground rounded-lg hover:bg-secondary/50"
            onClick={() => setIsOpen(false)}
          >
            {t("help")}
          </Link>

          <div className="px-4 py-2 flex gap-2">
            <Button
              variant={language === "es" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("es")}
              className={cn("gap-2", language === "es" ? "bg-[#121A56]" : "")}
            >
              <SpainFlag className="h-5 w-5 rounded-full" />
              Español
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className={cn("gap-2", language === "en" ? "bg-[#121A56]" : "")}
            >
              <USAFlag className="h-5 w-5 rounded-full" />
              English
            </Button>
          </div>

          <div className="pt-4 space-y-2 border-t border-border">
            <Link href="/login" className="block" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full bg-transparent">
                {t("login")}
              </Button>
            </Link>
            <Link href="/registro" className="block" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-[#121A56] hover:bg-[#121A56]/90 text-white">{t("createAccount")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
