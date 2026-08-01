import { getTransactions } from '../mocks/handlers/transactions'
import { getCurrentWallet } from './wallets'
import type { Transaction, TransactionType } from '../mocks/data/transactions'

async function getCurrentWalletTransactions(): Promise<Transaction[]> {
  const wallet = await getCurrentWallet()
  if (!wallet) return []
  const all = await getTransactions()
  return all
    .filter((t) => t.wallet_id === wallet.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const all = await getCurrentWalletTransactions()
  return all.slice(0, limit)
}

export async function getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  const all = await getCurrentWalletTransactions()
  return all.filter((t) => t.type === type)
}

export async function getTransactionsByCurrency(currencyCode: string): Promise<Transaction[]> {
  const all = await getCurrentWalletTransactions()
  return all.filter((t) => t.currency_code === currencyCode)
}
