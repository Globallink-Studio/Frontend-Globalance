import { getQuotes, convertCurrency, refreshExchangeRates, getRateHistory } from '../../src/api/exchangeRates'
import { refreshExchangeRates as refreshMockExchangeRates, getRateHistory as getMockRateHistory } from '../../src/mocks/handlers/exchangeRates'
import { exchangeRates, seedExchangeRateHistory } from '../../src/mocks/data/exchangeRates'
import { getMockRateHistory as readStoredHistory, saveMockRateHistory } from '../../src/mocks/storage'
import { fetchApi } from '../../src/api/fetchApi'

const { getAuthModeMock } = vi.hoisted(() => ({ getAuthModeMock: vi.fn() }))

vi.mock('../../src/api/auth', () => ({ getAuthMode: getAuthModeMock }))

vi.mock('../../src/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}))

const mockFetch = vi.mocked(fetchApi)

const original = exchangeRates.map((r) => ({ ...r }))

describe('exchangeRates API — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
    exchangeRates.splice(0, exchangeRates.length, ...original.map((r) => ({ ...r })))
  })

  test('lista las cotizaciones', async () => {
    const quotes = await getQuotes()
    expect(quotes).toHaveLength(3)
    const usd = quotes.find((q) => q.currency_code === 'USD')
    expect(usd).toBeDefined()
    expect(usd!.buy_price).toBeGreaterThan(0)
    expect(usd!.sell_price).toBeGreaterThan(0)
  })

  test('refrescar con variación 0 mantiene precios y pasa el actual a prev_*', async () => {
    const before = exchangeRates.find((r) => r.currency_code === 'USD')!
    const buy = before.buy_price
    const sell = before.sell_price
    const prevBuy = before.prev_buy_price
    const prevSell = before.prev_sell_price
    const oldUpdated = before.updated_at

    await refreshMockExchangeRates(0)

    const usd = exchangeRates.find((r) => r.currency_code === 'USD')!
    expect(usd.buy_price).toBe(buy)
    expect(usd.sell_price).toBe(sell)
    expect(usd.prev_buy_price).toBe(buy)
    expect(usd.prev_sell_price).toBe(sell)
    expect(usd.prev_buy_price).not.toBe(prevBuy)
    expect(usd.prev_sell_price).not.toBe(prevSell)
    expect(usd.updated_at).not.toBe(oldUpdated)
  })

  test('refrescar con variación distinta de 0 cambia los precios', async () => {
    const before = exchangeRates.find((r) => r.currency_code === 'USD')!
    const oldBuy = before.buy_price
    const oldSell = before.sell_price

    await refreshMockExchangeRates(0.02)

    const usd = exchangeRates.find((r) => r.currency_code === 'USD')!
    expect(usd.prev_buy_price).toBe(oldBuy)
    expect(usd.prev_sell_price).toBe(oldSell)
    expect(usd.buy_price).not.toBe(oldBuy)
    expect(usd.sell_price).not.toBe(oldSell)
  })

  test('ARS queda fijo en 1 tras refrescar', async () => {
    await refreshMockExchangeRates(0.05)
    const ars = exchangeRates.find((r) => r.currency_code === 'ARS')!
    expect(ars.buy_price).toBe(1)
    expect(ars.sell_price).toBe(1)
    expect(ars.prev_buy_price).toBe(1)
    expect(ars.prev_sell_price).toBe(1)
  })

  test('la API refreshExchangeRates devuelve las cotizaciones actualizadas', async () => {
    const before = exchangeRates.find((r) => r.currency_code === 'USD')!
    const oldUpdated = before.updated_at

    const quotes = await refreshExchangeRates()

    expect(quotes).toHaveLength(3)
    const usd = quotes.find((q) => q.currency_code === 'USD')!
    expect(usd.updated_at).not.toBe(oldUpdated)
  })

  test('convertCurrency usa las tasas actuales y redondea a 2 decimales', async () => {
    const usd = exchangeRates.find((r) => r.currency_code === 'USD')!
    usd.buy_price = 1200
    usd.sell_price = 1220

    const arsToUsd = await convertCurrency('ARS', 'USD', 1000)
    expect(arsToUsd).toBe(0.82)

    const usdToArs = await convertCurrency('USD', 'ARS', 2)
    expect(usdToArs).toBe(2400)
  })

  test('convertCurrency con tasas desconocidas devuelve 0', async () => {
    const result = await convertCurrency('GBP', 'USD', 100)
    expect(result).toBe(0)
  })

  test('getRateHistory siembra el histórico de una moneda al primer pedido', async () => {
    const history = await getRateHistory('USD', 30)
    expect(history.length).toBe(30)
    expect(history[history.length - 1].buy_price).toBe(1250)
    expect(history[history.length - 1].date).toBe('2026-07-31')
  })

  test('getRateHistory recorta a los días pedidos', async () => {
    const week = await getRateHistory('USD', 7)
    expect(week.length).toBe(7)
  })

  test('el histórico siembra las tres monedas', async () => {
    const usd = await getRateHistory('USD', 30)
    const eur = await getRateHistory('EUR', 30)
    const ars = await getRateHistory('ARS', 30)
    expect(usd.length).toBe(30)
    expect(eur.length).toBe(30)
    expect(ars.length).toBe(30)
    expect(ars.every((p) => p.buy_price === 1)).toBe(true)
  })

  test('seedExchangeRateHistory es determinista', () => {
    const rate = exchangeRates.find((r) => r.currency_code === 'USD')!
    const a = seedExchangeRateHistory(rate)
    const b = seedExchangeRateHistory(rate)
    expect(a).toEqual(b)
    expect(a.length).toBe(30)
  })

  test('refrescar anexa un punto nuevo al histórico y persiste en storage', async () => {
    const before = (await getRateHistory('USD', 30)).length
    await refreshMockExchangeRates(0)

    const stored = readStoredHistory()
    const usdPoints = stored.filter((p) => p.currency_code === 'USD')
    expect(usdPoints.length).toBe(before + 1)
    const usd = exchangeRates.find((r) => r.currency_code === 'USD')!
    expect(usdPoints[usdPoints.length - 1].buy_price).toBe(usd.buy_price)
  })

  test('el histórico se recorta al rango pedido tras refrescar', async () => {
    await refreshMockExchangeRates(0)
    const week = await getRateHistory('USD', 7)
    expect(week.length).toBe(7)
  })

  test('la API getRateHistory devuelve lo mismo que el handler', async () => {
    await refreshMockExchangeRates(0)
    const viaApi = await getRateHistory('USD', 7)
    const viaHandler = await getMockRateHistory('USD', 7)
    expect(viaApi).toEqual(viaHandler)
  })

  test('guardar el histórico manualmente se refleja en el handler', () => {
    const custom = seedExchangeRateHistory(exchangeRates.find((r) => r.currency_code === 'USD')!)
    custom.push({ currency_code: 'USD', date: '2026-08-01', buy_price: 1300 })
    saveMockRateHistory(custom)
    expect(readStoredHistory()).toHaveLength(custom.length)
  })
})

