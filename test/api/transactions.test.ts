import {
  createTransfer,
  createWithdrawal,
  createConversion,
  createDeposit,
  getCurrentTransactions,
  getRecentTransactions,
  getTransactionsByType,
  getTransactionsByCurrency,
} from '../../src/api/transactions'
import { getCurrentWallet, getWalletByUserId } from '../../src/api/wallets'
import { getBalancesByWallet } from '../../src/mocks/handlers/balances'
import { getTransactionsByWallet } from '../../src/mocks/handlers/transactions'
import { fetchApi } from '../../src/api/fetchApi'
import { DEMO_USER_EMAIL, JUAN_USER_ID, seedDemoUser } from '../fixtures/db'

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

function balanceOf(items: { currency_code: string; amount: number }[], currency: string): number {
  return items.find((b) => b.currency_code === currency)?.amount ?? 0
}

describe('createTransfer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('incluye el alias del remitente en la transferencia recibida y ajusta los saldos', async () => {
    const sender = await seedDemoUser()
    expect(sender.email).toBe(DEMO_USER_EMAIL)

    const senderWallet = await getCurrentWallet()
    expect(senderWallet).toBeDefined()

    const recipientWallet = await getWalletByUserId(JUAN_USER_ID)
    expect(recipientWallet).toBeDefined()
    expect(recipientWallet!.alias).toBe('juan.cash')

    const senderBefore = await getBalancesByWallet(senderWallet!.id)
    const recipientBefore = await getBalancesByWallet(recipientWallet!.id)
    const senderArsBefore = balanceOf(senderBefore, 'ARS')
    const recipientArsBefore = balanceOf(recipientBefore, 'ARS')

    await createTransfer({
      recipient: 'Juan Pérez',
      recipientUserId: JUAN_USER_ID,
      currencyCode: 'ARS',
      amount: 100,
      concept: 'Pago de prueba',
    })

    const senderAfter = await getBalancesByWallet(senderWallet!.id)
    const recipientAfter = await getBalancesByWallet(recipientWallet!.id)
    expect(balanceOf(senderAfter, 'ARS')).toBe(senderArsBefore - 100)
    expect(balanceOf(recipientAfter, 'ARS')).toBe(recipientArsBefore + 100)

    const senderTx = await getTransactionsByWallet(senderWallet!.id)
    const sent = senderTx.find(
      (t) => t.type === 'transfer' && t.description === 'Transferencia a Juan Pérez',
    )
    expect(sent).toBeDefined()
    expect(sent!.amount).toBe(100)
    expect(sent!.currency_code).toBe('ARS')
    expect(sent!.concept).toBe('Pago de prueba')

    const recipientTx = await getTransactionsByWallet(recipientWallet!.id)
    const received = recipientTx.find(
      (t) => t.type === 'transfer' && t.description === `Transferencia recibida de ${senderWallet!.alias}`,
    )
    expect(received).toBeDefined()
    expect(received!.amount).toBe(100)
    expect(received!.currency_code).toBe('ARS')
  })

  test('no crea transferencia si no hay saldo suficiente', async () => {
    await seedDemoUser()

    const senderWallet = await getCurrentWallet()
    expect(senderWallet).toBeDefined()
    const senderBefore = await getBalancesByWallet(senderWallet!.id)

    await expect(
      createTransfer({
        recipient: 'Juan Pérez',
        recipientUserId: JUAN_USER_ID,
        currencyCode: 'ARS',
        amount: 999999999,
      }),
    ).rejects.toThrow('Saldo insuficiente')

    const senderAfter = await getBalancesByWallet(senderWallet!.id)
    expect(senderAfter).toEqual(senderBefore)
  })

  test('rechaza montos menores o iguales a cero', async () => {
    await seedDemoUser()
    await expect(
      createTransfer({
        recipient: 'Juan Pérez',
        recipientUserId: JUAN_USER_ID,
        currencyCode: 'ARS',
        amount: 0,
      }),
    ).rejects.toThrow('El monto debe ser mayor a 0')
  })
})

