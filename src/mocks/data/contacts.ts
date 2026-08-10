export interface Contact {
  id: string
  user_id: string
  recipient_user_id: string
  alias: string
  phone: string | null
  email: string | null
  category: string | null
  description: string | null
  favorite: boolean
  account: string | null
  currency_code: string | null
  last_amount: string | null
  last_activity: string | null
  created_at: string
}

export const contacts: Contact[] = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '22222222-2222-4222-8222-222222222222',
    alias: 'mamá',
    phone: '+54 11 5555-0301',
    email: 'juan@ejemplo.com',
    category: null,
    description: 'Juan Pérez',
    favorite: true,
    account: '0000000002',
    currency_code: 'USD',
    last_amount: 'US$ 1.200',
    last_activity: 'Hace 2 días',
    created_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '33333333-3333-4333-8333-333333333333',
    alias: 'Lucas',
    phone: '+54 11 5555-0302',
    email: 'camila@ejemplo.com',
    category: null,
    description: 'Camila Gómez',
    favorite: false,
    account: '0000000003',
    currency_code: 'EUR',
    last_amount: '$ 45.000',
    last_activity: 'Hace 3 semanas',
    created_at: '2026-04-18T15:30:00.000Z',
  },
]
