"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SeguridadTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Seguridad</h2>
        <p className="text-sm text-white/60 mt-1">Administra tu contraseña y configuración de seguridad</p>
      </div>

      <div className="bg-[#1E2541] rounded-xl p-6 space-y-4">
        <div>
          <Label htmlFor="currentPassword" className="text-white/80 text-sm">
            Contraseña Actual
          </Label>
          <Input
            id="currentPassword"
            type="password"
            className="bg-[#2A3254] border-white/10 text-white mt-1"
            placeholder="Ingresa tu contraseña actual"
          />
        </div>
        <div>
          <Label htmlFor="newPassword" className="text-white/80 text-sm">
            Nueva Contraseña
          </Label>
          <Input
            id="newPassword"
            type="password"
            className="bg-[#2A3254] border-white/10 text-white mt-1"
            placeholder="Ingresa tu nueva contraseña"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-white/80 text-sm">
            Confirmar Nueva Contraseña
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            className="bg-[#2A3254] border-white/10 text-white mt-1"
            placeholder="Confirma tu nueva contraseña"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button className="bg-[#F5A017] hover:bg-[#F5A017]/90 text-white">Actualizar Contraseña</Button>
        </div>
      </div>
    </div>
  )
}
