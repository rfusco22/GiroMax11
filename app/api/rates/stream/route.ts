import { getExchangeRate } from "@/lib/exchange-rates"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pairs = searchParams.get("pairs")?.split(",") || ["USD-MXN", "USD-COP", "EUR-USD"]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendRates = () => {
        const rates = pairs.map((pair) => {
          const [from, to] = pair.split("-")
          return getExchangeRate(from, to)
        })

        const data = `data: ${JSON.stringify({ rates, timestamp: new Date().toISOString() })}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      // Enviar tasas iniciales
      sendRates()

      // Actualizar cada 3 segundos
      const interval = setInterval(() => {
        try {
          sendRates()
        } catch (e) {
          clearInterval(interval)
          controller.close()
        }
      }, 3000)

      // Limpiar después de 5 minutos
      setTimeout(
        () => {
          clearInterval(interval)
          controller.close()
        },
        5 * 60 * 1000,
      )
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
