import { getDashboardMetrics, getDashboardChart } from '../../src/api/dashboard'
import { getCurrentBalanceSummary } from '../../src/api/balances'
import { getCurrentTransactions } from '../../src/api/transactions'
import { convertCurrency } from '../../src/api/exchangeRates'

const { getAuthModeMock } = vi.hoisted(() => ({ getAuthModeMock: vi.fn(() => 'mock') }))

vi.mock('../../src/api/auth', () => ({ getAuthMode: getAuthModeMock }))
vi.mock('../../src/api/balances', () => ({ getCurrentBalanceSummary: vi.fn() }))
vi.mock('../../src/api/transactions', () => ({ getCurrentTransactions: vi.fn() }))
vi.mock('../../src/api/exchangeRates', () => ({ convertCurrency: vi.fn() }))

const mockBalances = vi.mocked(getCurrentBalanceSummary)
const mockTransactions = vi.mocked(getCurrentTransactions)
const mockConvert = vi.mocked(convertCurrency)

describe('dashboard API — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    getAuthModeMock.mockReturnValue('mock')
    mockBalances.mockReset()
    mockTransactions.mockReset()
    mockConvert.mockReset()
  })

  test('getDashboardMetrics calcula ingresos y gastos desde las transacciones', async () => {
    mockBalances.mockResolvedValue([
      { currency_code: 'ARS', currency_name: 'Peso argentino', symbol: '$', amount: 100000 },
      { currency_code: 'USD', currency_name: 'Dólar', symbol: 'US$', amount: 500 },
    ])
    mockTransactions.mockResolvedValue([
      {
        id: '1',
        wallet_id: 'w1',
        currency_code: 'ARS',
        type: 'deposit',
        amount: 50000,
        description: 'Sueldo',
        status: 'completed',
        created_at: '2026-07-28T09:00:00.000Z',
      },
      {
        id: '2',
        wallet_id: 'w1',
        currency_code: 'ARS',
        type: 'transfer',
        amount: 12000,
        description: 'Pago de alquiler',
        status: 'completed',
        created_at: '2026-07-25T15:30:00.000Z',
      },
    ])
    mockConvert.mockImplementation(async (from: string, to: string, amount: number) => {
      if (from === 'ARS' && to === 'USD') return amount / 1000
      if (from === 'USD' && to === 'USD') return amount
      return amount
    })

    const metrics = await getDashboardMetrics()

    expect(mockBalances).toHaveBeenCalled()
    expect(mockTransactions).toHaveBeenCalled()
    const income = metrics.find((m) => m.label === 'Ingresos del mes')
    const expense = metrics.find((m) => m.label === 'Gastos del mes')
    expect(income?.amount).toBe(50)
    expect(expense?.amount).toBe(12)
  })

  test('getDashboardChart genera un punto por día del mes', async () => {
    mockTransactions.mockResolvedValue([
      {
        id: '1',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'deposit',
        amount: 200,
        description: 'Pago',
        status: 'completed',
        created_at: '2026-07-15T09:00:00.000Z',
      },
      {
        id: '2',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'transfer',
        amount: 50,
        description: 'Servicio',
        status: 'completed',
        created_at: '2026-07-15T10:00:00.000Z',
      },
    ])
    mockConvert.mockImplementation(async (_from: string, to: string, amount: number) => {
      return to === 'USD' ? amount : amount
    })

    const chart = await getDashboardChart()

    expect(chart.length).toBe(31)
    const day15 = chart.find((p) => p.month === '15')
    expect(day15).toMatchObject({ ingresos: 200, gastos: 50, saldo: 150 })
    const day1 = chart.find((p) => p.month === '1')
    expect(day1).toMatchObject({ ingresos: 0, gastos: 0, saldo: 0 })
  })

  test('una transferencia recibida cuenta como ingreso y no como gasto', async () => {
    mockBalances.mockResolvedValue([
      { currency_code: 'USD', currency_name: 'Dólar', symbol: 'US$', amount: 0 },
    ])
    mockTransactions.mockResolvedValue([
      {
        id: '1',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'transfer',
        amount: 300,
        description: 'Recibido de María',
        status: 'completed',
        created_at: '2026-07-20T09:00:00.000Z',
        direction: 'in',
      },
      {
        id: '2',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'transfer',
        amount: 100,
        description: 'Pago a proveedor',
        status: 'completed',
        created_at: '2026-07-21T10:00:00.000Z',
      },
    ])
    mockConvert.mockImplementation(async (_from: string, to: string, amount: number) => {
      return to === 'USD' ? amount : amount
    })

    const metrics = await getDashboardMetrics()
    const income = metrics.find((m) => m.label === 'Ingresos del mes')
    const expense = metrics.find((m) => m.label === 'Gastos del mes')
    expect(income?.amount).toBe(300)
    expect(expense?.amount).toBe(100)
  })
})

describe('dashboard API — modo firebase (API real)', () => {
  beforeEach(() => {
    getAuthModeMock.mockReturnValue('firebase')
    mockBalances.mockReset()
    mockTransactions.mockReset()
    mockConvert.mockReset()
  })

  test('getDashboardMetrics calcula ingresos y gastos desde transacciones del mes', async () => {
    mockBalances.mockResolvedValue([
      { currency_code: 'ARS', currency_name: 'Peso argentino', symbol: '$', amount: 100000 },
      { currency_code: 'USD', currency_name: 'Dólar', symbol: 'US$', amount: 500 },
    ])
    mockTransactions.mockResolvedValue([
      {
        id: '1',
        wallet_id: 'w1',
        currency_code: 'ARS',
        type: 'deposit',
        amount: 50000,
        description: 'Sueldo',
        status: 'completed',
        created_at: '2026-07-28T09:00:00.000Z',
      },
      {
        id: '2',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'transfer',
        amount: 100,
        description: 'Hosting',
        status: 'completed',
        created_at: '2026-07-25T15:30:00.000Z',
      },
    ])
    mockConvert.mockImplementation(async (from: string, to: string, amount: number) => {
      if (from === 'ARS' && to === 'USD') return amount / 1000
      if (from === 'USD' && to === 'USD') return amount
      return amount
    })

    const metrics = await getDashboardMetrics()

    expect(mockBalances).toHaveBeenCalled()
    expect(mockTransactions).toHaveBeenCalled()
    const income = metrics.find((m) => m.label === 'Ingresos del mes')
    const expense = metrics.find((m) => m.label === 'Gastos del mes')
    expect(income?.amount).toBe(50)
    expect(expense?.amount).toBe(100)
  })

  test('getDashboardChart genera un punto por día del mes con transacciones', async () => {
    mockTransactions.mockResolvedValue([
      {
        id: '1',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'deposit',
        amount: 200,
        description: 'Pago',
        status: 'completed',
        created_at: '2026-07-15T09:00:00.000Z',
      },
      {
        id: '2',
        wallet_id: 'w1',
        currency_code: 'USD',
        type: 'transfer',
        amount: 50,
        description: 'Servicio',
        status: 'completed',
        created_at: '2026-07-15T10:00:00.000Z',
      },
    ])
    mockConvert.mockImplementation(async (_from: string, to: string, amount: number) => {
      return to === 'USD' ? amount : amount
    })

    const chart = await getDashboardChart()

    expect(chart.length).toBe(31)
    const day15 = chart.find((p) => p.month === '15')
    expect(day15).toMatchObject({ ingresos: 200, gastos: 50, saldo: 150 })
    const day1 = chart.find((p) => p.month === '1')
    expect(day1).toMatchObject({ ingresos: 0, gastos: 0, saldo: 0 })
  })
})
