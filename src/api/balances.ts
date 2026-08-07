import { getBalancesByWallet } from '../mocks/handlers/balances'
import { currencies } from '../mocks/data/currencies'
import { getAuthMode } from './auth'
import { fetchApi } from './fetchApi'
import { getCurrentWallet } from './wallets'
import type { Balance } from '../mocks/data/balances'

export interface BalanceSummaryItem {
  currency_code: string
  currency_name: string
  symbol: string
  amount: number
}

interface ApiBalance {
  id: string
  wallet_id: string
  currency_code: string
  amount: string
  updated_at: string
}

export async function getCurrentBalances(): Promise<Balance[]> {
  if (getAuthMode() === 'mock') {
    const wallet = await getCurrentWallet()
    if (!wallet) return []
    return getBalancesByWallet(wallet.id)
  }
  const resp = await fetchApi<{ balances: ApiBalance[] }>('/balances')
  return resp.balances.map((b) => ({ ...b, amount: Number(b.amount) }))
}

export async function getCurrentBalanceSummary(): Promise<BalanceSummaryItem[]> {
  const balances = await getCurrentBalances()
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
