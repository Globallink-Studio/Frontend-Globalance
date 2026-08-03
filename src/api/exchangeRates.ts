import { getExchangeRates } from '../mocks/handlers/exchangeRates'
import type { ExchangeRate } from '../mocks/data/exchangeRates'

export async function getQuotes(): Promise<ExchangeRate[]> {
  return getExchangeRates()
}

export async function convertCurrency(fromCurrency: string, toCurrency: string, amount: number): Promise<number> {
  const quotes = await getQuotes()
  const buy = (code: string) => quotes.find((q) => q.currency_code === code)?.buy_price ?? 0
  const sell = (code: string) => quotes.find((q) => q.currency_code === code)?.sell_price ?? 0
  const arsValue = fromCurrency === 'ARS' ? amount : amount * buy(fromCurrency)
  const result = toCurrency === 'ARS' ? arsValue : arsValue / sell(toCurrency)
  return Math.round(result * 100) / 100
}
