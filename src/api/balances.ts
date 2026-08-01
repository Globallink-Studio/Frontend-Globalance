import { getBalancesByWallet } from '../mocks/handlers/balances'
import { currencies } from '../mocks/data/currencies'
import { getCurrentWallet } from './wallets'
import type { Balance } from '../mocks/data/balances'

export interface BalanceSummaryItem {
  currency_code: string
  currency_name: string
  symbol: string
  amount: number
}

export async function getCurrentBalances(): Promise<Balance[]> {
  const wallet = await getCurrentWallet()
  if (!wallet) return []
  return getBalancesByWallet(wallet.id)
}

export async function getCurrentBalanceSummary(): Promise<BalanceSummaryItem[]> {
  const wallet = await getCurrentWallet()
  if (!wallet) return []
  const balances = await getBalancesByWallet(wallet.id)
  return currencies
    .filter((c) => c.active)
    .map((c) => {
      const balance = balances.find((b) => b.currency_code === c.code)
      return {
        currency_code: c.code,
        currency_name: c.name,
        symbol: c.symbol,
        amount: balance?.amount ?? 0,
      }
    })
}
