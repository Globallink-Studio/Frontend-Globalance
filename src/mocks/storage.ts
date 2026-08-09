import type { User } from './data/users'
import type { PersonProfile } from './data/personProfiles'
import type { Wallet } from './data/wallets'
import type { Balance } from './data/balances'
import type { Card } from './data/cards'
import type { Transaction } from './data/transactions'
import type { Contact } from './data/contacts'
import type { AppNotification } from './data/notifications'
import type { PaymentMethod } from './data/paymentMethods'

const USERS_KEY = 'globalance.mock.users'
const PERSON_PROFILES_KEY = 'globalance.mock.personProfiles'
const WALLETS_KEY = 'globalance.mock.wallets'
const BALANCES_KEY = 'globalance.mock.balances'
const CARDS_KEY = 'globalance.mock.cards'
const TRANSACTIONS_KEY = 'globalance.mock.transactions'
const CONTACTS_KEY = 'globalance.mock.contacts'
const CONTACT_CATEGORIES_KEY = 'globalance.mock.contactCategories'
const NOTIFICATIONS_KEY = 'globalance.mock.notifications'
const PAYMENT_METHODS_KEY = 'globalance.mock.paymentMethods'

function readAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) {
      localStorage.setItem(key, '[]')
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    localStorage.setItem(key, '[]')
    return []
  }
}

function saveAll<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getMockUsers(): User[] {
  return readAll<User>(USERS_KEY)
}

export function addMockUser(user: User): void {
  saveAll(USERS_KEY, [...getMockUsers(), user])
}

export function updateMockUser(id: string, patch: Partial<User>): void {
  saveAll(USERS_KEY, getMockUsers().map((u) => (u.id === id ? { ...u, ...patch } : u)))
}

export function getMockPersonProfiles(): PersonProfile[] {
  return readAll<PersonProfile>(PERSON_PROFILES_KEY)
}

export function addMockPersonProfile(profile: PersonProfile): void {
  saveAll(PERSON_PROFILES_KEY, [...getMockPersonProfiles(), profile])
}

export function updateMockPersonProfile(userId: string, patch: Partial<PersonProfile>): void {
  saveAll(PERSON_PROFILES_KEY, getMockPersonProfiles().map((p) => (p.user_id === userId ? { ...p, ...patch } : p)))
}

export function getMockWallets(): Wallet[] {
  return readAll<Wallet>(WALLETS_KEY)
}

export function addMockWallet(wallet: Wallet): void {
  saveAll(WALLETS_KEY, [...getMockWallets(), wallet])
}

export function updateMockWallet(id: string, patch: Partial<Wallet>): void {
  saveAll(WALLETS_KEY, getMockWallets().map((w) => (w.id === id ? { ...w, ...patch } : w)))
}

export function getMockBalances(): Balance[] {
  return readAll<Balance>(BALANCES_KEY)
}

export function addMockBalances(items: Balance[]): void {
  saveAll(BALANCES_KEY, [...getMockBalances(), ...items])
}

export function saveMockBalances(items: Balance[]): void {
  saveAll(BALANCES_KEY, items)
}

export function getMockCards(): Card[] {
  return readAll<Card>(CARDS_KEY)
}

export function addMockCards(items: Card[]): void {
  saveAll(CARDS_KEY, [...getMockCards(), ...items])
}

function migrateConversionPair(t: Transaction): Transaction {
  if (t.type !== 'conversion' || (t.from_currency !== undefined && t.to_currency !== undefined)) return t
  const fromMatch = /Conversión desde\s+([A-Z]{3})/.exec(t.description)
  const toMatch = /Conversión a\s+([A-Z]{3})/.exec(t.description)
  const from = t.from_currency ?? (fromMatch ? fromMatch[1] : undefined)
  const to = t.to_currency ?? (toMatch ? toMatch[1] : t.currency_code)
  if (from === undefined && to === undefined) return t
  return { ...t, ...(from !== undefined ? { from_currency: from } : {}), ...(to !== undefined ? { to_currency: to } : {}) }
}

export function getMockTransactions(): Transaction[] {
  return readAll<Transaction>(TRANSACTIONS_KEY).map(migrateConversionPair)
}

export function addMockTransactions(items: Transaction[]): void {
  saveAll(TRANSACTIONS_KEY, [...getMockTransactions(), ...items])
}

export function saveMockTransactions(items: Transaction[]): void {
  saveAll(TRANSACTIONS_KEY, items)
}

