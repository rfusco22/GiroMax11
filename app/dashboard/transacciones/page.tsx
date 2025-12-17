"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: string
  fecha: string
  estado: string
  estadoGateway: string
  enviado: string
  recibido: string
  tasa: string
  destino: string
}

const mockTransactions: Transaction[] = []

export default function TransaccionesPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transacciones</h1>
        <p className="text-muted-foreground">Historial de todas tus transacciones</p>
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
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    FECHA
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    ESTADO
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">ESTADO GATEWAY</TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    ENVIADO
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">
                  <div className="flex items-center gap-2">
                    RECIBIDO
                    <div className="flex flex-col">
                      <span className="text-xs">↑</span>
                      <span className="text-xs -mt-2">↓</span>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-white/80">TASA</TableHead>
                <TableHead className="text-white/80">DESTINO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-white/60">
                    Sin datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                mockTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">{transaction.id}</TableCell>
                    <TableCell className="text-white">{transaction.fecha}</TableCell>
                    <TableCell className="text-white">{transaction.estado}</TableCell>
                    <TableCell className="text-white">{transaction.estadoGateway}</TableCell>
                    <TableCell className="text-white">{transaction.enviado}</TableCell>
                    <TableCell className="text-white">{transaction.recibido}</TableCell>
                    <TableCell className="text-white">{transaction.tasa}</TableCell>
                    <TableCell className="text-white">{transaction.destino}</TableCell>
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
