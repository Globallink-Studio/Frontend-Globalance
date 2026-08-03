import { getExchangeRates } from '../mocks/handlers/exchangeRates'
import type { ExchangeRate } from '../mocks/data/exchangeRates'

export async function getQuotes(): Promise<ExchangeRate[]> {
  return getExchangeRates()
}
