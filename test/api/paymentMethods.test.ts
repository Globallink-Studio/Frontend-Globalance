import {
  getPaymentMethodsList,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../../src/api/paymentMethods'
import { getMockPaymentMethods } from '../../src/mocks/storage'
import { getCurrentUserId } from '../../src/api/auth'
import { seedDemoUser } from '../fixtures/db'

describe('paymentMethods API', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedDemoUser()
  })

  test('lista los métodos de pago del usuario actual (sembrados al provisionar)', async () => {
    const methods = await getPaymentMethodsList()
    expect(methods).toHaveLength(2)
    expect(methods.map((m) => m.name)).toEqual(['Santander', 'Mercado Pago'])
    const userId = getCurrentUserId()
    expect(userId).not.toBeNull()
    expect(methods.every((m) => m.user_id === userId)).toBe(true)
  })

  test('agrega un método de pago para el usuario actual y persiste en storage', async () => {
    const created = await addPaymentMethod({
      type: 'bank',
      name: 'Banco Nación',
      last_four: '1234',
      currency_code: 'ARS',
      currency_name: 'Peso argentino',
    })

    expect(created.id).toBeTruthy()
    expect(created.user_id).toBe(getCurrentUserId())
    expect(created.name).toBe('Banco Nación')
    expect(created.created_at).toBeTruthy()

    const methods = await getPaymentMethodsList()
    expect(methods).toHaveLength(3)
    expect(methods.some((m) => m.name === 'Banco Nación')).toBe(true)

    const raw = getMockPaymentMethods()
    expect(raw.some((m) => m.id === created.id)).toBe(true)
  })

  test('valida los datos al crear un método de pago', async () => {
    await expect(
      addPaymentMethod({ type: 'bank', name: '', currency_code: 'ARS' }),
    ).rejects.toThrow('El nombre del método de pago es obligatorio')

    await expect(
      addPaymentMethod({ type: 'bank', name: 'Nación', currency_code: '' }),
    ).rejects.toThrow('La moneda del método de pago es obligatoria')

    await expect(
      addPaymentMethod({ type: 'crypto', name: 'Wallet', currency_code: 'BTC' } as never),
    ).rejects.toThrow('El tipo de método de pago es inválido')
  })

  test('actualiza un método de pago existente', async () => {
    const created = await addPaymentMethod({
      type: 'merchant',
      name: 'Mercado Pago',
      currency_code: 'ARS',
    })

    const updated = await updatePaymentMethod(created.id, { name: 'Mercado Pago 2', last_four: '9876' })
    expect(updated).toBeDefined()
    expect(updated!.name).toBe('Mercado Pago 2')
    expect(updated!.last_four).toBe('9876')

    const methods = await getPaymentMethodsList()
    const stored = methods.find((m) => m.id === created.id)
    expect(stored).toBeDefined()
    expect(stored!.name).toBe('Mercado Pago 2')
  })

  test('no actualiza un método que no existe', async () => {
    const updated = await updatePaymentMethod('no-existe', { name: 'X' })
    expect(updated).toBeUndefined()
  })

  test('elimina un método de pago', async () => {
    const created = await addPaymentMethod({
      type: 'bank',
      name: 'Banco Nación',
      currency_code: 'ARS',
    })

    await deletePaymentMethod(created.id)

    const methods = await getPaymentMethodsList()
    expect(methods.some((m) => m.id === created.id)).toBe(false)
    expect(getMockPaymentMethods().some((m) => m.id === created.id)).toBe(false)
  })
})
