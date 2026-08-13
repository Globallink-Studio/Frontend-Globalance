import {
  getExchangeRates,
  getRateHistory as getMockRateHistory,
  refreshExchangeRates as refreshMockExchangeRates,
} from '../mocks/handlers/exchangeRates'
import { getAuthMode } from './auth'
import { fetchApi } from './fetchApi'
import { currencies } from '../mocks/data/currencies'
import type { ExchangeRate, ExchangeRatePoint } from '../mocks/data/exchangeRates'

const CURRENCY_NAMES: Record<string, { name: string; symbol: string }> = {
  ARS: { name: 'Peso argentino', symbol: '$' },
  USD: { name: 'Dólar estadounidense', symbol: 'US$' },
  EUR: { name: 'Euro', symbol: '€' },
}

const RATES_HISTORY_KEY = 'globalance.rates.history'
const RATES_LAST_KEY = 'globalance.rates.last'

interface ApiRatesResponse {
  rates: {
    base: string
    rates: Record<string, string>
    provider: string
    fetchedAt: string
    expiresAt: string
  }
}

interface ApiQuoteResponse {
  quote: {
    sourceCurrency: string
    targetCurrency: string
    sourceAmount: string
    targetAmount: string
    rate: string
    provider: string
    fetchedAt: string
    expiresAt: string
  }
}

type RatesHistoryCache = Record<string, ExchangeRatePoint[]>

function toDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

function loadRatesCache(): RatesHistoryCache {
  try {
    const raw = localStorage.getItem(RATES_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as RatesHistoryCache) : {}
  } catch {
    return {}
  }
}

function saveRatesCache(cache: RatesHistoryCache): void {
  try {
    localStorage.setItem(RATES_HISTORY_KEY, JSON.stringify(cache))
  } catch {
    // Ignoramos errores de localStorage (modo privado, quota excedida, etc.)
  }
}

function loadLastQuotes(): ExchangeRate[] {
  try {
    const raw = localStorage.getItem(RATES_LAST_KEY)
    return raw ? (JSON.parse(raw) as ExchangeRate[]) : []
  } catch {
    return []
  }
}

function saveLastQuotes(quotes: ExchangeRate[]): void {
  try {
    localStorage.setItem(RATES_LAST_KEY, JSON.stringify(quotes))
  } catch {
    // Ignoramos errores de localStorage (modo privado, quota excedida, etc.)
  }
}

function seedHistoryFromRate(
  currencyCode: string,
  currentRate: number,
  referenceDate: string,
): ExchangeRatePoint[] {
  const days = 30
  const points: ExchangeRatePoint[] = []
  const [year, month, day] = referenceDate.split('-').map(Number)
  const startRate = currentRate * 0.92
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(year, month - 1, day - (days - i)))
    const progress = i / (days - 1)
    const value = startRate + (currentRate - startRate) * progress
    points.push({
      currency_code: currencyCode,
      date: d.toISOString().slice(0, 10),
      buy_price: Math.round(value * 100) / 100,
    })
  }
  return points
}

function appendRatesToCache(rates: ExchangeRate[], date: string): void {
  const cache = loadRatesCache()
  for (const rate of rates) {
    const points = cache[rate.currency_code] ?? []
    const last = points[points.length - 1]
    const point: ExchangeRatePoint = {
      currency_code: rate.currency_code,
      date,
      buy_price: rate.buy_price,
    }
    if (last && last.date === date) {
      points[points.length - 1] = point
    } else {
      points.push(point)
    }
    cache[rate.currency_code] = points
  }
  saveRatesCache(cache)
}

function toExchangeRate(
  code: string,
  arsValue: number,
  provider: string,
  fetchedAt: string,
): ExchangeRate {
  const meta = CURRENCY_NAMES[code] ?? { name: code, symbol: code }
  const value = Math.round(arsValue * 100) / 100
  return {
    id: `quote-${code}`,
    currency_code: code,
    currency_name: meta.name,
    symbol: meta.symbol,
    buy_price: value,
    sell_price: value,
    prev_buy_price: value,
    prev_sell_price: value,
    updated_at: fetchedAt,
    provider,
    fetched_at: fetchedAt,
  }
}

export async function getQuotes(): Promise<ExchangeRate[]> {
  if (getAuthMode() === 'mock') {
    return getExchangeRates()
  }
  try {
    const resp = await fetchApi<ApiRatesResponse>('/exchange/rates?base=ARS')
    const { base, rates, provider, fetchedAt } = resp.rates
    const date = toDate(fetchedAt)
    const quotes = currencies
      .filter((c) => c.active)
      .map((c) => {
        const arsValue = c.code === base ? 1 : 1 / Number(rates[c.code] ?? 1)
        return toExchangeRate(c.code, arsValue, provider, fetchedAt)
      })

    const cache = loadRatesCache()
    for (const quote of quotes) {
      let history = cache[quote.currency_code]
      if (!history || history.length < 2) {
        history = seedHistoryFromRate(quote.currency_code, quote.buy_price, date)
        cache[quote.currency_code] = history
      }
      const prevPoint = history[history.length - 1]
      if (prevPoint && prevPoint.date !== date) {
        quote.prev_buy_price = prevPoint.buy_price
        quote.prev_sell_price = prevPoint.buy_price
      }
    }
    appendRatesToCache(quotes, date)
    saveRatesCache(cache)
    saveLastQuotes(quotes)

    return quotes
  } catch {
    const cached = loadLastQuotes()
    if (cached.length > 0) return cached
    return []
  }
}

export async function getRateHistory(currencyCode: string, days: number): Promise<ExchangeRatePoint[]> {
  if (getAuthMode() === 'mock') {
    return getMockRateHistory(currencyCode, days)
  }

  const cache = loadRatesCache()
  let points = cache[currencyCode]
  if (!points || points.length < 2) {
    const quotes = await getQuotes()
    const quote = quotes.find((q) => q.currency_code === currencyCode)
    if (!quote) return []
    const refDate = quote.fetched_at ? toDate(quote.fetched_at) : new Date().toISOString().slice(0, 10)
    points = seedHistoryFromRate(currencyCode, quote.buy_price, refDate)
    cache[currencyCode] = points
    saveRatesCache(cache)
  }
  return points.slice(-days)
}

export async function refreshExchangeRates(): Promise<ExchangeRate[]> {
  if (getAuthMode() === 'mock') {
    return refreshMockExchangeRates()
  }
  return getQuotes()
}

export async function convertCurrency(fromCurrency: string, toCurrency: string, amount: number): Promise<number> {
  if (fromCurrency === toCurrency) return amount
  if (!Number.isFinite(amount) || amount <= 0) return 0

  if (getAuthMode() === 'mock') {
    const quotes = await getQuotes()
    const buy = (code: string) => quotes.find((q) => q.currency_code === code)?.buy_price ?? 0
    const sell = (code: string) => quotes.find((q) => q.currency_code === code)?.sell_price ?? 0
    const arsValue = fromCurrency === 'ARS' ? amount : amount * buy(fromCurrency)
    const result = toCurrency === 'ARS' ? arsValue : arsValue / sell(toCurrency)
    return Math.round(result * 100) / 100
  }
  const resp = await fetchApi<ApiQuoteResponse>(
    `/exchange/quotes?source=${fromCurrency}&target=${toCurrency}&amount=${amount}`,
  )
  return Number(resp.quote.targetAmount)
}
