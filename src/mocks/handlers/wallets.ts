import { delay } from '../delay'
import { wallets } from '../data/wallets'
import type { Wallet } from '../data/wallets'

export async function getWallets(): Promise<Wallet[]> {
  await delay()
  return wallets
}

export async function getWallet(): Promise<Wallet | undefined> {
  await delay()
  return wallets.find((w) => w.status === 'active')
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  await delay()
  return wallets.find((w) => w.id === id)
}

export async function getWalletByUserId(userId: string): Promise<Wallet | undefined> {
  await delay()
  return wallets.find((w) => w.user_id === userId)
}
