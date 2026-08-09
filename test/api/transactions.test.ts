import { createTransfer } from '../../src/api/transactions'
import { getCurrentWallet, getWalletByUserId } from '../../src/api/wallets'
import { getBalancesByWallet } from '../../src/mocks/handlers/balances'
import { getTransactionsByWallet } from '../../src/mocks/handlers/transactions'
import { DEMO_USER_EMAIL, JUAN_USER_ID, seedDemoUser } from '../fixtures/db'

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
