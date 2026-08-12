import { getCurrentUser, getCurrentUserProfile, updateCurrentPersonProfile, updateCurrentCompanyProfile, createCurrentUserPersonProfile } from '../../src/api/users'
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

  test('updateCurrentPersonProfile actualiza el perfil de la persona logueada', async () => {
    await seedDemoUser()

    const updated = await updateCurrentPersonProfile({
      first_name: 'Sofi',
      last_name: 'Martínez',
      document: 'DNI 40123456',
      phone: '+54 11 5555-0101',
    })

    expect(updated).toMatchObject({
      first_name: 'Sofi',
      last_name: 'Martínez',
      document: 'DNI 40123456',
      phone: '+54 11 5555-0101',
    })
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

  test('getCurrentUser consulta /auth/me y arma el usuario si no hay caché', async () => {
    mockFetch.mockResolvedValue({
      data: { uid: 'firebase-uid-test', email: 'sofia@test.com', name: 'Sofía Martínez' },
    })

    const current = await getCurrentUser()

    expect(mockFetch).toHaveBeenCalledWith('/auth/me')
    expect(current).toBeDefined()
    expect(current!.id).toBe('firebase-uid-test')
    expect(current!.firebase_uid).toBe('firebase-uid-test')
    expect(current!.email).toBe('sofia@test.com')
    expect(current!.user_type).toBe('person')
  })

  test('getCurrentUser devuelve undefined si /auth/me no trae uid', async () => {
    mockFetch.mockResolvedValue({ data: null })
    const current = await getCurrentUser()
    expect(current).toBeUndefined()
  })

  test('getCurrentUser propaga los errores de /auth/me', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(getCurrentUser()).rejects.toThrow('Network error')
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

  test('getCurrentUserProfile separa el nombre completo cuando el back manda first_name sin last_name', async () => {
    mockFetch.mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        user_type: 'person',
        first_name: 'Sofía Martínez',
        last_name: '',
      },
    })

    const profile = await getCurrentUserProfile()

    expect(profile).toMatchObject({
      user_id: '11111111-1111-4111-8111-111111111111',
      first_name: 'Sofía',
      last_name: 'Martínez',
    })
  })

  test('getCurrentUserProfile no divide el nombre cuando last_name ya existe', async () => {
    mockFetch.mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        user_type: 'person',
        first_name: 'Sofía',
        last_name: 'Martínez',
      },
    })

    const profile = await getCurrentUserProfile()

    expect(profile).toMatchObject({
      first_name: 'Sofía',
      last_name: 'Martínez',
    })
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

  test('updateCurrentPersonProfile envía los campos editables a PATCH /users/profile sin documento ni userType', async () => {
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
    mockFetch
      .mockResolvedValueOnce({
        data: {
          id: '11111111-1111-4111-8111-111111111111',
          user_type: 'person',
          display_currency: 'ARS',
          first_name: 'Sofía',
          last_name: 'Martínez',
          document: 'DNI 40123456',
          phone: '+54 11 5555-0101',
        },
      })
      .mockResolvedValueOnce({ wallet: { alias: 'sofia.martinez' } })
      .mockResolvedValueOnce({ data: { message: 'Perfil actualizado correctamente.' } })

    const updated = await updateCurrentPersonProfile({
      first_name: 'Sofi',
      last_name: 'Martínez',
      phone: '+54 11 5555-0101',
      alias: 'sofia.nueva',
      displayCurrency: 'USD',
      timezone: 'America/Argentina/Buenos_Aires',
    })

    expect(mockFetch).toHaveBeenNthCalledWith(1, '/users/profile')
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/wallet')
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/users/profile', {
      method: 'PATCH',
      body: {
        firstName: 'Sofi',
        lastName: 'Martínez',
        phone: '+54 11 5555-0101',
        alias: 'sofia.nueva',
        displayCurrency: 'USD',
        timezone: 'America/Argentina/Buenos_Aires',
      },
    })
    expect(updated).toMatchObject({
      user_id: '11111111-1111-4111-8111-111111111111',
      first_name: 'Sofi',
      document: 'DNI 40123456',
      phone: '+54 11 5555-0101',
    })
  })

  test('updateCurrentPersonProfile completa alias y displayCurrency desde el backend si el patch no los trae', async () => {
    const user: User = {
      id: '11111111-1111-4111-8111-111111111111',
      firebase_uid: 'firebase-uid-test',
      email: 'sofia@test.com',
      user_type: 'person',
      display_currency: 'USD',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      last_access_at: null,
    }
    refreshCachedUser(user)
    mockFetch
      .mockResolvedValueOnce({
        data: {
          id: '11111111-1111-4111-8111-111111111111',
          user_type: 'person',
          display_currency: 'USD',
          first_name: 'Sofía',
          last_name: 'Martínez',
        },
      })
      .mockResolvedValueOnce({ wallet: { alias: 'sofia.martinez' } })
      .mockResolvedValueOnce({ data: { message: 'Perfil actualizado correctamente.' } })

    await updateCurrentPersonProfile({ first_name: 'Sofi' })

    expect(mockFetch).toHaveBeenNthCalledWith(3, '/users/profile', {
      method: 'PATCH',
      body: expect.objectContaining({
        firstName: 'Sofi',
        lastName: 'Martínez',
        alias: 'sofia.martinez',
        displayCurrency: 'USD',
      }),
    })
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      '/users/profile',
      expect.not.objectContaining({ document: '', phone: '' }),
    )
  })

  test('updateCurrentPersonProfile no envía alias vacío cuando no hay alias conocido', async () => {
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
    mockFetch
      .mockResolvedValueOnce({
        data: {
          id: '11111111-1111-4111-8111-111111111111',
          user_type: 'person',
          display_currency: 'ARS',
          first_name: 'Sofía',
          last_name: 'Martínez',
        },
      })
      .mockResolvedValueOnce({ wallet: {} })
      .mockResolvedValueOnce({ data: { message: 'Perfil actualizado correctamente.' } })

    await updateCurrentPersonProfile({ first_name: 'Sofi' })

    const patchBody = mockFetch.mock.calls[2][1] as { body: Record<string, string> }
    expect(patchBody.body).not.toHaveProperty('alias')
  })

  test('updateCurrentPersonProfile propaga los errores de la API', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    await expect(updateCurrentPersonProfile({ first_name: 'Sofi' })).rejects.toThrow('Network error')
  })

  test('createCurrentUserPersonProfile crea el perfil con POST /users/profile (onboarding)', async () => {
    const user: User = {
      id: '11111111-1111-4111-8111-111111111111',
      firebase_uid: 'firebase-uid-test',
      email: 'sofia@test.com',
      user_type: null,
      display_currency: 'ARS',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      last_access_at: null,
    }
    refreshCachedUser(user)
    mockFetch.mockResolvedValueOnce({ data: { message: 'Perfil completado correctamente.' } })

    const created = await createCurrentUserPersonProfile({
      first_name: 'Sofía',
      last_name: 'Martínez',
      document: 'DNI 40123456',
      phone: '+54 11 5555-0101',
      alias: 'sofia.martinez',
      display_currency: 'ARS',
    })

    expect(mockFetch).toHaveBeenCalledWith('/users/profile', {
      method: 'POST',
      body: {
        userType: 'person',
        firstName: 'Sofía',
        lastName: 'Martínez',
        document: 'DNI 40123456',
        phone: '+54 11 5555-0101',
        alias: 'sofia.martinez',
        displayCurrency: 'ARS',
      },
    })
    expect(created).toBeDefined()
  })

  test('createCurrentUserPersonProfile envía timezone solo si se pasa', async () => {
    const user: User = {
      id: '11111111-1111-4111-8111-111111111111',
      firebase_uid: 'firebase-uid-test',
      email: 'sofia@test.com',
      user_type: null,
      display_currency: 'ARS',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      last_access_at: null,
    }
    refreshCachedUser(user)
    mockFetch.mockResolvedValueOnce({ data: { message: 'Perfil completado correctamente.' } })

    await createCurrentUserPersonProfile({
      first_name: 'Sofía',
      last_name: 'Martínez',
      document: 'DNI 40123456',
      phone: '+54 11 5555-0101',
      alias: 'sofia.martinez',
      display_currency: 'ARS',
      timezone: 'America/Argentina/Buenos_Aires',
    })

    expect(mockFetch).toHaveBeenCalledWith('/users/profile', {
      method: 'POST',
      body: expect.objectContaining({
        timezone: 'America/Argentina/Buenos_Aires',
      }),
    })
  })

  test('updateCurrentCompanyProfile envía legalName y campos editables a PATCH /users/profile', async () => {
    const user: User = {
      id: '55555555-5555-4555-8555-555555555555',
      firebase_uid: 'firebase-uid-test',
      email: 'empresa@test.com',
      user_type: 'company',
      display_currency: 'ARS',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      last_access_at: null,
    }
    refreshCachedUser(user)
    mockFetch
      .mockResolvedValueOnce({
        data: {
          id: '55555555-5555-4555-8555-555555555555',
          user_type: 'company',
          display_currency: 'ARS',
          legal_name: 'Globallink Studio S.R.L.',
          document: 'CUIT 30-71234567-8',
          phone: '+54 11 5555-0201',
        },
      })
      .mockResolvedValueOnce({ wallet: { alias: 'globalance.empresa' } })
      .mockResolvedValueOnce({ data: { message: 'Perfil actualizado correctamente.' } })

    const updated = await updateCurrentCompanyProfile({
      legal_name: 'Globallink Studio S.A.',
      phone: '+54 11 5555-0201',
      alias: 'globalance.empresa',
      displayCurrency: 'USD',
    })

    expect(mockFetch).toHaveBeenNthCalledWith(3, '/users/profile', {
      method: 'PATCH',
      body: {
        legalName: 'Globallink Studio S.A.',
        phone: '+54 11 5555-0201',
        alias: 'globalance.empresa',
        displayCurrency: 'USD',
      },
    })
    expect(updated).toMatchObject({
      user_id: '55555555-5555-4555-8555-555555555555',
      legal_name: 'Globallink Studio S.A.',
      document: 'CUIT 30-71234567-8',
    })
  })
})
