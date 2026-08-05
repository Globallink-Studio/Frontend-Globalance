import { getWalletById, getWalletByUserId, getWallets, updateWallet } from '../mocks/handlers/wallets'
import { getCurrentUserId } from './auth'
import type { Wallet } from '../mocks/data/wallets'

export async function getCurrentWallet(): Promise<Wallet | undefined> {
  const id = getCurrentUserId()
  if (!id) return undefined
  return getWalletByUserId(id)
}

export async function updateCurrentWallet(patch: Partial<Wallet>): Promise<Wallet | undefined> {
  const id = getCurrentUserId()
  if (!id) return undefined
  const wallet = await getWalletByUserId(id)
  if (!wallet) return undefined
  return updateWallet(wallet.id, patch)
}

export { getWallets, getWalletById, getWalletByUserId }
