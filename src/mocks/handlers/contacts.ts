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
function directoryUserByUserId(userId: string): User | undefined {
  return getMockUsers().find((u) => u.id === userId) ?? seedUsers.find((u) => u.id === userId)
}

function directoryWalletByAlias(alias: string): Wallet | undefined {
  const normalized = alias.trim().toLowerCase()
  return (
    getMockWallets().find((w) => w.alias.toLowerCase() === normalized) ??
    seedWallets.find((w) => w.alias.toLowerCase() === normalized)
  )
}

function directoryWalletByAccount(account: string): Wallet | undefined {
  const normalized = account.trim()
  return (
    getMockWallets().find((w) => w.account_number === normalized) ??
    seedWallets.find((w) => w.account_number === normalized)
  )
}

function directoryBalancesByWalletId(walletId: string): Balance[] {
  const fromStorage = getMockBalances().filter((b) => b.wallet_id === walletId)
  return fromStorage.length > 0 ? fromStorage : seedBalances.filter((b) => b.wallet_id === walletId)
}

function resolveContactDestination(input: {
  name?: string | null
  contactType?: 'alias' | 'account_number' | null
  contactValue?: string | null
}): { recipientUserId: string; currency: string | null } {
  if (!input.name?.trim()) throw new Error('El nombre del contacto es obligatorio')
  if (!input.contactValue?.trim()) {
    throw new Error(input.contactType === 'account_number' ? 'La cuenta es obligatoria' : 'El alias es obligatorio')
  }

  const wallet =
    input.contactType === 'account_number'
      ? directoryWalletByAccount(input.contactValue)
      : directoryWalletByAlias(input.contactValue)

  if (!wallet || wallet.status !== 'active') {
    throw new Error(
      input.contactType === 'account_number'
        ? 'No existe una billetera activa con ese número de cuenta'
        : 'No existe una billetera activa con ese alias',
    )
  }

  const user = directoryUserByUserId(wallet.user_id)
  const balances = directoryBalancesByWalletId(wallet.id)
  const currency = balances[0]?.currency_code ?? user?.display_currency ?? null

  return { recipientUserId: wallet.user_id, currency }
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
  name: string
  contactType: 'alias' | 'account_number'
  contactValue: string
}): Promise<Contact> {
  await delay()
  const resolved = resolveContactDestination(input)

  const contact: Contact = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    recipient_user_id: resolved.recipientUserId,
    alias: input.name.trim(),
    contact_type: input.contactType,
    contact_value: input.contactValue.trim(),
    currency_code: resolved.currency,
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

  const nextAlias = patch.alias ?? current.alias
  const nextContactType = patch.contact_type ?? (patch.account !== undefined ? 'account_number' : current.contact_type)
  const nextContactValue = patch.contact_value ?? patch.account ?? current.contact_value ?? current.account

  if (
    patch.alias !== undefined ||
    patch.contact_type !== undefined ||
    patch.contact_value !== undefined ||
    patch.account !== undefined
  ) {
    const resolved = resolveContactDestination({
      name: nextAlias,
      contactType: nextContactType,
      contactValue: nextContactValue,
    })
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
