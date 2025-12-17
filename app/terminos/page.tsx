import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GirosMaxLogo } from "@/components/giros-max-logo"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="mb-8">
          <GirosMaxLogo size="md" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Términos de Servicio</h1>
        <p className="text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Aceptación de Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y utilizar los servicios de Giros Max, usted acepta estar sujeto a estos Términos de Servicio y
              todas las leyes y regulaciones aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Servicios Ofrecidos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Giros Max proporciona servicios de transferencias internacionales de dinero. Nos reservamos el derecho de
              modificar o discontinuar servicios en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Registro de Cuenta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa.
              Usted es responsable de mantener la confidencialidad de su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Uso Aceptable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usted acepta no utilizar nuestros servicios para actividades ilegales, incluyendo pero no limitado a
              lavado de dinero, financiamiento del terrorismo o fraude.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Tarifas y Cargos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las tarifas de transferencia se muestran antes de completar cada transacción. Nos reservamos el derecho de
              cambiar nuestras tarifas en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Giros Max no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten
              del uso o la imposibilidad de usar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para preguntas sobre estos términos, contáctenos en soporte@girosmax.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
