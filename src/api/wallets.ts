import { getWalletById, getWalletByUserId, getWalletByAlias, getWallets, updateWallet } from '../mocks/handlers/wallets'
import { getAuthMode, getCurrentUserId } from './auth'
import { fetchApi } from './fetchApi'
import type { Wallet } from '../mocks/data/wallets'

interface WalletSummaryResponse {
  user: unknown
  wallet: Wallet
  balances: unknown[]
}

export async function getCurrentWallet(): Promise<Wallet | undefined> {
  if (getAuthMode() === 'mock') {
    const id = getCurrentUserId()
    if (!id) return undefined
    return getWalletByUserId(id)
  }
  const resp = await fetchApi<WalletSummaryResponse>('/wallet')
  return resp.wallet
}

export async function updateCurrentWallet(patch: Partial<Wallet>): Promise<Wallet | undefined> {
  if (getAuthMode() === 'mock') {
    const id = getCurrentUserId()
    if (!id) return undefined
    const wallet = await getWalletByUserId(id)
    if (!wallet) return undefined
    return updateWallet(wallet.id, patch)
  }
  throw new Error('Actualizar la wallet todavía no está disponible en el backend')
}

export { getWallets, getWalletById, getWalletByUserId, getWalletByAlias }
