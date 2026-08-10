import { getCurrentUser, getCurrentUserProfile } from '../../src/api/users'
import { refreshCachedUser, logout } from '../../src/api/auth'
import { fetchApi } from '../../src/api/fetchApi'
import { seedDemoUser } from '../fixtures/db'
import type { User } from '../../src/mocks/data/users'

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

describe('users API — modo mock (desarrollo local)', () => {
  beforeEach(async () => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
    mockFetch.mockReset()
    await logout()
  })

  test('getCurrentUser devuelve el usuario logueado', async () => {
    const seeded = await seedDemoUser()
    const user = await getCurrentUser()
    expect(user).toBeDefined()
    expect(user!.email).toBe(seeded.email)
    expect(user!.id).toBe(seeded.id)
  })

  test('getCurrentUser devuelve undefined sin usuario activo', async () => {
    const user = await getCurrentUser()
    expect(user).toBeUndefined()
  })

  test('getCurrentUserProfile devuelve el perfil de persona del usuario logueado', async () => {
    await seedDemoUser()
    const profile = await getCurrentUserProfile()
    expect(profile).toBeDefined()
    expect(profile).toHaveProperty('first_name')
    expect(profile).not.toHaveProperty('legal_name')
  })

  test('getCurrentUserProfile devuelve undefined sin usuario activo', async () => {
    const profile = await getCurrentUserProfile()
    expect(profile).toBeUndefined()
  })
})

describe('users API — modo firebase (API real)', () => {
  beforeEach(async () => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
    await logout()
  })

  test('getCurrentUser devuelve el usuario cacheado', async () => {
    const user: User = {
      id: '11111111-1111-4111-8111-111111111111',
      firebase_uid: 'firebase-uid-test',
      email: 'sofia@test.com',
      user_type: 'person',
      display_currency: 'ARS',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      last_access_at: null,
    }
    refreshCachedUser(user)

    const current = await getCurrentUser()
    expect(current).toBeDefined()
    expect(current!.email).toBe('sofia@test.com')
    expect(current!.id).toBe('11111111-1111-4111-8111-111111111111')
  })

  test('getCurrentUserProfile consulta /users/profile y mapea una persona', async () => {
    mockFetch.mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        user_type: 'person',
        first_name: 'Sofía',
        last_name: 'Martínez',
      },
    })

    const profile = await getCurrentUserProfile()

    expect(mockFetch).toHaveBeenCalledWith('/users/profile')
    expect(profile).toMatchObject({
      user_id: '11111111-1111-4111-8111-111111111111',
      first_name: 'Sofía',
      last_name: 'Martínez',
    })
    expect(profile).not.toHaveProperty('legal_name')
  })

  test('getCurrentUserProfile mapea una empresa', async () => {
    mockFetch.mockResolvedValue({
      data: {
        id: '55555555-5555-4555-8555-555555555555',
        user_type: 'company',
        legal_name: 'Globallink Studio S.R.L.',
      },
    })

    const profile = await getCurrentUserProfile()

    expect(profile).toMatchObject({
      user_id: '55555555-5555-4555-8555-555555555555',
      legal_name: 'Globallink Studio S.R.L.',
    })
    expect(profile).not.toHaveProperty('first_name')
  })

  test('getCurrentUserProfile usa legal_name como empresa cuando user_type es null', async () => {
    mockFetch.mockResolvedValue({
      data: {
        id: '55555555-5555-4555-8555-555555555555',
        user_type: null,
        legal_name: 'Globallink Studio S.R.L.',
      },
    })

    const profile = await getCurrentUserProfile()

    expect(profile).toMatchObject({
      user_id: '55555555-5555-4555-8555-555555555555',
      legal_name: 'Globallink Studio S.R.L.',
    })
  })

  test('getCurrentUserProfile devuelve undefined si la API no trae datos', async () => {
    mockFetch.mockResolvedValue({ data: null })
    const profile = await getCurrentUserProfile()
    expect(profile).toBeUndefined()
  })

  test('getCurrentUserProfile propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(getCurrentUserProfile()).rejects.toThrow('Network error')
  })
})
