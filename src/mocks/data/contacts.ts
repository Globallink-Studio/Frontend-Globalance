export interface Contact {
  id: string
  user_id: string
  alias: string
  phone: string | null
  created_at: string
}

export const contacts: Contact[] = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    alias: 'mamá',
    phone: '+54 11 5555-0301',
    created_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    alias: 'Lucas',
    phone: '+54 11 5555-0302',
    created_at: '2026-04-18T15:30:00.000Z',
  },
]
