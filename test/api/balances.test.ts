import { getCurrentBalances, getCurrentBalanceSummary } from '../../src/api/balances'
import { getCurrentWallet } from '../../src/api/wallets'
import { fetchApi } from '../../src/api/fetchApi'
import { seedDemoUser } from '../fixtures/db'

const { getAuthModeMock } = vi.hoisted(() => ({ getAuthModeMock: vi.fn(() => 'mock') }))

vi.mock('../../src/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/auth')>()
  return { ...actual, getAuthMode: getAuthModeMock }
})

vi.mock('../../src/api/fetchApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/fetchApi')>()
  return { ...actual, fetchApi: vi.fn() }
})

const mockFetch = vi.mocked(fetchApi)

describe('balances API — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
    mockFetch.mockReset()
  })

  test('lista los balances del usuario actual', async () => {
    await seedDemoUser()
    const wallet = await getCurrentWallet()
    expect(wallet).toBeDefined()

    const balances = await getCurrentBalances()
    expect(balances).toHaveLength(3)

    const ars = balances.find((b) => b.currency_code === 'ARS')!
    expect(ars.amount).toBe(250000.5)

    const usd = balances.find((b) => b.currency_code === 'USD')!
    expect(usd.amount).toBe(1500.25)
  })

  test('devuelve [] si no hay usuario activo', async () => {
    const balances = await getCurrentBalances()
    expect(balances).toEqual([])
  })

  test('arma el resumen con las monedas activas y sus saldos', async () => {
    await seedDemoUser()

    const summary = await getCurrentBalanceSummary()
    expect(summary).toHaveLength(3)

    const usd = summary.find((s) => s.currency_code === 'USD')!
    expect(usd.currency_name).toBe('Dólar estadounidense')
    expect(usd.amount).toBe(1500.25)

    const ars = summary.find((s) => s.currency_code === 'ARS')!
    expect(ars.amount).toBe(250000.5)
  })
})

describe('balances API — modo firebase (API real)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
  })

  test('getCurrentBalances consulta /balances y convierte los montos a número', async () => {
    mockFetch.mockResolvedValue({
      balances: [
        { id: 'b1', wallet_id: 'w1', currency_code: 'ARS', amount: '250000.5', updated_at: '2026-08-10T12:00:00.000Z' },
        { id: 'b2', wallet_id: 'w1', currency_code: 'USD', amount: '1500.25', updated_at: '2026-08-10T12:00:00.000Z' },
      ],
    })

    const balances = await getCurrentBalances()

    expect(mockFetch).toHaveBeenCalledWith('/balances')
    expect(balances).toHaveLength(2)
    expect(balances[0].amount).toBe(250000.5)
    expect(balances[1].amount).toBe(1500.25)
  })

  test('getCurrentBalanceSummary completa con 0 las monedas sin saldo', async () => {
    mockFetch.mockResolvedValue({
      balances: [
        { id: 'b1', wallet_id: 'w1', currency_code: 'ARS', amount: '1000', updated_at: '2026-08-10T12:00:00.000Z' },
      ],
    })

    const summary = await getCurrentBalanceSummary()

    expect(summary).toHaveLength(3)
    expect(summary.find((s) => s.currency_code === 'ARS')!.amount).toBe(1000)
    expect(summary.find((s) => s.currency_code === 'USD')!.amount).toBe(0)
    expect(summary.find((s) => s.currency_code === 'EUR')!.amount).toBe(0)
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(getCurrentBalances()).rejects.toThrow('Network error')
  })
})
