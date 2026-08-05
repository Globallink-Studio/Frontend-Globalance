export type CardBrand = 'visa' | 'mastercard'
export type CardStatus = 'active' | 'inactive' | 'blocked'
export type CardKind = 'physical' | 'virtual'

export interface Card {
  id: string
  user_id: string
  brand: CardBrand
  kind: CardKind
  last_four: string
  masked_number: string
  holder: string
  expiry: string
  status: CardStatus
  created_at: string
}

export const cards: Card[] = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    brand: 'visa',
    kind: 'physical',
    last_four: '4242',
    masked_number: '4712 ···· ···· 4242',
    holder: 'Sofía Martínez',
    expiry: '09/29',
    status: 'active',
    created_at: '2026-03-05T10:00:00.000Z',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    brand: 'mastercard',
    kind: 'virtual',
    last_four: '8830',
    masked_number: '4712 ···· ···· 8830',
    holder: 'Lucía Méndez',
    expiry: '09/29',
    status: 'active',
    created_at: '2026-06-15T14:30:00.000Z',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    user_id: '11111111-1111-4111-8111-111111111111',
    brand: 'visa',
    kind: 'physical',
    last_four: '7719',
    masked_number: '4512 ···· ···· 7719',
    holder: 'Sofía Martínez',
    expiry: '05/30',
    status: 'active',
    created_at: '2026-05-10T09:00:00.000Z',
  },
]
