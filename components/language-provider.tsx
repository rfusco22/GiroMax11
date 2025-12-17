"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, translations } from "@/lib/i18n"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations.es) => string
}

const defaultContextValue: LanguageContextType = {
  language: "es",
  setLanguage: () => {},
  t: (key: keyof typeof translations.es): string => translations.es[key],
}

const LanguageContext = createContext<LanguageContextType>(defaultContextValue)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("girosmax-lang") as Language
    if (savedLang && (savedLang === "es" || savedLang === "en")) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("girosmax-lang", lang)
  }

  const t = (key: keyof typeof translations.es): string => {
    return translations[language][key] || translations.es[key]
  }

  const value: LanguageContextType = mounted ? { language, setLanguage, t } : defaultContextValue

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  return context
}
