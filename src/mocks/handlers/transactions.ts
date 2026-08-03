import { delay } from '../delay'
import { transactions } from '../data/transactions'
import type { Transaction } from '../data/transactions'

export async function getTransactions(): Promise<Transaction[]> {
  await delay()
  return transactions
}

export async function getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
  await delay()
  return transactions.filter((t) => t.wallet_id === walletId)
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  await delay()
  return [...transactions]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
}
