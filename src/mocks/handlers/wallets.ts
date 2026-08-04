import { delay } from '../delay'
import { getMockWallets } from '../storage'
import type { Wallet } from '../data/wallets'

export async function getWallets(): Promise<Wallet[]> {
  await delay()
  return getMockWallets()
}

export async function getWallet(): Promise<Wallet | undefined> {
  await delay()
  return getMockWallets().find((w) => w.status === 'active')
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  await delay()
  return getMockWallets().find((w) => w.id === id)
}

export async function getWalletByUserId(userId: string): Promise<Wallet | undefined> {
  await delay()
  return getMockWallets().find((w) => w.user_id === userId)
}
