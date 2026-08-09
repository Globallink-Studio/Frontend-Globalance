import {
  createCard,
  setCardStatus,
  deleteCard as deleteMockCard,
  getCardsByUserId,
} from '../mocks/handlers/cards'
import { getCurrentUserId } from './auth'
import type { Card, CardBrand } from '../mocks/data/cards'

export async function getCurrentCards(): Promise<Card[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getCardsByUserId(id)
}

export async function addCard(input: {
  brand: CardBrand
  last_four: string
  holder: string
  expiry: string
}): Promise<Card> {
  const id = getCurrentUserId()
  if (!id) throw new Error('No hay usuario autenticado')
  return createCard(id, input)
}

export async function blockCard(id: string): Promise<Card | undefined> {
  if (!id) throw new Error('Falta la tarjeta a bloquear')
  return setCardStatus(id, 'blocked')
}

export async function unblockCard(id: string): Promise<Card | undefined> {
  if (!id) throw new Error('Falta la tarjeta a desbloquear')
  return setCardStatus(id, 'active')
}

export async function deleteCard(id: string): Promise<void> {
  if (!id) throw new Error('Falta la tarjeta a eliminar')
  await deleteMockCard(id)
}
