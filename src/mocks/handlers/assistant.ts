import { delay } from '../delay'
import { ApiError, NetworkError } from '../../api/errors'
import { exchangeRates } from '../data/exchangeRates'
import type { ExchangeRate } from '../data/exchangeRates'

const CURRENCY_ALIASES: { codes: string[]; label: string }[] = [
  { codes: ['dolar', 'dólar', 'dolares', 'dólares', 'usd'], label: 'USD' },
  { codes: ['euro', 'euros', 'eur'], label: 'EUR' },
  { codes: ['peso', 'pesos', 'ars'], label: 'ARS' },
]

// En modo mock se pueden probar los errores escribiendo "error 400",
// "error 500", "error 502", etc. en el chat.
const SIMULATED_ERRORS: { pattern: RegExp; factory: () => Error }[] = [
  { pattern: /(^|\s)(error|simular error|probar el error)\s+(red|conexion|conexión)\b/, factory: () => new NetworkError() },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+400\b/, factory: () => new ApiError(400) },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+401\b/, factory: () => new ApiError(401) },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+429\b/, factory: () => new ApiError(429) },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+500\b/, factory: () => new ApiError(500) },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+502\b/, factory: () => new ApiError(502) },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+503\b/, factory: () => new ApiError(503) },
  { pattern: /(^|\s)(error|simular error|probar el error)\s+504\b/, factory: () => new ApiError(504) },
]

function findCurrency(text: string): ExchangeRate | undefined {
  const normalized = text.toLowerCase()
  for (const alias of CURRENCY_ALIASES) {
    if (alias.codes.some((c) => normalized.includes(c))) {
      return exchangeRates.find((r) => r.currency_code === alias.label)
    }
  }
  return undefined
}

function formatPrice(value: number): string {
  return `${value.toLocaleString('es-AR')} ARS`
}

function percentChange(today: number, yesterday: number): number {
  if (!yesterday) return 0
  return ((today - yesterday) / yesterday) * 100
}

function direction(change: number): string {
  if (change > 0) return 'subió'
  if (change < 0) return 'bajó'
  return 'se mantuvo'
}

function buildRateReply(rate: ExchangeRate): string {
  const buyChange = percentChange(rate.buy_price, rate.prev_buy_price)
  const sellChange = percentChange(rate.sell_price, rate.prev_sell_price)

  let comparison: string
  if (buyChange !== 0 || sellChange !== 0) {
    const parts: string[] = []
    if (buyChange !== 0) parts.push(`un ${Math.abs(buyChange).toFixed(2)}% en la compra`)
    if (sellChange !== 0) parts.push(`un ${Math.abs(sellChange).toFixed(2)}% en la venta`)
    comparison = `En comparación con ayer, el tipo de cambio ${direction(buyChange || sellChange)} ${parts.join(' y ')}.`
  } else {
    comparison = 'En comparación con ayer, se mantuvo sin cambios.'
  }

  return (
    `La cotización actual del ${rate.currency_name} (${rate.currency_code}) es: ` +
    `Compra ${formatPrice(rate.buy_price)} · Venta ${formatPrice(rate.sell_price)}. ` +
    comparison
  )
}

export async function ask(message: string): Promise<string> {
  await delay(600)

  const normalized = message.toLowerCase().trim()

  const simulated = SIMULATED_ERRORS.find(({ pattern }) => pattern.test(normalized))
  if (simulated) throw simulated.factory()

  if (/^(hola|buenas|buenos dias|buenos días|buenas tardes|buenas noches)\b/.test(normalized)) {
    return '¡Hola! Soy tu asistente de Globalance. Pregúntame por la cotización del dólar, el euro o el peso argentino.'
  }

  if (normalized.includes('gracias')) {
    return '¡De nada! Cuando quieras saber una cotización, acá estoy.'
  }

  const rate = findCurrency(message)
  if (rate) return buildRateReply(rate)

  return 'Puedo ayudarte con las cotizaciones de dólar, euro y peso argentino. Por ejemplo, pregúntame "¿cuál es la cotización del dólar?".'
}