export function getMockContacts(): Contact[] {
  return readAll<Contact>(CONTACTS_KEY).map((c) => ({
    ...c,
    ...(c.category === undefined ? { category: null } : {}),
    ...(c.email === undefined ? { email: null } : {}),
    ...(c.description === undefined ? { description: null } : {}),
    ...(c.favorite === undefined ? { favorite: false } : {}),
    ...(c.account === undefined ? { account: null } : {}),
    ...(c.currency_code === undefined ? { currency_code: null } : {}),
    ...(c.last_amount === undefined ? { last_amount: null } : {}),
    ...(c.last_activity === undefined ? { last_activity: null } : {}),
  }))
}

export function addMockContact(contact: Contact): void {
  saveAll(CONTACTS_KEY, [...getMockContacts(), contact])
}

export function updateMockContact(id: string, patch: Partial<Contact>): void {
  saveAll(CONTACTS_KEY, getMockContacts().map((c) => (c.id === id ? { ...c, ...patch } : c)))
}

export function saveMockContacts(items: Contact[]): void {
  saveAll(CONTACTS_KEY, items)
}

export function deleteMockContact(id: string): void {
  saveAll(CONTACTS_KEY, getMockContacts().filter((c) => c.id !== id))
}

export function getMockContactCategories(): string[] {
  return readAll<string>(CONTACT_CATEGORIES_KEY)
}

export function addMockContactCategory(name: string): void {
  const current = getMockContactCategories()
  if (!current.includes(name)) saveAll(CONTACT_CATEGORIES_KEY, [...current, name])
}

export function deleteMockContactCategory(name: string): void {
  saveAll(CONTACT_CATEGORIES_KEY, getMockContactCategories().filter((c) => c !== name))
  getMockContacts()
    .filter((c) => c.category === name)
    .forEach((c) => updateMockContact(c.id, { category: null }))
}

export function renameMockContactCategory(oldName: string, newName: string): void {
  if (oldName === newName) return
  saveAll(
    CONTACT_CATEGORIES_KEY,
    getMockContactCategories().map((c) => (c === oldName ? newName : c)),
  )
  getMockContacts()
    .filter((c) => (c.category ?? '').toLowerCase() === oldName.toLowerCase())
    .forEach((c) => updateMockContact(c.id, { category: newName }))
}

export function getMockNotifications(): AppNotification[] {
  return readAll<AppNotification>(NOTIFICATIONS_KEY).map((n) => ({
    ...n,
    ...(n.type === undefined ? { type: 'info' } : {}),
    ...(n.read === undefined ? { read: false } : {}),
    ...(n.created_at === undefined ? { created_at: new Date().toISOString() } : {}),
    ...(n.link === undefined ? { link: undefined } : {}),
  }))
}

export function addMockNotification(notification: AppNotification): void {
  saveAll(NOTIFICATIONS_KEY, [...getMockNotifications(), notification])
}

export function updateMockNotification(id: string, patch: Partial<AppNotification>): void {
  saveAll(
    NOTIFICATIONS_KEY,
    getMockNotifications().map((n) => (n.id === id ? { ...n, ...patch } : n)),
  )
}

export function saveMockNotifications(items: AppNotification[]): void {
  saveAll(NOTIFICATIONS_KEY, items)
}

export function deleteMockNotification(id: string): void {
  saveAll(NOTIFICATIONS_KEY, getMockNotifications().filter((n) => n.id !== id))
}

export function getMockPaymentMethods(): PaymentMethod[] {
  return readAll<PaymentMethod>(PAYMENT_METHODS_KEY).map((p) => ({
    ...p,
    ...(p.type === undefined ? { type: 'bank' as const } : {}),
    ...(p.last_four === undefined ? { last_four: '' } : {}),
    ...(p.currency_code === undefined ? { currency_code: 'ARS' } : {}),
    ...(p.currency_name === undefined ? { currency_name: '' } : {}),
    ...(p.created_at === undefined ? { created_at: new Date().toISOString() } : {}),
  }))
}

export function addMockPaymentMethod(method: PaymentMethod): void {
  saveAll(PAYMENT_METHODS_KEY, [...getMockPaymentMethods(), method])
}

export function updateMockPaymentMethod(id: string, patch: Partial<PaymentMethod>): void {
  saveAll(PAYMENT_METHODS_KEY, getMockPaymentMethods().map((p) => (p.id === id ? { ...p, ...patch } : p)))
}

export function saveMockPaymentMethods(items: PaymentMethod[]): void {
  saveAll(PAYMENT_METHODS_KEY, items)
}

export function deleteMockPaymentMethod(id: string): void {
  saveAll(PAYMENT_METHODS_KEY, getMockPaymentMethods().filter((p) => p.id !== id))
}
