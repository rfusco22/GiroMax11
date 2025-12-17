import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GirosMaxLogo } from "@/components/giros-max-logo"

export default function PrivacidadPage() {
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

        <h1 className="text-4xl font-bold mb-4">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Información que Recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recopilamos información personal como nombre, dirección de correo electrónico, número de teléfono,
              información de identificación y datos de transacciones cuando utiliza nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Cómo Usamos su Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos su información para procesar transacciones, verificar su identidad, prevenir fraudes, cumplir
              con requisitos legales y mejorar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Compartir Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos compartir su información con proveedores de servicios, instituciones financieras y autoridades
              reguladoras según sea necesario para procesar sus transacciones y cumplir con la ley.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Seguridad de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra
              acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Sus Derechos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usted tiene derecho a acceder, corregir, eliminar o limitar el uso de su información personal. También
              puede oponerse al procesamiento de sus datos en ciertas circunstancias.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso del sitio y
              personalizar el contenido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Cambios a esta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar esta política de privacidad periódicamente. Le notificaremos sobre cambios
              significativos publicando la nueva política en nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para preguntas sobre esta política de privacidad o el manejo de sus datos, contáctenos en
              privacidad@girosmax.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
