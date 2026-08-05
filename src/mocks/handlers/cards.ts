import { delay } from '../delay'
import { getMockCards } from '../storage'
import type { Card } from '../data/cards'

export async function getCards(): Promise<Card[]> {
  await delay()
  return getMockCards()
}

export async function getCardsByUserId(userId: string): Promise<Card[]> {
  await delay()
  return getMockCards().filter((c) => c.user_id === userId)
}
