import { delay } from '../delay'
import { getMockTransactions, saveMockTransactions } from '../storage'
import type { Transaction, TransactionStatus } from '../data/transactions'

export async function getTransactions(): Promise<Transaction[]> {
  await delay()
  return getMockTransactions()
}

export async function getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
  await delay()
  return getMockTransactions().filter((t) => t.wallet_id === walletId)
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  await delay()
  return [...getMockTransactions()]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
}

export async function createTransaction(input: {
  wallet_id: string
  currency_code: string
  type: Transaction['type']
  amount: number
  description: string
  status?: TransactionStatus
}): Promise<Transaction> {
  await delay()
  const tx: Transaction = {
    id: crypto.randomUUID(),
    wallet_id: input.wallet_id,
    currency_code: input.currency_code,
    type: input.type,
    amount: input.amount,
    description: input.description,
    status: input.status ?? 'completed',
    created_at: new Date().toISOString(),
  }
  saveMockTransactions([tx, ...getMockTransactions()])
  return tx
}

export async function setTransactionStatus(id: string, status: TransactionStatus): Promise<Transaction | undefined> {
  await delay(300)
  const all = getMockTransactions()
  const tx = all.find((t) => t.id === id)
  if (tx) {
    tx.status = status
    saveMockTransactions(all)
  }
  return tx
}
