export interface Contact {
  id: string
  user_id: string
  recipient_user_id: string
  alias: string
  phone: string | null
  created_at: string
}

export const contacts: Contact[] = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '22222222-2222-4222-8222-222222222222',
    alias: 'mamá',
    phone: '+54 11 5555-0301',
    created_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    recipient_user_id: '33333333-3333-4333-8333-333333333333',
    alias: 'Lucas',
    phone: '+54 11 5555-0302',
    created_at: '2026-04-18T15:30:00.000Z',
  },
]
