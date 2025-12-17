"use client"

import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="py-20 bg-[#121A56]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-balance">{t("ctaTitle")}</h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto text-pretty">{t("ctaSubtitle")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/registro">
            <Button size="lg" className="bg-[#F5A017] text-white hover:bg-[#DB530F] h-14 px-8 text-lg">
              {t("ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg bg-transparent"
          >
            <Play className="mr-2 h-5 w-5" />
            {t("howItWorks")}
          </Button>
        </div>
      </div>
    </section>
  )
}
