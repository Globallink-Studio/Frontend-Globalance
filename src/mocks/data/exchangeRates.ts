export interface ExchangeRate {
  id: string
  currency_code: string
  currency_name: string
  symbol: string
  buy_price: number
  sell_price: number
  prev_buy_price: number
  prev_sell_price: number
  updated_at: string
}

export const exchangeRates: ExchangeRate[] = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    currency_code: 'USD',
    currency_name: 'Dólar estadounidense',
    symbol: 'US$',
    buy_price: 1250,
    sell_price: 1270,
    prev_buy_price: 1240,
    prev_sell_price: 1260,
    updated_at: '2026-07-31T12:00:00.000Z',
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    currency_code: 'EUR',
    currency_name: 'Euro',
    symbol: '€',
    buy_price: 1350,
    sell_price: 1370,
    prev_buy_price: 1370,
    prev_sell_price: 1390,
    updated_at: '2026-07-31T12:00:00.000Z',
  },
  {
    id: '50000000-0000-4000-8000-000000000003',
    currency_code: 'ARS',
    currency_name: 'Peso argentino',
    symbol: '$',
    buy_price: 1,
    sell_price: 1,
    prev_buy_price: 1,
    prev_sell_price: 1,
    updated_at: '2026-07-31T12:00:00.000Z',
  },
]
