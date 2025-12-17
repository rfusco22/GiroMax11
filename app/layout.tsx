import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { LanguageProvider } from "@/components/language-provider"
import { PageLoader } from "@/components/page-loader"
import "./globals.css"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Giros Max - Casa de Cambio en Tiempo Real",
  description:
    "Envía y recibe dinero a Ecuador, Chile, Estados Unidos, Perú, Colombia, Panamá y Venezuela. Tasas en tiempo real, sin comisiones ocultas.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["casa de cambio", "giros", "remesas", "USD", "transferencias", "envío de dinero", "Giros Max"],
  authors: [{ name: "Giros Max" }],
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Giros Max",
  },
  openGraph: {
    type: "website",
    title: "Giros Max - Casa de Cambio en Tiempo Real",
    description: "Envía dinero al mejor tipo de cambio. Sin comisiones ocultas.",
    siteName: "Giros Max",
  },
}

export const viewport: Viewport = {
  themeColor: "#121A56",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}>
        <LanguageProvider>
          <PageLoader />
          {children}
          <PWAInstallPrompt />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
