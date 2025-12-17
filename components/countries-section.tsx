"use client"

import { Card, CardContent } from "@/components/ui/card"
import { countries } from "@/lib/currencies"
import { useLanguage } from "@/components/language-provider"

export function CountriesSection() {
  const { t, language } = useLanguage()

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === "es" ? "Países donde " : "Countries where we "}
            <span className="text-[#DB530F]">{language === "es" ? "operamos" : "operate"}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("countriesSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {countries.map((country) => (
            <Card
              key={country.code}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card"
            >
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{country.flag}</div>
                <h3 className="font-semibold text-foreground text-sm">{country.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{country.currency}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
