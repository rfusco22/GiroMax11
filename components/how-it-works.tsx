"use client"

import { useRef, useEffect, useState } from "react"
import { UserPlus, Calculator, Send, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    titleKey: "step1Title" as const,
    descKey: "step1Desc" as const,
    color: "#121A56",
  },
  {
    icon: Calculator,
    step: "02",
    titleKey: "step2Title" as const,
    descKey: "step2Desc" as const,
    color: "#F5A017",
  },
  {
    icon: Send,
    step: "03",
    titleKey: "step3Title" as const,
    descKey: "step3Desc" as const,
    color: "#DB530F",
  },
  {
    icon: CheckCircle,
    step: "04",
    titleKey: "step4Title" as const,
    descKey: "step4Desc" as const,
    color: "#121A56",
  },
]

export function HowItWorksSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const section = sectionRef.current
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionHeight = rect.height
      const windowHeight = window.innerHeight

      // La sección sticky comienza cuando el top de la sección llega al top del viewport
      const scrolledIntoSection = -sectionTop
      const scrollableDistance = sectionHeight - windowHeight

      if (scrolledIntoSection < 0) {
        // Aún no entramos a la sección
        setActiveStep(0)
        setIsComplete(false)
        return
      }

      if (scrolledIntoSection >= scrollableDistance) {
        // Ya pasamos toda la sección, mostrar el último paso
        setActiveStep(steps.length - 1)
        setIsComplete(true)
        return
      }

      // Estamos dentro de la sección, calcular el paso activo
      const progress = scrolledIntoSection / scrollableDistance
      const stepIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1)
      setActiveStep(stepIndex)
      setIsComplete(false)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-background via-secondary/20 to-background"
      style={{ height: `${100 + steps.length * 50}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">{t("howItWorks")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">{t("howItWorksSubtitle")}</p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-8 md:mb-12">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  index === activeStep ? "w-8 bg-[#F5A017]" : index < activeStep ? "w-2 bg-[#121A56]" : "w-2 bg-border",
                )}
              />
            ))}
          </div>

          {/* Horizontal scroll container */}
          <div className="relative h-[400px] md:h-[480px]">
            {/* Cards container */}
            <div
              className="absolute inset-0 flex items-center transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(calc(50% - ${activeStep * 320}px - 160px))`,
              }}
            >
              {steps.map((item, index) => {
                const isActive = index === activeStep
                const isPast = index < activeStep
                const isFuture = index > activeStep

                return (
                  <div
                    key={item.step}
                    className={cn(
                      "flex-shrink-0 w-[280px] md:w-[320px] mx-3 md:mx-4 transition-all duration-700",
                      isActive && "scale-105 md:scale-110 z-10",
                      isPast && "scale-90 opacity-40 -translate-y-4",
                      isFuture && "scale-90 opacity-40 translate-y-4",
                    )}
                  >
                    <div
                      className={cn(
                        "bg-card rounded-3xl p-5 md:p-6 shadow-2xl border transition-all duration-500",
                        isActive ? "border-[#F5A017] shadow-[#F5A017]/20" : "border-border",
                      )}
                    >
                      {/* Phone mockup frame */}
                      <div className="relative bg-[#121A56] rounded-[2rem] p-2.5 md:p-3 mb-4 md:mb-6">
                        {/* Notch */}
                        <div className="absolute top-2.5 md:top-3 left-1/2 -translate-x-1/2 w-16 md:w-20 h-5 md:h-6 bg-black rounded-full" />

                        {/* Screen */}
                        <div className="bg-gradient-to-br from-white to-gray-100 rounded-[1.25rem] md:rounded-[1.5rem] aspect-[9/16] flex items-center justify-center overflow-hidden">
                          <div className="text-center p-4">
                            <div
                              className="w-12 md:w-16 h-12 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4"
                              style={{ backgroundColor: `${item.color}20` }}
                            >
                              <item.icon className="h-6 md:h-8 w-6 md:w-8" style={{ color: item.color }} />
                            </div>
                            <span className="text-3xl md:text-4xl font-bold" style={{ color: item.color }}>
                              {item.step}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation dots - clickable */}
          <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-8">
            {steps.map((item, index) => (
              <button
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  index === activeStep
                    ? "bg-[#F5A017] text-white scale-110"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80",
                )}
              >
                <item.icon className="h-4 md:h-5 w-4 md:w-5" />
              </button>
            ))}
          </div>

          {!isComplete && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
              <span className="text-xs text-muted-foreground">Scroll</span>
              <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-1.5">
                <div className="w-1 h-2.5 bg-[#F5A017] rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