describe('createWithdrawal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('resta el saldo, crea una transacción de retiro y la registra como pendiente', async () => {
    await seedDemoUser()
    const wallet = await getCurrentWallet()
    expect(wallet).toBeDefined()

    const before = await getBalancesByWallet(wallet!.id)
    const arsBefore = balanceOf(before, 'ARS')

    const tx = await createWithdrawal({
      currencyCode: 'ARS',
      amount: 200,
      methodName: 'Mercado Pago',
    })

    expect(tx.type).toBe('withdrawal')
    expect(tx.amount).toBe(200)
    expect(tx.currency_code).toBe('ARS')
    expect(tx.description).toBe('Retiro hacia Mercado Pago')
    expect(tx.status).toBe('pending')

    const after = await getBalancesByWallet(wallet!.id)
    expect(balanceOf(after, 'ARS')).toBe(arsBefore - 200)

    const txs = await getTransactionsByWallet(wallet!.id)
    const withdrawal = txs.find((t) => t.id === tx.id)
    expect(withdrawal).toBeDefined()
    expect(withdrawal!.type).toBe('withdrawal')
  })

  test('no resta saldo ni crea transacción si el monto supera el disponible', async () => {
    await seedDemoUser()
    const wallet = await getCurrentWallet()
    expect(wallet).toBeDefined()
    const before = await getBalancesByWallet(wallet!.id)

    await expect(
      createWithdrawal({
        currencyCode: 'ARS',
        amount: 999999999,
        methodName: 'Mercado Pago',
      }),
    ).rejects.toThrow('Saldo insuficiente')

    const after = await getBalancesByWallet(wallet!.id)
    expect(after).toEqual(before)

    const txs = await getTransactionsByWallet(wallet!.id)
    expect(txs.some((t) => t.type === 'withdrawal')).toBe(false)
  })

  test('rechaza montos menores o iguales a cero', async () => {
    await seedDemoUser()
    await expect(
      createWithdrawal({
        currencyCode: 'ARS',
        amount: 0,
      }),
    ).rejects.toThrow('El monto debe ser mayor a 0')
  })
})

describe('createDeposit — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
  })

  test('acredita el saldo y crea una transacción de depósito completada', async () => {
    await seedDemoUser()
    const wallet = await getCurrentWallet()
    expect(wallet).toBeDefined()

    const before = await getBalancesByWallet(wallet!.id)
    const arsBefore = balanceOf(before, 'ARS')

    const tx = await createDeposit({ currencyCode: 'ARS', amount: 1000, methodName: 'Mercado Pago' })

    expect(tx.type).toBe('deposit')
    expect(tx.amount).toBe(1000)
    expect(tx.currency_code).toBe('ARS')
    expect(tx.description).toBe('Depósito desde Mercado Pago')
    expect(tx.status).toBe('completed')

    const after = await getBalancesByWallet(wallet!.id)
    expect(balanceOf(after, 'ARS')).toBe(arsBefore + 1000)
  })
})

describe('createDeposit — modo firebase (API real)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
  })

  const apiTransaction = {
    transaction_id: '30000000-0000-4000-8000-000000000003',
    status: 'completed',
    currency: 'USD',
    amount: '5000.00',
    balance_before: '1500.00',
    balance_after: '6500.00',
    created_at: '2026-08-10T14:00:00.000Z',
  }

  test('carga saldo vía POST /transactions/income y mapea la respuesta', async () => {
    mockFetch.mockImplementation((path, options) => {
      if (path === '/transactions/income' && options?.method === 'POST') {
        return Promise.resolve({ message: 'Carga de saldo demo realizada correctamente', transaction: apiTransaction })
      }
      if (path === '/wallet') {
        return Promise.resolve({
          user: { id: '11111111-1111-4111-8111-111111111111' },
          wallet: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
          balances: [],
        })
      }
      return Promise.reject(new Error(`Ruta inesperada: ${path}`))
    })

    const tx = await createDeposit({ currencyCode: 'USD', amount: 5000 })

    expect(mockFetch).toHaveBeenCalledWith(
      '/transactions/income',
      expect.objectContaining({
        method: 'POST',
        body: { currency: 'USD', amount: '5000' },
        headers: expect.objectContaining({ 'Idempotency-Key': expect.any(String) }),
      }),
    )
    expect(tx.id).toBe('30000000-0000-4000-8000-000000000003')
    expect(tx.type).toBe('deposit')
    expect(tx.currency_code).toBe('USD')
    expect(tx.amount).toBe(5000)
    expect(tx.status).toBe('completed')
    expect(tx.wallet_id).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
  })

  test('valida el monto antes de llamar a la API', async () => {
    await expect(createDeposit({ currencyCode: 'USD', amount: 0 })).rejects.toThrow('El monto debe ser mayor a 0')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(createDeposit({ currencyCode: 'USD', amount: 100 })).rejects.toThrow('Network error')
  })
})

