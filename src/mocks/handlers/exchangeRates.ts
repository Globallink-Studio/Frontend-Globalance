import { delay } from '../delay'
import { exchangeRates } from '../data/exchangeRates'
import type { ExchangeRate } from '../data/exchangeRates'

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  await delay()
  return exchangeRates
}

export async function getExchangeRateByCurrency(currencyCode: string): Promise<ExchangeRate | undefined> {
  await delay()
  return exchangeRates.find((r) => r.currency_code === currencyCode)
}
