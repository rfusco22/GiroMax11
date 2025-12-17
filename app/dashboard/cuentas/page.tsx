"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface BankAccount {
  id: number
  banco: string
  titular: string
  cuenta: string
  email: string
  dueno: string
}

// Mock data
const mockAccounts: BankAccount[] = []

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>(mockAccounts)
  const [search, setSearch] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredAccounts = accounts.filter((account) =>
    Object.values(account).some((value) => value.toString().toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuentas</h1>
          <p className="text-muted-foreground">Gestiona tus cuentas bancarias</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">CREAR</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>+ AÑADIR</DialogTitle>
              <DialogDescription>Agrega una nueva cuenta bancaria</DialogDescription>
            </DialogHeader>
            <AddAccountForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#2A3254] border-0 text-white placeholder:text-white/40"
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm bg-[#2A3254] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    ID
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">BANCO</TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    TITULAR
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    CUENTA
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    E-MAIL
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    DUEÑO
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-white/60">
                    Sin datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{account.id}</TableCell>
                    <TableCell className="text-white">{account.banco}</TableCell>
                    <TableCell className="text-white">{account.titular}</TableCell>
                    <TableCell className="text-white">{account.cuenta}</TableCell>
                    <TableCell className="text-white">{account.email}</TableCell>
                    <TableCell className="text-white">{account.dueno}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" disabled className="text-white/40">
          PREVIOUS
        </Button>
        <Button variant="ghost" size="sm" className="bg-cyan-500 text-white hover:bg-cyan-600 min-w-[40px]">
          1
        </Button>
        <Button variant="ghost" size="sm" disabled className="text-white/40">
          NEXT
        </Button>
      </div>
    </div>
  )
}

function AddAccountForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="banco">Banco</Label>
        <Input id="banco" className="bg-secondary/50 border-0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="titular">Titular</Label>
        <Input id="titular" className="bg-secondary/50 border-0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cuenta">Número de Cuenta</Label>
        <Input id="cuenta" className="bg-secondary/50 border-0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" className="bg-secondary/50 border-0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueno">Dueño</Label>
        <Input id="dueno" className="bg-secondary/50 border-0" />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          Guardar
        </Button>
      </div>
    </form>
  )
}
