import { getCurrentContacts, createContact, deleteContact } from '../../src/api/contacts'
import { fetchApi } from '../../src/api/fetchApi'
import { seedDemoUser, JUAN_USER_ID } from '../fixtures/db'

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

describe('contacts API — modo mock (desarrollo local)', () => {
  beforeEach(async () => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
    mockFetch.mockReset()
    const { logout } = await import('../../src/api/auth')
    await logout()
  })

  test('getCurrentContacts devuelve los contactos del usuario', async () => {
    const seeded = await seedDemoUser()
    const contacts = await getCurrentContacts()
    expect(contacts.length).toBeGreaterThan(0)
    expect(contacts.every((c) => c.user_id === seeded.id)).toBe(true)
  })

  test('getCurrentContacts devuelve [] si no hay usuario activo', async () => {
    const contacts = await getCurrentContacts()
    expect(contacts).toEqual([])
  })

  test('createContact valida contra el directorio y agrega el contacto por número de cuenta', async () => {
    await seedDemoUser()
    const contact = await createContact({
      name: 'papá',
      contactType: 'account_number',
      contactValue: '0000000002',
    })
    expect(contact).toMatchObject({
      alias: 'papá',
      contact_type: 'account_number',
      contact_value: '0000000002',
      recipient_user_id: JUAN_USER_ID,
    })
  })

  test('createContact valida contra el directorio y agrega el contacto por alias', async () => {
    await seedDemoUser()
    const contact = await createContact({
      name: 'papá',
      contactType: 'alias',
      contactValue: 'juan.cash',
    })
    expect(contact).toMatchObject({
      alias: 'papá',
      contact_type: 'alias',
      contact_value: 'juan.cash',
      recipient_user_id: JUAN_USER_ID,
    })
  })

  test('createContact rechaza un número de cuenta inexistente', async () => {
    await seedDemoUser()
    await expect(
      createContact({ name: 'papá', contactType: 'account_number', contactValue: '9999999999' }),
    ).rejects.toThrow('No existe una billetera activa con ese número de cuenta')
  })

  test('createContact rechaza un alias inexistente', async () => {
    await seedDemoUser()
    await expect(
      createContact({ name: 'papá', contactType: 'alias', contactValue: 'nadie' }),
    ).rejects.toThrow('No existe una billetera activa con ese alias')
  })

  test('createContact rechaza sin nombre', async () => {
    await seedDemoUser()
    await expect(
      createContact({ name: ' ', contactType: 'account_number', contactValue: '0000000002' }),
    ).rejects.toThrow('Indicá un nombre para el contacto')
  })

  test('deleteContact elimina el contacto', async () => {
    await seedDemoUser()
    const [contact] = await getCurrentContacts()
    await deleteContact(contact.id)
    const remaining = await getCurrentContacts()
    expect(remaining.some((c) => c.id === contact.id)).toBe(false)
  })

  test('deleteContact rechaza sin id', async () => {
    await expect(deleteContact('')).rejects.toThrow('Falta el contacto a eliminar')
  })
})

describe('contacts API — modo firebase (API real)', () => {
  beforeEach(async () => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
    const { logout } = await import('../../src/api/auth')
    await logout()
  })

  const apiContact = {
    id: '60000000-0000-4000-8000-0000000000aa',
    user_id: '11111111-1111-4111-8111-111111111111',
    name: 'mamá',
    contact_type: 'account_number',
    contact_value: '0000000002',
    contact_wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    created_at: '2026-02-10T09:00:00.000Z',
  }

  test('getCurrentContacts mapea los contactos de GET /contacts', async () => {
    mockFetch.mockResolvedValue({ contacts: [apiContact] })

    const contacts = await getCurrentContacts()

    expect(mockFetch).toHaveBeenCalledWith('/contacts')
    expect(contacts).toHaveLength(1)
    expect(contacts[0]).toMatchObject({
      id: apiContact.id,
      user_id: apiContact.user_id,
      alias: 'mamá',
      account: '0000000002',
      recipient_user_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      email: null,
      phone: null,
      category: null,
      favorite: false,
      created_at: apiContact.created_at,
    })
  })

  test('getCurrentContacts devuelve [] si la API no trae contactos', async () => {
    mockFetch.mockResolvedValue({ contacts: [] })
    const contacts = await getCurrentContacts()
    expect(contacts).toEqual([])
  })

  test('createContact envía el número de cuenta cuando está presente', async () => {
    mockFetch.mockResolvedValue({ contact: apiContact })

    const contact = await createContact({
      name: 'mamá',
      contactType: 'account_number',
      contactValue: '0000000002',
    })

    expect(mockFetch).toHaveBeenCalledWith('/contacts', {
      method: 'POST',
      body: { name: 'mamá', type: 'account_number', value: '0000000002' },
    })
    expect(contact.alias).toBe('mamá')
    expect(contact.account).toBe('0000000002')
  })

  test('createContact usa el alias como valor cuando no hay cuenta', async () => {
    mockFetch.mockResolvedValue({ contact: { ...apiContact, contact_type: 'alias', contact_value: 'glb.mama' } })

    await createContact({
      name: 'mamá',
      contactType: 'alias',
      contactValue: 'glb.mama',
    })

    expect(mockFetch).toHaveBeenCalledWith('/contacts', {
      method: 'POST',
      body: { name: 'mamá', type: 'alias', value: 'glb.mama' },
    })
  })

  test('createContact rechaza sin nombre antes de llamar a la API', async () => {
    await expect(
      createContact({ name: '   ', contactType: 'alias', contactValue: 'glb.mama' }),
    ).rejects.toThrow('Indicá un nombre para el contacto')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('deleteContact elimina con DELETE /contacts/{id}', async () => {
    mockFetch.mockResolvedValue({ message: 'Contacto eliminado' })
    await deleteContact(apiContact.id)
    expect(mockFetch).toHaveBeenCalledWith(`/contacts/${apiContact.id}`, { method: 'DELETE' })
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(getCurrentContacts()).rejects.toThrow('Network error')
  })
})
