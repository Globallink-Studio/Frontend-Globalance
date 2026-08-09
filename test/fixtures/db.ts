import { login } from '../../src/api/auth'
import { getCurrentWallet } from '../../src/api/wallets'
import { getMockTransactions, saveMockTransactions } from '../../src/mocks/storage'
import type { Transaction } from '../../src/mocks/data/transactions'
import type { User } from '../../src/mocks/data/users'

export const DEMO_USER_EMAIL = 'sofia@test.com'

export const JUAN_USER_ID = '22222222-2222-4222-8222-222222222222'

export async function seedDemoUser(): Promise<User> {
  return login(DEMO_USER_EMAIL, 'test-password')
}

export function buildDepositTransactions(walletId: string, count: number): Transaction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `20000000-0000-4000-8000-${String(900000000001 + i)}`,
    wallet_id: walletId,
    currency_code: 'ARS',
    type: 'deposit' as const,
    amount: 1000 + i * 100,
    description: `Movimiento extra ${i + 1}`,
    status: 'completed' as const,
    created_at: `2026-07-${String(10 + (i % 19)).padStart(2, '0')}T12:00:00.000Z`,
  }))
}

export async function seedExtraTransactions(walletId: string, count: number): Promise<void> {
  saveMockTransactions([...getMockTransactions(), ...buildDepositTransactions(walletId, count)])
}

export async function seedDemoWallet(): Promise<string> {
  const wallet = await getCurrentWallet()
  if (!wallet) throw new Error('No hay wallet activa')
  return wallet.id
}
