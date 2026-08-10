import { createTransfer, createWithdrawal, createConversion } from '../../src/api/transactions'
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
