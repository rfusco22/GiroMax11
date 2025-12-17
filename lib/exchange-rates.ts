export interface ExchangeRate {
  from: string
  to: string
  rate: number
  officialRate: number // Tasa oficial sin margen
  margin: number // Porcentaje de margen aplicado
  timestamp: Date
  change24h: number
}

export interface CurrencyMargin {
  currency: string
  marginPercent: number // Porcentaje de ganancia
  lastUpdated: Date
  updatedBy: string
}

// Márgenes por defecto (en producción vendrían de la base de datos)
const currencyMargins: Record<string, number> = {
  USD: 0.5, // 0.5% de margen para USD
  COP: 1.2, // 1.2% para Peso Colombiano
  PEN: 1.0, // 1.0% para Sol Peruano
  CLP: 0.8, // 0.8% para Peso Chileno
  VES: 2.5, // 2.5% para Bolívar (mayor volatilidad)
  PAB: 0.3, // 0.3% para Balboa (atado al USD)
  EUR: 0.5, // 0.5% para Ecuador (usa USD)
}

// Tasas base oficiales (en producción conectar con API de banco central)
const officialRates: Record<string, number> = {
  USD: 1,
  COP: 4150, // Peso colombiano por USD
  PEN: 3.72, // Sol peruano por USD
  CLP: 925, // Peso chileno por USD
  VES: 36.5, // Bolívar por USD
  PAB: 1, // Balboa está 1:1 con USD
  EUR: 1, // Ecuador usa USD (1:1)
}

// Obtener margen actual para una moneda
export const getMargin = (currency: string): number => {
  return currencyMargins[currency] || 1.0
}

// Actualizar margen (para uso del admin)
export const updateMargin = (currency: string, newMargin: number): void => {
  currencyMargins[currency] = newMargin
}

// Obtener todos los márgenes
export const getAllMargins = (): Record<string, number> => {
  return { ...currencyMargins }
}

// Simular variación en tiempo real
const getRandomVariation = () => (Math.random() - 0.5) * 0.001

export const getExchangeRate = (from: string, to: string): ExchangeRate => {
  const fromRate = officialRates[from] || 1
  const toRate = officialRates[to] || 1

  // Tasa oficial
  const officialRate = toRate / fromRate

  // Aplicar margen de la moneda destino
  const margin = getMargin(to)
  const marginMultiplier = 1 + margin / 100

  // Aplicar pequeña variación para simular tiempo real
  const variation = 1 + getRandomVariation()
  const rate = officialRate * marginMultiplier * variation

  return {
    from,
    to,
    rate,
    officialRate,
    margin,
    timestamp: new Date(),
    change24h: (Math.random() - 0.5) * 2,
  }
}

export const calculateExchange = (amount: number, from: string, to: string): number => {
  const { rate } = getExchangeRate(from, to)
  return amount * rate
}

export const getAllRatesForCurrency = (baseCurrency: string): ExchangeRate[] => {
  return Object.keys(officialRates)
    .filter((code) => code !== baseCurrency)
    .map((code) => getExchangeRate(baseCurrency, code))
}
