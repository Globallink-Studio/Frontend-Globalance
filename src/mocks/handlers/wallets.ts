import { delay } from '../delay'
import { getMockWallets, updateMockWallet } from '../storage'
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

export async function updateWallet(id: string, patch: Partial<Wallet>): Promise<Wallet | undefined> {
  await delay()
  const current = getMockWallets().find((w) => w.id === id)
  if (!current) return undefined
  updateMockWallet(id, patch)
  return { ...current, ...patch }
}
