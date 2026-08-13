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
  provider?: string
  fetched_at?: string
  expires_at?: string
}

export interface ExchangeRatePoint {
  currency_code: string
  date: string
  buy_price: number
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

function hashCode(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// Genera ~30 puntos históricos diarios por moneda, deterministas: arrancan en
// prev_buy_price y terminan en buy_price en `updated_at`. El back reemplazará
// esta simulación por el histórico real (ver referencias/pendientes.md).
export function seedExchangeRateHistory(rate: ExchangeRate): ExchangeRatePoint[] {
  const n = 30
  const rng = seeded(hashCode(rate.id))
  const start = rate.prev_buy_price
  const end = rate.buy_price
  const baseDate = new Date(rate.updated_at)
  const amp = Math.max(Math.abs(end - start), end * 0.015)
  const fixed = start === end
  const pts: ExchangeRatePoint[] = []
  let v = start
  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      v = end
    } else if (fixed) {
      v = end
    } else {
      const drift = (end - start) / n
      const noise = (rng() - 0.5) * amp * 0.8
      v += drift + noise
    }
    const d = new Date(baseDate.getTime() - (n - 1 - i) * 86400000)
    pts.push({
      currency_code: rate.currency_code,
      date: d.toISOString().slice(0, 10),
      buy_price: Math.round(v * 100) / 100,
    })
  }
  return pts
}
