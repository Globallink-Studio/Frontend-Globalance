import { getCardsByUserId } from '../mocks/handlers/cards'
import { getCurrentUserId } from './auth'
import type { Card } from '../mocks/data/cards'

export async function getCurrentCards(): Promise<Card[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getCardsByUserId(id)
}
