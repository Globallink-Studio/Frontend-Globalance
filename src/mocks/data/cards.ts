export type CardBrand = 'visa' | 'mastercard'
export type CardStatus = 'active' | 'inactive' | 'blocked'

export interface Card {
  id: string
  user_id: string
  brand: CardBrand
  last_four: string
  holder: string
  status: CardStatus
  created_at: string
}

export const cards: Card[] = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    brand: 'visa',
    last_four: '4242',
    holder: 'Sofía Martínez',
    status: 'active',
    created_at: '2026-03-05T10:00:00.000Z',
  },
]
