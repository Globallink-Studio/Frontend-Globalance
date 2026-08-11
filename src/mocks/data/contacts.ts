export interface Contact {
  id: string
  user_id: string
  recipient_user_id: string
  alias: string
  contact_type: 'alias' | 'account_number' | null
  contact_value: string | null
  phone?: string | null
  email?: string | null
  category?: string | null
  description?: string | null
  favorite?: boolean
  account?: string | null
  currency_code?: string | null
  last_amount?: string | null
  last_activity?: string | null
  created_at?: string
}

export const contacts: Contact[] = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '22222222-2222-4222-8222-222222222222',
    alias: 'mamá',
    contact_type: 'account_number',
    contact_value: '0000000002',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '33333333-3333-4333-8333-333333333333',
    alias: 'Lucas',
    contact_type: 'alias',
    contact_value: 'camila.euro',
  },
  {
    id: '60000000-0000-4000-8000-000000000003',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '22222222-2222-4222-8222-222222222222',
    alias: 'Juan',
    contact_type: 'alias',
    contact_value: 'juan.cash',
  },
  {
    id: '60000000-0000-4000-8000-000000000004',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '33333333-3333-4333-8333-333333333333',
    alias: 'Camila',
    contact_type: 'account_number',
    contact_value: '0000000003',
  },
]
