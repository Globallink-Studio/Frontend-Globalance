import { getWalletById, getWalletByUserId, getWallets } from '../mocks/handlers/wallets'
import { getCurrentUserId } from './auth'
import type { Wallet } from '../mocks/data/wallets'

export async function getCurrentWallet(): Promise<Wallet | undefined> {
  return getWalletByUserId(getCurrentUserId())
}

export { getWallets, getWalletById, getWalletByUserId }
