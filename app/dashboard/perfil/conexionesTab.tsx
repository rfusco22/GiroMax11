"use client"

import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"

export default function ConexionesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Conexiones</h2>
        <p className="text-sm text-white/60 mt-1">Administra tus cuentas conectadas y servicios de terceros</p>
      </div>

      <div className="bg-[#1E2541] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#2A3254] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-[#F5A017]" />
            </div>
            <div>
              <h4 className="text-white font-medium">Google</h4>
              <p className="text-sm text-white/60">Conectar con Google para inicio de sesión rápido</p>
            </div>
          </div>
          <Button variant="outline" className="border-white/10 text-white bg-transparent">
            Conectar
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#2A3254] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-[#F5A017]" />
            </div>
            <div>
              <h4 className="text-white font-medium">WhatsApp</h4>
              <p className="text-sm text-white/60">Recibe notificaciones por WhatsApp</p>
            </div>
          </div>
          <Button variant="outline" className="border-white/10 text-white bg-transparent">
            Conectar
          </Button>
        </div>
      </div>
    </div>
  )
}
