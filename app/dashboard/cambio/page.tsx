import { CurrencyConverter } from "@/components/currency-converter"
import { LiveRatesWidget } from "@/components/dashboard/live-rates-widget"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Shield, Clock, Percent } from "lucide-react"

export default function CambioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cambiar Divisas</h1>
        <p className="text-muted-foreground">Realiza cambios de moneda al mejor tipo de cambio</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main converter */}
          <div className="flex justify-center">
            <CurrencyConverter />
          </div>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Percent className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Sin comisiones</p>
                  <p className="text-sm text-muted-foreground">0% en todas las operaciones</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Instantáneo</p>
                  <p className="text-sm text-muted-foreground">Cambios en segundos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <Shield className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Seguro</p>
                  <p className="text-sm text-muted-foreground">Encriptación bancaria</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert */}
          <Card className="border-0 shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Información importante</p>
                <p className="text-sm text-muted-foreground">
                  Las tasas de cambio se actualizan cada 5 segundos. El tipo de cambio final se confirma al momento de
                  procesar la operación. Los cambios mayores a $10,000 USD pueden requerir verificación adicional.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <LiveRatesWidget />
        </div>
      </div>
    </div>
  )
}
