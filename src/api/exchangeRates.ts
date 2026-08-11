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
  const resp = await fetchApi<ApiRatesResponse>('/exchange/rates?base=ARS')
  const { base, rates, provider, fetchedAt } = resp.rates
  return currencies
    .filter((c) => c.active)
    .map((c) => {
      const arsValue = c.code === base ? 1 : 1 / Number(rates[c.code] ?? 1)
      return toExchangeRate(c.code, arsValue, provider, fetchedAt)
    })
}

export async function getRateHistory(currencyCode: string, days: number): Promise<ExchangeRatePoint[]> {
  if (getAuthMode() !== 'mock') return []
  return getMockRateHistory(currencyCode, days)
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