describe('createConversion — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
  })

  test('convierte ARS a USD, ajusta los saldos y crea la transacción como completada', async () => {
    await seedDemoUser()
    const wallet = await getCurrentWallet()
    expect(wallet).toBeDefined()

    const before = await getBalancesByWallet(wallet!.id)
    const arsBefore = balanceOf(before, 'ARS')
    const usdBefore = balanceOf(before, 'USD')

    const tx = await createConversion({ fromCurrency: 'ARS', toCurrency: 'USD', amount: 1000 })

    expect(tx.type).toBe('conversion')
    expect(tx.status).toBe('completed')
    expect(tx.currency_code).toBe('USD')
    expect(tx.amount).toBeGreaterThan(0)
    expect(tx.from_currency).toBe('ARS')
    expect(tx.to_currency).toBe('USD')

    const after = await getBalancesByWallet(wallet!.id)
    expect(balanceOf(after, 'ARS')).toBe(arsBefore - 1000)
    expect(balanceOf(after, 'USD')).toBeGreaterThan(usdBefore)
  })

  test('rechaza la conversión si no hay saldo suficiente', async () => {
    await seedDemoUser()
    await expect(
      createConversion({ fromCurrency: 'ARS', toCurrency: 'USD', amount: 999999999 }),
    ).rejects.toThrow('Saldo insuficiente')
  })

  test('rechaza que origen y destino sean la misma moneda', async () => {
    await seedDemoUser()
    await expect(
      createConversion({ fromCurrency: 'USD', toCurrency: 'USD', amount: 100 }),
    ).rejects.toThrow('La moneda de origen y destino deben ser distintas')
  })

  test('rechaza montos menores o iguales a cero', async () => {
    await seedDemoUser()
    await expect(
      createConversion({ fromCurrency: 'ARS', toCurrency: 'USD', amount: 0 }),
    ).rejects.toThrow('El monto debe ser mayor a 0')
  })
})

describe('createConversion — modo firebase (API real)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
  })

  test('envía la conversión a POST /transactions/exchange con Idempotency-Key y mapea la respuesta', async () => {
    mockFetch.mockImplementation((path: string) => {
      if (path === '/transactions/exchange') {
        return Promise.resolve({
          message: 'Operación de cambio realizada correctamente',
          transaction: {
            transaction_id: '30000000-0000-4000-8000-000000000001',
            type: 'conversion',
            status: 'completed',
            description: null,
            created_at: '2026-08-10T14:00:00.000Z',
            completed_at: '2026-08-10T14:00:01.000Z',
            source_currency: 'ARS',
            target_currency: 'USD',
            source_amount: '100000',
            target_amount: '80',
            applied_rate: '0.0008',
            rate_provider: 'frankfurter',
            rate_fetched_at: '2026-08-10T13:59:00.000Z',
            source_balance_after: '0',
            target_balance_after: '80',
          },
        })
      }
      if (path === '/wallet') {
        return Promise.resolve({
          user: { id: '11111111-1111-4111-8111-111111111111' },
          wallet: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
          balances: [],
        })
      }
      return Promise.reject(new Error(`Ruta inesperada: ${path}`))
    })

    const tx = await createConversion({ fromCurrency: 'ARS', toCurrency: 'USD', amount: 100000 })

    expect(mockFetch).toHaveBeenCalledWith(
      '/transactions/exchange',
      expect.objectContaining({
        method: 'POST',
        body: {
          sourceCurrency: 'ARS',
          targetCurrency: 'USD',
          sourceAmount: '100000',
        },
        headers: expect.objectContaining({ 'Idempotency-Key': expect.any(String) }),
      }),
    )

    expect(tx.id).toBe('30000000-0000-4000-8000-000000000001')
    expect(tx.wallet_id).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
    expect(tx.type).toBe('conversion')
    expect(tx.currency_code).toBe('USD')
    expect(tx.amount).toBe(80)
    expect(tx.status).toBe('completed')
    expect(tx.from_currency).toBe('ARS')
    expect(tx.to_currency).toBe('USD')
  })

  test('valida origen y destino antes de llamar a la API', async () => {
    await expect(
      createConversion({ fromCurrency: 'USD', toCurrency: 'USD', amount: 100 }),
    ).rejects.toThrow('La moneda de origen y destino deben ser distintas')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('valida el monto antes de llamar a la API', async () => {
    await expect(
      createConversion({ fromCurrency: 'ARS', toCurrency: 'USD', amount: 0 }),
    ).rejects.toThrow('El monto debe ser mayor a 0')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(
      createConversion({ fromCurrency: 'ARS', toCurrency: 'USD', amount: 100 }),
    ).rejects.toThrow('Network error')
  })
})

