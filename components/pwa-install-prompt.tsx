"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    if (isIOSDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString())
  }

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (dismissed) {
      const dismissedTime = Number.parseInt(dismissed)
      const weekInMs = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < weekInMs) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-0 shadow-2xl bg-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#121A56]/10">
              <Smartphone className="h-6 w-6 text-[#121A56]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Instalar Giros Max</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isIOS
                      ? 'Toca el botón compartir y selecciona "Agregar a inicio"'
                      : "Instala nuestra app para una mejor experiencia"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {!isIOS && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-[#F5A017] hover:bg-[#DB530F] text-white" onClick={handleInstall}>
                    <Download className="h-4 w-4 mr-2" />
                    Instalar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    Ahora no
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
