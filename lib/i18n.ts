export type Language = "es" | "en"

export const translations = {
  es: {
    // Navbar
    services: "Servicios",
    liveRates: "Tasas en Vivo",
    help: "Ayuda",
    login: "Iniciar Sesión",
    createAccount: "Crear Cuenta",

    // Services dropdown
    cryptocurrency: "Criptomoneda",
    cryptocurrencyDesc: "Compra, vende e intercambia Bitcoin, Ethereum y más criptos al mejor precio",
    currencies: "Divisas",
    currenciesDesc: "Cambia entre monedas de 7 países con las mejores tasas del mercado",
    transfers: "Giros entre países",
    transfersDesc: "Envía dinero a tus seres queridos de forma rápida y segura",

    // Hero
    heroTitle: "Envía dinero a",
    heroSubtitle: "toda Latinoamérica",
    heroDescription:
      "Transferencias internacionales rápidas, seguras y con las mejores tasas de cambio. Sin comisiones ocultas.",
    startNow: "Comenzar ahora",
    seeRates: "Ver tasas",

    // How it works
    howItWorks: "Cómo funciona",
    howItWorksSubtitle: "Enviar dinero nunca fue tan fácil. En 4 simples pasos estarás listo.",
    step1Title: "Crea tu cuenta",
    step1Desc: "Regístrate en minutos con tu email. Verificación rápida y segura.",
    step2Title: "Calcula tu envío",
    step2Desc: "Ingresa el monto y selecciona el país destino. Ve el tipo de cambio en tiempo real.",
    step3Title: "Realiza el envío",
    step3Desc: "Confirma y envía. Procesamos tu solicitud de forma inmediata.",
    step4Title: "Recibe confirmación",
    step4Desc: "Obtén tu comprobante y rastrea el estado de tu transferencia.",

    // Stats
    activeUsers: "Usuarios activos",
    processedMonthly: "Procesados mensualmente",
    countriesAvailable: "Países disponibles",
    customerSatisfaction: "Satisfacción del cliente",

    // Features
    featuresTitle: "¿Por qué elegir Giros Max?",
    featuresSubtitle: "La forma más inteligente de mover tu dinero entre países",
    feature1Title: "Tasas en Tiempo Real",
    feature1Desc: "Accede a las mejores tasas de cambio actualizadas cada segundo directamente de los mercados.",
    feature2Title: "Transferencias Rápidas",
    feature2Desc: "Tu dinero llega en minutos, no en días. Procesamiento instantáneo garantizado.",
    feature3Title: "Seguridad Bancaria",
    feature3Desc: "Encriptación de nivel bancario y cumplimiento regulatorio en todos los países.",
    feature4Title: "Sin Comisiones Ocultas",
    feature4Desc: "Lo que ves es lo que pagas. Transparencia total en cada transacción.",

    // CTA
    ctaTitle: "¿Listo para enviar dinero?",
    ctaSubtitle: "Únete a miles de usuarios que ya confían en Giros Max para sus transferencias internacionales.",
    ctaButton: "Crear cuenta gratis",

    // Footer
    footerTagline: "Tu dinero, sin fronteras.",
    footerDesc: "Transferencias internacionales rápidas, seguras y con las mejores tasas.",
    quickLinks: "Enlaces rápidos",
    legal: "Legal",
    terms: "Términos y condiciones",
    privacy: "Política de privacidad",
    contact: "Contacto",
    allRightsReserved: "Todos los derechos reservados.",

    // Converter
    youSend: "Tú envías",
    theyReceive: "Ellos reciben",
    exchangeRate: "Tasa de cambio",
    fee: "Comisión",
    total: "Total a pagar",
    continue: "Continuar",

    // Countries section
    countriesTitle: "Envía a toda Latinoamérica",
    countriesSubtitle: "Cobertura en los principales países de la región",
  },
  en: {
    // Navbar
    services: "Services",
    liveRates: "Live Rates",
    help: "Help",
    login: "Sign In",
    createAccount: "Create Account",

    // Services dropdown
    cryptocurrency: "Cryptocurrency",
    cryptocurrencyDesc: "Buy, sell and exchange Bitcoin, Ethereum and more cryptos at the best price",
    currencies: "Currencies",
    currenciesDesc: "Exchange between currencies from 7 countries with the best market rates",
    transfers: "International Transfers",
    transfersDesc: "Send money to your loved ones quickly and safely",

    // Hero
    heroTitle: "Send money to",
    heroSubtitle: "all of Latin America",
    heroDescription: "Fast, secure international transfers with the best exchange rates. No hidden fees.",
    startNow: "Start now",
    seeRates: "See rates",

    // How it works
    howItWorks: "How it works",
    howItWorksSubtitle: "Sending money has never been easier. In 4 simple steps you'll be ready.",
    step1Title: "Create your account",
    step1Desc: "Sign up in minutes with your email. Quick and secure verification.",
    step2Title: "Calculate your transfer",
    step2Desc: "Enter the amount and select the destination country. See the exchange rate in real time.",
    step3Title: "Make the transfer",
    step3Desc: "Confirm and send. We process your request immediately.",
    step4Title: "Receive confirmation",
    step4Desc: "Get your receipt and track the status of your transfer.",

    // Stats
    activeUsers: "Active users",
    processedMonthly: "Processed monthly",
    countriesAvailable: "Countries available",
    customerSatisfaction: "Customer satisfaction",

    // Features
    featuresTitle: "Why choose Giros Max?",
    featuresSubtitle: "The smartest way to move your money between countries",
    feature1Title: "Real-Time Rates",
    feature1Desc: "Access the best exchange rates updated every second directly from the markets.",
    feature2Title: "Fast Transfers",
    feature2Desc: "Your money arrives in minutes, not days. Instant processing guaranteed.",
    feature3Title: "Bank-Level Security",
    feature3Desc: "Bank-level encryption and regulatory compliance in all countries.",
    feature4Title: "No Hidden Fees",
    feature4Desc: "What you see is what you pay. Total transparency in every transaction.",

    // CTA
    ctaTitle: "Ready to send money?",
    ctaSubtitle: "Join thousands of users who already trust Giros Max for their international transfers.",
    ctaButton: "Create free account",

    // Footer
    footerTagline: "Your money, without borders.",
    footerDesc: "Fast, secure international transfers with the best rates.",
    quickLinks: "Quick Links",
    legal: "Legal",
    terms: "Terms and conditions",
    privacy: "Privacy policy",
    contact: "Contact",
    allRightsReserved: "All rights reserved.",

    // Converter
    youSend: "You send",
    theyReceive: "They receive",
    exchangeRate: "Exchange rate",
    fee: "Fee",
    total: "Total to pay",
    continue: "Continue",

    // Countries section
    countriesTitle: "Send to all of Latin America",
    countriesSubtitle: "Coverage in the main countries of the region",
  },
}

export function getTranslation(lang: Language, key: keyof typeof translations.es): string {
  return translations[lang][key] || translations.es[key]
}