describe('exchangeRates API — modo firebase (API real)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
  })

  test('getQuotes consulta /exchange/rates y convierte las tasas a ARS', async () => {
    mockFetch.mockResolvedValue({
      rates: {
        base: 'ARS',
        rates: { ARS: '1', USD: '0.0008', EUR: '0.00075' },
        provider: 'frankfurter',
        fetchedAt: '2026-08-10T12:00:00.000Z',
        expiresAt: '2026-08-10T12:01:00.000Z',
      },
    })

    const quotes = await getQuotes()

    expect(mockFetch).toHaveBeenCalledWith('/exchange/rates?base=ARS')
    expect(quotes).toHaveLength(3)

    const usd = quotes.find((q) => q.currency_code === 'USD')!
    expect(usd.buy_price).toBe(1250)
    expect(usd.sell_price).toBe(1250)
    expect(usd.provider).toBe('frankfurter')
    expect(usd.fetched_at).toBe('2026-08-10T12:00:00.000Z')

    const eur = quotes.find((q) => q.currency_code === 'EUR')!
    expect(eur.buy_price).toBe(1333.33)

    const ars = quotes.find((q) => q.currency_code === 'ARS')!
    expect(ars.buy_price).toBe(1)
  })

  test('convertCurrency consulta /exchange/quotes y devuelve el monto destino', async () => {
    mockFetch.mockResolvedValue({
      quote: {
        sourceCurrency: 'ARS',
        targetCurrency: 'USD',
        sourceAmount: '100000',
        targetAmount: '80',
        rate: '0.0008',
        provider: 'frankfurter',
        fetchedAt: '2026-08-10T12:00:00.000Z',
        expiresAt: '2026-08-10T12:01:00.000Z',
      },
    })

    const result = await convertCurrency('ARS', 'USD', 100000)

    expect(mockFetch).toHaveBeenCalledWith('/exchange/quotes?source=ARS&target=USD&amount=100000')
    expect(result).toBe(80)
  })

  test('refreshExchangeRates vuelve a consultar la API en modo real', async () => {
    mockFetch.mockResolvedValue({
      rates: {
        base: 'ARS',
        rates: { ARS: '1', USD: '0.0008', EUR: '0.00075' },
        provider: 'frankfurter',
        fetchedAt: '2026-08-10T12:05:00.000Z',
        expiresAt: '2026-08-10T12:06:00.000Z',
      },
    })

    const quotes = await refreshExchangeRates()

    expect(mockFetch).toHaveBeenCalledWith('/exchange/rates?base=ARS')
    expect(quotes).toHaveLength(3)
    expect(quotes[0].fetched_at).toBe('2026-08-10T12:05:00.000Z')
  })

  test('getRateHistory semilla un histórico de 30 días cuando el caché está vacío', async () => {
    mockFetch.mockResolvedValue({
      rates: {
        base: 'ARS',
        rates: { ARS: '1', USD: '0.0008', EUR: '0.00075' },
        provider: 'frankfurter',
        fetchedAt: '2026-08-10T12:00:00.000Z',
        expiresAt: '2026-08-10T12:01:00.000Z',
      },
    })

    const history = await getRateHistory('USD', 30)

    expect(history).toHaveLength(30)
    expect(history[history.length - 1].buy_price).toBe(1250)
    expect(mockFetch).toHaveBeenCalledWith('/exchange/rates?base=ARS')
  })

  test('getRateHistory devuelve los últimos días pedidos del caché', async () => {
    mockFetch.mockResolvedValue({
      rates: {
        base: 'ARS',
        rates: { ARS: '1', USD: '0.0008', EUR: '0.00075' },
        provider: 'frankfurter',
        fetchedAt: '2026-08-10T12:00:00.000Z',
        expiresAt: '2026-08-10T12:01:00.000Z',
      },
    })

    const full = await getRateHistory('USD', 30)
    const week = await getRateHistory('USD', 7)

    expect(full.length).toBe(30)
    expect(week.length).toBe(7)
    expect(week[week.length - 1].buy_price).toBe(full[full.length - 1].buy_price)
  })

  test('getQuotes guarda el histórico en localStorage y usa el punto anterior como prev_buy_price', async () => {
    mockFetch.mockResolvedValueOnce({
      rates: {
        base: 'ARS',
        rates: { ARS: '1', USD: '0.0008', EUR: '0.00075' },
        provider: 'frankfurter',
        fetchedAt: '2026-08-10T12:00:00.000Z',
        expiresAt: '2026-08-10T12:01:00.000Z',
      },
    })

    const first = await getQuotes()
    const usdFirst = first.find((q) => q.currency_code === 'USD')!

    const stored = JSON.parse(localStorage.getItem('globalance.rates.history') ?? '{}') as Record<string, unknown>
    expect(stored.USD).toBeDefined()
    expect(Array.isArray(stored.USD)).toBe(true)

    mockFetch.mockResolvedValueOnce({
      rates: {
        base: 'ARS',
        rates: { ARS: '1', USD: '0.00081', EUR: '0.00076' },
        provider: 'frankfurter',
        fetchedAt: '2026-08-11T12:00:00.000Z',
        expiresAt: '2026-08-11T12:01:00.000Z',
      },
    })

    const second = await getQuotes()
    const usdSecond = second.find((q) => q.currency_code === 'USD')!

    expect(usdSecond.prev_buy_price).toBe(usdFirst.buy_price)
  })

  test('getQuotes propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(getQuotes()).rejects.toThrow('Network error')
  })
})
