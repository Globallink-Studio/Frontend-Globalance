export interface Wallet {
  id: string
  user_id: string
  alias: string
  account_number: string
  status: 'active' | 'inactive' | 'blocked'
  created_at: string
}

export const wallets: Wallet[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    user_id: '11111111-1111-4111-8111-111111111111',
    alias: 'sofia.wallet',
    account_number: '0000000001',
    status: 'active',
    created_at: '2026-01-15T10:05:00.000Z',
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    user_id: '22222222-2222-4222-8222-222222222222',
    alias: 'juan.cash',
    account_number: '0000000002',
    status: 'active',
    created_at: '2026-02-20T09:35:00.000Z',
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    user_id: '33333333-3333-4333-8333-333333333333',
    alias: 'camila.euro',
    account_number: '0000000003',
    status: 'active',
    created_at: '2026-03-10T16:50:00.000Z',
  },
  {
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    user_id: '44444444-4444-4444-8444-444444444444',
    alias: 'martin.rod',
    account_number: '0000000004',
    status: 'inactive',
    created_at: '2025-11-05T08:10:00.000Z',
  },
  {
    id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    user_id: '55555555-5555-4555-8555-555555555555',
    alias: 'globallink.pagos',
    account_number: '0000000005',
    status: 'active',
    created_at: '2026-01-30T12:10:00.000Z',
  },
  {
    id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    user_id: '66666666-6666-4666-8666-666666666666',
    alias: 'estudio.crea',
    account_number: '0000000006',
    status: 'inactive',
    created_at: '2025-12-01T10:35:00.000Z',
  },
]
