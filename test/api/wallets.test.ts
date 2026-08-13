import { getWalletByAccountNumber, getWalletByAlias } from '../../src/api/wallets'
import { seedDemoUser } from '../fixtures/db'

const { getAuthModeMock } = vi.hoisted(() => ({ getAuthModeMock: vi.fn(() => 'mock') }))

vi.mock('../../src/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/auth')>()
  return { ...actual, getAuthMode: getAuthModeMock }
})

describe('getWalletByAccountNumber', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('encuentra la billetera por número de cuenta', async () => {
    await seedDemoUser()

    const wallet = await getWalletByAccountNumber('0000000002')
    expect(wallet).toBeDefined()
    expect(wallet!.alias).toBe('juan.cash')
    expect(wallet!.user_id).toBe('22222222-2222-4222-8222-222222222222')
  })

  test('ignora espacios alrededor del número de cuenta', async () => {
    await seedDemoUser()

    const wallet = await getWalletByAccountNumber(' 0000000002 ')
    expect(wallet).toBeDefined()
    expect(wallet!.alias).toBe('juan.cash')
  })

  test('devuelve undefined si el número de cuenta no existe', async () => {
    await seedDemoUser()

    const wallet = await getWalletByAccountNumber('9999999999')
    expect(wallet).toBeUndefined()
  })

  test('getWalletByAlias sigue encontrando por alias', async () => {
    await seedDemoUser()

    const wallet = await getWalletByAlias('juan.cash')
    expect(wallet).toBeDefined()
    expect(wallet!.account_number).toBe('0000000002')
  })
})
