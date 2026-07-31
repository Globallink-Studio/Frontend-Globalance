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
