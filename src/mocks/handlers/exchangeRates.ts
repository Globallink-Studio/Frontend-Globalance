import { delay } from '../delay'
import { exchangeRates, seedExchangeRateHistory } from '../data/exchangeRates'
import type { ExchangeRate, ExchangeRatePoint } from '../data/exchangeRates'
import { getMockRateHistory, saveMockRateHistory } from '../storage'

function ensureHistory(): ExchangeRatePoint[] {
  let history = getMockRateHistory()
  if (history.length === 0) {
    history = exchangeRates.flatMap((rate) => seedExchangeRateHistory(rate))
    saveMockRateHistory(history)
  }
  return history
}

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  await delay()
  return exchangeRates
}

export async function getExchangeRateByCurrency(currencyCode: string): Promise<ExchangeRate | undefined> {
  await delay()
  return exchangeRates.find((r) => r.currency_code === currencyCode)
}

// Devuelve el histórico de compra de una moneda, recortado a los últimos `days`
// días (ordenado de más antiguo a más reciente). Emula el `GET /exchange-rates/history`
// que publicará el back (ver referencias/pendientes.md).
export async function getRateHistory(currencyCode: string, days: number): Promise<ExchangeRatePoint[]> {
  await delay()
  const history = ensureHistory()
  return history
    .filter((p) => p.currency_code === currencyCode)
    .slice(-days)
}

// Refresca las cotizaciones simulando una variación de mercado: las tasas
// actuales pasan a prev_*, se les aplica un delta aleatorio y se actualiza
// updated_at. Además anexa un punto nuevo (hoy) al histórico de cada moneda,
// como hará el back al agregar una cotización nueva. ARS queda fijo en 1.
// `variation` permite forzar el delta en tests.
export async function refreshExchangeRates(variation = 0.02): Promise<ExchangeRate[]> {
  await delay()
  const now = new Date().toISOString()
  const today = now.slice(0, 10)
  const history = ensureHistory()
  for (const rate of exchangeRates) {
    rate.prev_buy_price = rate.buy_price
    rate.prev_sell_price = rate.sell_price
    rate.updated_at = now
    if (rate.currency_code === 'ARS') continue
    const deltaBuy = (Math.random() * 2 - 1) * variation
    const deltaSell = (Math.random() * 2 - 1) * variation
    rate.buy_price = Math.round(rate.buy_price * (1 + deltaBuy) * 100) / 100
    rate.sell_price = Math.round(rate.sell_price * (1 + deltaSell) * 100) / 100
    history.push({ currency_code: rate.currency_code, date: today, buy_price: rate.buy_price })
  }
  saveMockRateHistory(history)
  return exchangeRates
}
