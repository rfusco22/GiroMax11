"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MessageCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
]

export function Footer() {
  const { language, t } = useLanguage()

  const footerLinks = {
    servicios: [
      { label: language === "es" ? "Criptomoneda" : "Cryptocurrency", href: "/crypto" },
      { label: language === "es" ? "Divisas" : "Currencies", href: "/cambio" },
      { label: language === "es" ? "Giros entre países" : "International Transfers", href: "/envios" },
    ],
    paises: [
      { label: "Ecuador", href: "/paises/ecuador" },
      { label: "Chile", href: "/paises/chile" },
      { label: "Colombia", href: "/paises/colombia" },
      { label: language === "es" ? "Perú" : "Peru", href: "/paises/peru" },
      { label: language === "es" ? "Panamá" : "Panama", href: "/paises/panama" },
      { label: "Venezuela", href: "/paises/venezuela" },
      { label: language === "es" ? "Estados Unidos" : "United States", href: "/paises/usa" },
    ],
    soporte: [
      { label: language === "es" ? "Centro de Ayuda" : "Help Center", href: "/ayuda" },
      { label: language === "es" ? "Contacto" : "Contact", href: "/contacto" },
      { label: "FAQ", href: "/faq" },
    ],
    legal: [
      { label: t("terms"), href: "/terminos" },
      { label: t("privacy"), href: "/privacidad" },
      { label: "Cookies", href: "/cookies" },
    ],
  }

  return (
    <footer className="bg-[#121A56] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#121A56] font-bold text-lg">G</span>
              </div>
              <span className="font-bold text-xl text-[#F5A017]">GIROS MAX</span>
            </Link>
            <p className="text-sm text-white/70 mb-6 max-w-xs">{t("footerDesc")}</p>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>soporte@girosmax.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (800) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-[#F5A017] mb-4">{t("services")}</h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#F5A017] mb-4">{language === "es" ? "Países" : "Countries"}</h4>
            <ul className="space-y-2">
              {footerLinks.paises.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#F5A017] mb-4">{t("help")}</h4>
            <ul className="space-y-2">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#F5A017] mb-4">{t("legal")}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Giros Max. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#F5A017] transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
