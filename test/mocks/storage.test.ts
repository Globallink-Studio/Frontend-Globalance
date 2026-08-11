import {
  getMockPaymentMethods,
  addMockPaymentMethod,
  updateMockPaymentMethod,
  saveMockPaymentMethods,
  deleteMockPaymentMethod,
  getMockContacts,
  addMockContact,
  saveMockContacts,
  deleteMockContact,
  getMockNotifications,
  addMockNotification,
  updateMockNotification,
  saveMockNotifications,
  deleteMockNotification,
  getMockTransactions,
} from '../../src/mocks/storage'
import type { PaymentMethod } from '../../src/mocks/data/paymentMethods'
import type { Contact } from '../../src/mocks/data/contacts'
import type { AppNotification } from '../../src/mocks/data/notifications'

const PAYMENT_METHODS_KEY = 'globalance.mock.paymentMethods'
const CONTACTS_KEY = 'globalance.mock.contacts'
const NOTIFICATIONS_KEY = 'globalance.mock.notifications'
const TRANSACTIONS_KEY = 'globalance.mock.transactions'

function buildMethod(overrides: Partial<PaymentMethod> = {}): PaymentMethod {
  return {
    id: 'pm-1',
    user_id: 'user-1',
    type: 'bank',
    name: 'Santander',
    last_four: '4471',
    currency_code: 'EUR',
    currency_name: 'Euro',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function buildContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 'c-1',
    user_id: 'user-1',
    recipient_user_id: 'user-2',
    alias: 'mamá',
    contact_type: 'account_number',
    contact_value: '0000000002',
    phone: '+54 11 5555-0301',
    email: 'juan@ejemplo.com',
    category: null,
    description: null,
    favorite: false,
    account: '0000000002',
    currency_code: 'USD',
    last_amount: null,
    last_activity: null,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function buildNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'n-1',
    user_id: 'user-1',
    type: 'info',
    title: 'Título',
    message: 'Mensaje',
    read: false,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('storage: paymentMethods', () => {
  test('arranca vacío y agrega métodos', () => {
    expect(getMockPaymentMethods()).toEqual([])
    addMockPaymentMethod(buildMethod())
    expect(getMockPaymentMethods()).toHaveLength(1)
  })

  test('actualiza con un patch parcial', () => {
    addMockPaymentMethod(buildMethod())
    updateMockPaymentMethod('pm-1', { name: 'Mercado Pago', last_four: '' })
    const [method] = getMockPaymentMethods()
    expect(method.name).toBe('Mercado Pago')
    expect(method.last_four).toBe('')
    expect(method.currency_code).toBe('EUR')
  })

  test('guarda el set completo reemplazando lo anterior', () => {
    addMockPaymentMethod(buildMethod({ id: 'pm-1' }))
    saveMockPaymentMethods([buildMethod({ id: 'pm-2', name: 'Nación' })])
    const methods = getMockPaymentMethods()
    expect(methods).toHaveLength(1)
    expect(methods[0].id).toBe('pm-2')
  })

  test('elimina un método', () => {
    addMockPaymentMethod(buildMethod({ id: 'pm-1' }))
    addMockPaymentMethod(buildMethod({ id: 'pm-2' }))
    deleteMockPaymentMethod('pm-1')
    expect(getMockPaymentMethods().map((m) => m.id)).toEqual(['pm-2'])
  })

  test('normaliza registros viejos del localStorage', () => {
    localStorage.setItem(
      PAYMENT_METHODS_KEY,
      JSON.stringify([{ id: 'pm-viejo', user_id: 'user-1', name: 'Viejo' }]),
    )
    const [method] = getMockPaymentMethods()
    expect(method.type).toBe('bank')
    expect(method.last_four).toBe('')
    expect(method.currency_code).toBe('ARS')
    expect(method.created_at).toBeTruthy()
  })
})

describe('storage: contacts', () => {
  test('agrega, guarda y elimina', () => {
    addMockContact(buildContact())
    expect(getMockContacts()).toHaveLength(1)

    saveMockContacts([])
    expect(getMockContacts()).toEqual([])

    addMockContact(buildContact({ id: 'c-2' }))
    deleteMockContact('c-2')
    expect(getMockContacts()).toEqual([])
  })

  test('normaliza registros viejos del localStorage', () => {
    localStorage.setItem(
      CONTACTS_KEY,
      JSON.stringify([{ id: 'c-viejo', user_id: 'user-1', recipient_user_id: 'user-2', alias: 'x' }]),
    )
    const [contact] = getMockContacts()
    expect(contact.category).toBeNull()
    expect(contact.email).toBeNull()
    expect(contact.description).toBeNull()
    expect(contact.favorite).toBe(false)
    expect(contact.account).toBeNull()
    expect(contact.contact_type).toBeNull()
    expect(contact.contact_value).toBeNull()
    expect(contact.currency_code).toBeNull()
    expect(contact.last_amount).toBeNull()
    expect(contact.last_activity).toBeNull()
  })

  test('deriva contact_type account_number de contactos viejos con account', () => {
    localStorage.setItem(
      CONTACTS_KEY,
      JSON.stringify([{ id: 'c-viejo', user_id: 'user-1', recipient_user_id: 'user-2', alias: 'x', account: '0000000002' }]),
    )
    const [contact] = getMockContacts()
    expect(contact.contact_type).toBe('account_number')
    expect(contact.contact_value).toBe('0000000002')
  })
})

describe('storage: notifications', () => {
  test('agrega, actualiza, guarda y elimina', () => {
    addMockNotification(buildNotification())
    expect(getMockNotifications()).toHaveLength(1)

    updateMockNotification('n-1', { read: true })
    expect(getMockNotifications()[0].read).toBe(true)

    saveMockNotifications([])
    expect(getMockNotifications()).toEqual([])

    addMockNotification(buildNotification({ id: 'n-2' }))
    deleteMockNotification('n-2')
    expect(getMockNotifications()).toEqual([])
  })

  test('normaliza registros viejos del localStorage', () => {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify([{ id: 'n-viejo', user_id: 'user-1', title: 'T', message: 'M' }]),
    )
    const [notification] = getMockNotifications()
    expect(notification.type).toBe('info')
    expect(notification.read).toBe(false)
    expect(notification.created_at).toBeTruthy()
  })
})

describe('storage: transactions', () => {
  test('normaliza pares de conversión de registros viejos del localStorage', () => {
    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([
        {
          id: 't-1',
          wallet_id: 'w-1',
          currency_code: 'USD',
          type: 'conversion',
          amount: 500,
          description: 'Conversión desde EUR',
          status: 'completed',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 't-2',
          wallet_id: 'w-1',
          currency_code: 'EUR',
          type: 'deposit',
          amount: 100,
          description: 'Depósito',
          status: 'completed',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ]),
    )
    const txns = getMockTransactions()
    expect(txns[0].from_currency).toBe('EUR')
    expect(txns[0].to_currency).toBe('USD')
    expect(txns[1].from_currency).toBeUndefined()
    expect(txns[1].to_currency).toBeUndefined()
  })
})
