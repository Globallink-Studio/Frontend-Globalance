import { delay } from '../delay'
import { cards } from '../data/cards'
import type { Card } from '../data/cards'

export async function getCards(): Promise<Card[]> {
  await delay()
  return cards
}

export async function getCardsByUserId(userId: string): Promise<Card[]> {
  await delay()
  return cards.filter((c) => c.user_id === userId)
}
