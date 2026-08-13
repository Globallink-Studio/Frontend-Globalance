import { getCurrentCards, addCard, blockCard, unblockCard, deleteCard } from '../../src/api/cards'
import { getMockCards } from '../../src/mocks/storage'
import { getCurrentUserId } from '../../src/api/auth'
import { seedDemoUser } from '../fixtures/db'

describe('cards API', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedDemoUser()
  })

  test('lista las tarjetas del usuario actual (sembradas al provisionar)', async () => {
    const cards = await getCurrentCards()
    expect(cards).toHaveLength(3)
    const userId = getCurrentUserId()
    expect(userId).not.toBeNull()
    expect(cards.every((c) => c.user_id === userId)).toBe(true)
    expect(cards.every((c) => c.status === 'active')).toBe(true)
  })

  test('agrega una tarjeta con datos completos y persiste en storage', async () => {
    const created = await addCard({
      brand: 'visa',
      last_four: '5678',
      holder: 'Ana Pérez',
      expiry: '08/30',
    })

    expect(created.id).toBeTruthy()
    expect(created.user_id).toBe(getCurrentUserId())
    expect(created.brand).toBe('visa')
    expect(created.last_four).toBe('5678')
    expect(created.masked_number).toContain('5678')
    expect(created.holder).toBe('Ana Pérez')
    expect(created.expiry).toBe('08/30')
    expect(created.status).toBe('active')
    expect(created.created_at).toBeTruthy()

    const cards = await getCurrentCards()
    expect(cards).toHaveLength(4)
    expect(cards.some((c) => c.id === created.id)).toBe(true)

    const raw = getMockCards()
    expect(raw.some((c) => c.id === created.id)).toBe(true)
  })

  test('valida los datos al crear una tarjeta', async () => {
    await expect(
      addCard({ brand: 'amex', last_four: '5678', holder: 'Ana', expiry: '08/30' } as never),
    ).rejects.toThrow('La marca de la tarjeta es inválida')

    await expect(
      addCard({ brand: 'visa', last_four: '56', holder: 'Ana', expiry: '08/30' }),
    ).rejects.toThrow('Los últimos 4 dígitos son obligatorios')

    await expect(
      addCard({ brand: 'visa', last_four: '5678', holder: '', expiry: '08/30' }),
    ).rejects.toThrow('El titular de la tarjeta es obligatorio')

    await expect(
      addCard({ brand: 'visa', last_four: '5678', holder: 'Ana', expiry: '' }),
    ).rejects.toThrow('El vencimiento de la tarjeta es obligatorio')

    await expect(
      addCard({ brand: 'visa', last_four: '5678', holder: 'Ana', expiry: '01/20' }),
    ).rejects.toThrow('La tarjeta está vencida')
  })

  test('bloquea y desbloquea una tarjeta (toggle)', async () => {
    const created = await addCard({
      brand: 'visa',
      last_four: '5678',
      holder: 'Ana Pérez',
      expiry: '08/30',
    })

    const blocked = await blockCard(created.id)
    expect(blocked).toBeDefined()
    expect(blocked!.status).toBe('blocked')

    let stored = getMockCards().find((c) => c.id === created.id)
    expect(stored!.status).toBe('blocked')

    const unblocked = await unblockCard(created.id)
    expect(unblocked).toBeDefined()
    expect(unblocked!.status).toBe('active')

    stored = getMockCards().find((c) => c.id === created.id)
    expect(stored!.status).toBe('active')
  })

  test('no cambia el estado de una tarjeta que no existe', async () => {
    const blocked = await blockCard('no-existe')
    expect(blocked).toBeUndefined()
  })

  test('elimina una tarjeta', async () => {
    const created = await addCard({
      brand: 'mastercard',
      last_four: '9876',
      holder: 'Ana Pérez',
      expiry: '08/30',
    })

    await deleteCard(created.id)

    const cards = await getCurrentCards()
    expect(cards.some((c) => c.id === created.id)).toBe(false)
    expect(getMockCards().some((c) => c.id === created.id)).toBe(false)
  })
})
