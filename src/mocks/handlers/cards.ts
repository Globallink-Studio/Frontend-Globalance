import { delay } from '../delay'
import {
  getMockCards,
  addMockCards,
  updateMockCard,
  deleteMockCard,
} from '../storage'
import type { Card, CardBrand, CardStatus } from '../data/cards'
import { getExpiryError } from '../../utils/cardFormat'

export interface CardInput {
  brand: CardBrand
  last_four: string
  holder: string
  expiry: string
}

function buildMaskedNumber(lastFour: string): string {
  const digits = lastFour.replace(/\s/g, '')
  return `···· ···· ···· ${digits}`
}

function validateCardInput(input: CardInput): void {
  if (input.brand !== 'visa' && input.brand !== 'mastercard') {
    throw new Error('La marca de la tarjeta es inválida')
  }
  const lastFour = input.last_four?.trim() ?? ''
  if (!/^\d{4}$/.test(lastFour)) {
    throw new Error('Los últimos 4 dígitos son obligatorios (4 números)')
  }
  if (!input.holder?.trim()) throw new Error('El titular de la tarjeta es obligatorio')
  if (!input.expiry?.trim()) throw new Error('El vencimiento de la tarjeta es obligatorio')
  const expiryError = getExpiryError(input.expiry.trim())
  if (expiryError) throw new Error(expiryError)
}

export async function getCards(): Promise<Card[]> {
  await delay()
  return getMockCards()
}

export async function getCardsByUserId(userId: string): Promise<Card[]> {
  await delay()
  return getMockCards().filter((c) => c.user_id === userId)
}

export async function createCard(userId: string, input: CardInput): Promise<Card> {
  await delay()
  validateCardInput(input)
  const lastFour = input.last_four.replace(/\s/g, '')
  const card: Card = {
    id: crypto.randomUUID(),
    user_id: userId,
    brand: input.brand,
    last_four: lastFour,
    masked_number: buildMaskedNumber(lastFour),
    holder: input.holder.trim(),
    expiry: input.expiry.trim(),
    status: 'active',
    created_at: new Date().toISOString(),
  }
  addMockCards([card])
  return card
}

export async function setCardStatus(id: string, status: CardStatus): Promise<Card | undefined> {
  await delay()
  const current = getMockCards().find((c) => c.id === id)
  if (!current) return undefined
  if (status !== 'active' && status !== 'inactive' && status !== 'blocked') {
    throw new Error('El estado de la tarjeta es inválido')
  }
  updateMockCard(id, { status })
  return { ...current, status }
}

export async function deleteCard(id: string): Promise<void> {
  await delay()
  deleteMockCard(id)
}
