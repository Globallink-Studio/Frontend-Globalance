import type { User } from './data/users'
import type { PersonProfile } from './data/personProfiles'
import type { Wallet } from './data/wallets'
import type { Balance } from './data/balances'
import type { Card } from './data/cards'
import type { Transaction } from './data/transactions'

const USERS_KEY = 'globalance.mock.users'
const PERSON_PROFILES_KEY = 'globalance.mock.personProfiles'
const WALLETS_KEY = 'globalance.mock.wallets'
const BALANCES_KEY = 'globalance.mock.balances'
const CARDS_KEY = 'globalance.mock.cards'
const TRANSACTIONS_KEY = 'globalance.mock.transactions'

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

export function getMockTransactions(): Transaction[] {
  return readAll<Transaction>(TRANSACTIONS_KEY)
}

export function addMockTransactions(items: Transaction[]): void {
  saveAll(TRANSACTIONS_KEY, [...getMockTransactions(), ...items])
}

export function saveMockTransactions(items: Transaction[]): void {
  saveAll(TRANSACTIONS_KEY, items)
}
