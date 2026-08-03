import { delay } from '../delay'
import { balances } from '../data/balances'
import type { Balance } from '../data/balances'

export async function getBalances(): Promise<Balance[]> {
  await delay()
  return balances
}

export async function getBalancesByWallet(walletId: string): Promise<Balance[]> {
  await delay()
  return balances.filter((b) => b.wallet_id === walletId)
}

export async function adjustBalance(walletId: string, currencyCode: string, delta: number): Promise<Balance | undefined> {
  await delay()
  const balance = balances.find((b) => b.wallet_id === walletId && b.currency_code === currencyCode)
  if (!balance) {
    if (delta <= 0) return undefined
    const created: Balance = {
      id: crypto.randomUUID(),
      wallet_id: walletId,
      currency_code: currencyCode,
      amount: delta,
      updated_at: new Date().toISOString(),
    }
    balances.push(created)
    return created
  }
  balance.amount = balance.amount + delta
  balance.updated_at = new Date().toISOString()
  return balance
}