describe('historial de transacciones — modo mock (desarrollo local)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
  })

  test('getCurrentTransactions lista las transacciones de la wallet del usuario', async () => {
    await seedDemoUser()
    const txs = await getCurrentTransactions()
    expect(txs.length).toBeGreaterThan(0)
    expect(txs.every((t) => t.wallet_id)).toBeTruthy()
  })

  test('getRecentTransactions respeta el límite', async () => {
    await seedDemoUser()
    const txs = await getRecentTransactions(2)
    expect(txs).toHaveLength(2)
  })

  test('getTransactionsByType filtra por tipo', async () => {
    await seedDemoUser()
    const deposits = await getTransactionsByType('deposit')
    expect(deposits.length).toBeGreaterThan(0)
    expect(deposits.every((t) => t.type === 'deposit')).toBe(true)
  })

  test('getTransactionsByCurrency filtra por moneda', async () => {
    await seedDemoUser()
    const usd = await getTransactionsByCurrency('USD')
    expect(usd.length).toBeGreaterThan(0)
    expect(usd.every((t) => t.currency_code === 'USD')).toBe(true)
  })
})

describe('historial de transacciones — modo firebase (API real)', () => {
  beforeEach(() => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
  })

  const apiTransactions = [
    {
      id: '30000000-0000-4000-8000-000000000001',
      type: 'income',
      status: 'completed',
      description: 'Depósito de sueldo',
      created_at: '2026-08-01T09:00:00.000Z',
      completed_at: '2026-08-01T09:00:01.000Z',
      source_currency: null,
      target_currency: null,
      applied_rate: null,
      rate_provider: null,
      rate_fetched_at: null,
      destination_wallet_id: null,
      recipient_name: null,
      funding_method: 'bank_transfer',
      movements: [
        {
          direction: 'credit',
          concept: 'principal',
          currency: 'ARS',
          amount: '50000',
          balance_before: '0',
          balance_after: '50000',
          created_at: '2026-08-01T09:00:01.000Z',
        },
      ],
    },
    {
      id: '30000000-0000-4000-8000-000000000002',
      type: 'conversion',
      status: 'completed',
      description: 'Conversión desde ARS',
      created_at: '2026-08-02T10:00:00.000Z',
      completed_at: '2026-08-02T10:00:01.000Z',
      source_currency: 'ARS',
      target_currency: 'USD',
      applied_rate: '0.0008',
      rate_provider: 'frankfurter',
      rate_fetched_at: '2026-08-02T09:59:00.000Z',
      destination_wallet_id: null,
      recipient_name: null,
      funding_method: null,
      movements: [
        {
          direction: 'debit',
          concept: 'principal',
          currency: 'ARS',
          amount: '100000',
          balance_before: '200000',
          balance_after: '100000',
          created_at: '2026-08-02T10:00:01.000Z',
        },
        {
          direction: 'credit',
          concept: 'principal',
          currency: 'USD',
          amount: '80',
          balance_before: '100',
          balance_after: '180',
          created_at: '2026-08-02T10:00:01.000Z',
        },
      ],
    },
  ]

  test('getCurrentTransactions consulta /transactions y mapea income a deposit', async () => {
    mockFetch.mockResolvedValue({ transactions: apiTransactions, pagination: { limit: 100, offset: 0, returned: 2 } })

    const txs = await getCurrentTransactions()

    expect(mockFetch).toHaveBeenCalledWith('/transactions?limit=100')
    expect(txs).toHaveLength(2)
    expect(txs[0]).toMatchObject({
      id: '30000000-0000-4000-8000-000000000001',
      type: 'deposit',
      currency_code: 'ARS',
      amount: 50000,
      description: 'Depósito de sueldo',
      status: 'completed',
    })
    expect(txs[1]).toMatchObject({
      type: 'conversion',
      currency_code: 'USD',
      amount: 80,
      from_currency: 'ARS',
      to_currency: 'USD',
    })
  })

  test('getRecentTransactions usa el límite en el query', async () => {
    mockFetch.mockResolvedValue({ transactions: apiTransactions, pagination: { limit: 5, offset: 0, returned: 2 } })

    const txs = await getRecentTransactions(5)

    expect(mockFetch).toHaveBeenCalledWith('/transactions?limit=5')
    expect(txs).toHaveLength(2)
  })

  test('getTransactionsByType filtra sobre el historial traído de la API', async () => {
    mockFetch.mockResolvedValue({ transactions: apiTransactions, pagination: { limit: 100, offset: 0, returned: 2 } })

    const conversions = await getTransactionsByType('conversion')

    expect(mockFetch).toHaveBeenCalledWith('/transactions?limit=100')
    expect(conversions).toHaveLength(1)
    expect(conversions[0].id).toBe('30000000-0000-4000-8000-000000000002')
  })

  test('getTransactionsByCurrency filtra sobre el historial traído de la API', async () => {
    mockFetch.mockResolvedValue({ transactions: apiTransactions, pagination: { limit: 100, offset: 0, returned: 2 } })

    const usd = await getTransactionsByCurrency('USD')

    expect(usd).toHaveLength(1)
    expect(usd[0].id).toBe('30000000-0000-4000-8000-000000000002')
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(getCurrentTransactions()).rejects.toThrow('Network error')
  })
})
