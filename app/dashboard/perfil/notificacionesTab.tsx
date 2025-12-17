"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function NotificacionesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Notificaciones</h2>
        <p className="text-sm text-white/60 mt-1">Configura cómo y cuándo quieres recibir notificaciones</p>
      </div>

      <div className="bg-[#1E2541] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white text-base">Notificaciones por Email</Label>
            <p className="text-sm text-white/60">Recibe notificaciones de transacciones por correo electrónico</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white text-base">Notificaciones SMS</Label>
            <p className="text-sm text-white/60">Recibe alertas de seguridad por mensaje de texto</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white text-base">Actualizaciones de Tasa</Label>
            <p className="text-sm text-white/60">Notificaciones cuando la tasa de cambio se actualice</p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white text-base">Alertas de Verificación</Label>
            <p className="text-sm text-white/60">Recibe actualizaciones sobre el estado de tu verificación KYC</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  )
}
