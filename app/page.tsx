"use client"

import { Navbar } from "@/components/navbar"
import { LiveRatesTicker } from "@/components/live-rates-ticker"
import { CurrencyConverter } from "@/components/currency-converter"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorksSection } from "@/components/how-it-works"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { CountriesSection } from "@/components/countries-section"
import { ArrowRight, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#121A56]/5 via-transparent to-[#F5A017]/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5A017]/10 text-[#DB530F] text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A017] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A017]"></span>
                </span>
                {t("liveRates")}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                {t("heroTitle")} <span className="text-[#DB530F]">{t("heroSubtitle")}</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl text-pretty">{t("heroDescription")}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/registro">
                  <Button size="lg" className="h-14 px-8 text-lg bg-[#121A56] hover:bg-[#121A56]/90 text-white">
                    {t("startNow")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/tasas">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-[#F5A017] text-[#DB530F] hover:bg-[#F5A017]/10 bg-transparent"
                  >
                    {t("seeRates")}
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#F5A017]" />
                  <span className="text-sm text-muted-foreground">Certificado SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#F5A017] text-[#F5A017]" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.9 en App Store</span>
                </div>
              </div>
            </div>

            {/* Right - Converter */}
            <div className="flex justify-center lg:justify-end">
              <CurrencyConverter />
            </div>
          </div>
        </div>
      </section>

      <LiveRatesTicker />
      <CountriesSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}
