import { getCardsByUserId } from '../mocks/handlers/cards'
import { getCurrentUserId } from './auth'
import type { Card } from '../mocks/data/cards'

export async function getCurrentCards(): Promise<Card[]> {
  return getCardsByUserId(getCurrentUserId())
}
