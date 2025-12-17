"use client"

import { Shield, Zap, Clock, Headphones, Globe, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"

export function FeaturesSection() {
  const { t, language } = useLanguage()

  const features = [
    {
      icon: Zap,
      title: language === "es" ? "Transferencias Instantáneas" : "Instant Transfers",
      description:
        language === "es"
          ? "Envía dinero en segundos con confirmación en tiempo real a 7 países de América."
          : "Send money in seconds with real-time confirmation to 7 countries in America.",
    },
    {
      icon: Shield,
      title: language === "es" ? "100% Seguro" : "100% Secure",
      description:
        language === "es"
          ? "Protección bancaria de nivel empresarial. Tus datos y dinero siempre protegidos."
          : "Enterprise-level bank protection. Your data and money always protected.",
    },
    {
      icon: Clock,
      title: language === "es" ? "Disponible 24/7" : "Available 24/7",
      description:
        language === "es"
          ? "Opera cuando quieras, donde quieras. Sin horarios restrictivos ni días festivos."
          : "Operate whenever you want, wherever you want. No restrictive hours or holidays.",
    },
    {
      icon: Headphones,
      title: language === "es" ? "Soporte Personalizado" : "Personalized Support",
      description:
        language === "es"
          ? "Equipo de atención al cliente disponible por chat, WhatsApp y correo electrónico."
          : "Customer service team available by chat, WhatsApp and email.",
    },
    {
      icon: Globe,
      title: language === "es" ? "7 Países" : "7 Countries",
      description:
        language === "es"
          ? "Ecuador, Chile, Colombia, Perú, Panamá, Venezuela y Estados Unidos."
          : "Ecuador, Chile, Colombia, Peru, Panama, Venezuela and United States.",
    },
    {
      icon: Wallet,
      title: language === "es" ? "Sin Comisiones Ocultas" : "No Hidden Fees",
      description:
        language === "es"
          ? "El tipo de cambio que ves es el que obtienes. Transparencia total en cada operación."
          : "The exchange rate you see is what you get. Total transparency in every operation.",
    },
  ]

  return (
    <section className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {t("featuresTitle").replace("Giros Max", "")}
            <span className="text-[#DB530F]">Giros Max</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">{t("featuresSubtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-[#121A56]/10 flex items-center justify-center mb-4 group-hover:bg-[#F5A017]/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-[#121A56] group-hover:text-[#DB530F] transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
