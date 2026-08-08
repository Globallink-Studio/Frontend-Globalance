import { delay } from '../delay'
import { getMockContacts, addMockContact, updateMockContact, deleteMockContact } from '../storage'
import { getMockUsers, getMockWallets, getMockBalances } from '../storage'
import type { Contact } from '../data/contacts'
import type { User } from '../data/users'
import type { Wallet } from '../data/wallets'
import type { Balance } from '../data/balances'
import { users as seedUsers } from '../data/users'
import { wallets as seedWallets } from '../data/wallets'
import { balances as seedBalances } from '../data/balances'

// El "directorio demo": para que las validaciones de contactos tengan contra
// quién validar en modo mock, se busca primero en storage (siembra de
// provisionDemoDirectory) y como respaldo en los seeds de data/*.
function directoryUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase()
  return (
    getMockUsers().find((u) => u.email.toLowerCase() === normalized) ??
    seedUsers.find((u) => u.email.toLowerCase() === normalized)
  )
}

function directoryWalletByUserId(userId: string): Wallet | undefined {
  return getMockWallets().find((w) => w.user_id === userId) ?? seedWallets.find((w) => w.user_id === userId)
}

function directoryBalancesByWalletId(walletId: string): Balance[] {
  const fromStorage = getMockBalances().filter((b) => b.wallet_id === walletId)
  return fromStorage.length > 0 ? fromStorage : seedBalances.filter((b) => b.wallet_id === walletId)
}

function validateContactFields(input: {
  alias?: string | null
  email?: string | null
  account?: string | null
}): { email: string; recipientUserId: string; currency: string | null } {
  if (!input.alias?.trim()) throw new Error('El alias es obligatorio')
  if (!input.account?.trim()) throw new Error('La cuenta es obligatoria')
  if (!input.email?.trim()) throw new Error('El correo electrónico es obligatorio')

  const email = input.email.trim().toLowerCase()
  const user = directoryUserByEmail(email)
  if (!user) throw new Error('No existe un usuario registrado con ese correo electrónico')

  const wallet = directoryWalletByUserId(user.id)
  if (!wallet || wallet.account_number !== input.account.trim()) {
    throw new Error('La cuenta no coincide con las cuentas registradas de ese usuario')
  }

  const balances = directoryBalancesByWalletId(wallet.id)
  const currency = balances[0]?.currency_code ?? user.display_currency ?? null

  return { email, recipientUserId: user.id, currency }
}

export async function getContacts(): Promise<Contact[]> {
  await delay()
  return getMockContacts()
}

export async function getContactsByUserId(userId: string): Promise<Contact[]> {
  await delay()
  return getMockContacts().filter((c) => c.user_id === userId)
}

export async function createContact(input: {
  userId: string
  recipientUserId: string
  alias: string
  phone?: string | null
  email?: string | null
  category?: string | null
  description?: string | null
  favorite?: boolean
  account?: string | null
}): Promise<Contact> {
  await delay()
  const resolved = validateContactFields({
    alias: input.alias,
    email: input.email,
    account: input.account,
  })

  const contact: Contact = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    recipient_user_id: resolved.recipientUserId,
    alias: input.alias.trim(),
    phone: input.phone ?? null,
    email: resolved.email,
    category: input.category ?? null,
    description: input.description ?? null,
    favorite: input.favorite ?? false,
    account: input.account?.trim() ?? null,
    currency_code: resolved.currency,
    last_amount: null,
    last_activity: null,
    created_at: new Date().toISOString(),
  }
  addMockContact(contact)
  return contact
}

export async function updateContact(id: string, patch: Partial<Contact>): Promise<Contact | undefined> {
  await delay()
  const current = getMockContacts().find((c) => c.id === id)
  if (!current) return undefined

  const next: Partial<Contact> = { ...patch }
  if (patch.email !== undefined || patch.account !== undefined || patch.alias !== undefined) {
    const resolved = validateContactFields({
      alias: patch.alias ?? current.alias,
      email: patch.email ?? current.email,
      account: patch.account ?? current.account,
    })
    next.email = resolved.email
    next.recipient_user_id = resolved.recipientUserId
    next.currency_code = resolved.currency
  }

  updateMockContact(id, next)
  return { ...current, ...next }
}

export async function removeContact(id: string): Promise<void> {
  await delay()
  deleteMockContact(id)
}
