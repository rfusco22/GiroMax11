export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  country: string
}

export const currencies: Currency[] = [
  { code: "USD", name: "Dólar Estadounidense", symbol: "$", flag: "🇺🇸", country: "Estados Unidos" },
  { code: "COP", name: "Peso Colombiano", symbol: "$", flag: "🇨🇴", country: "Colombia" },
  { code: "PEN", name: "Sol Peruano", symbol: "S/", flag: "🇵🇪", country: "Perú" },
  { code: "CLP", name: "Peso Chileno", symbol: "$", flag: "🇨🇱", country: "Chile" },
  { code: "VES", name: "Bolívar Venezolano", symbol: "Bs.", flag: "🇻🇪", country: "Venezuela" },
  { code: "PAB", name: "Balboa Panameño", symbol: "B/.", flag: "🇵🇦", country: "Panamá" },
  { code: "EUR", name: "Euro (Ecuador)", symbol: "$", flag: "🇪🇨", country: "Ecuador" }, // Ecuador usa USD
]

// Países disponibles para envío/recepción
export const countries = [
  { code: "US", name: "Estados Unidos", currency: "USD", flag: "🇺🇸" },
  { code: "EC", name: "Ecuador", currency: "USD", flag: "🇪🇨" }, // Ecuador usa USD
  { code: "CL", name: "Chile", currency: "CLP", flag: "🇨🇱" },
  { code: "PE", name: "Perú", currency: "PEN", flag: "🇵🇪" },
  { code: "CO", name: "Colombia", currency: "COP", flag: "🇨🇴" },
  { code: "PA", name: "Panamá", currency: "PAB", flag: "🇵🇦" }, // PAB está atado 1:1 al USD
  { code: "VE", name: "Venezuela", currency: "VES", flag: "🇻🇪" },
]

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencies.find((c) => c.code === code)
}

export const getCountryByCurrency = (currencyCode: string) => {
  return countries.find((c) => c.currency === currencyCode)
}

export const formatCurrency = (amount: number, currencyCode: string): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currencyCode === "EUR" ? "USD" : currencyCode, // Ecuador usa USD
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
