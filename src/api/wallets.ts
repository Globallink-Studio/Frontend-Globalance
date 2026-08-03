import { getWalletById, getWalletByUserId, getWallets } from '../mocks/handlers/wallets'
import { getCurrentUserId } from './auth'
import type { Wallet } from '../mocks/data/wallets'

export async function getCurrentWallet(): Promise<Wallet | undefined> {
  const id = getCurrentUserId()
  if (!id) return undefined
  return getWalletByUserId(id)
}

export { getWallets, getWalletById, getWalletByUserId }
