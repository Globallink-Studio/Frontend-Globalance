export interface Balance {
  id: string
  wallet_id: string
  currency_code: string
  amount: number
  updated_at: string
}

export const balances: Balance[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'ARS',
    amount: 250000.5,
    updated_at: '2026-07-30T18:22:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'USD',
    amount: 1500.25,
    updated_at: '2026-07-28T14:10:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000002b',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'EUR',
    amount: 5120.4,
    updated_at: '2026-07-29T12:00:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    wallet_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    currency_code: 'USD',
    amount: 8500,
    updated_at: '2026-07-29T14:05:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    wallet_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    currency_code: 'ARS',
    amount: 120000,
    updated_at: '2026-07-27T10:00:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    wallet_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    currency_code: 'EUR',
    amount: 2000,
    updated_at: '2026-07-25T09:45:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    wallet_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    currency_code: 'EUR',
    amount: 4250.75,
    updated_at: '2026-07-28T11:12:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    wallet_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    currency_code: 'USD',
    amount: 1000,
    updated_at: '2026-07-26T16:30:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    wallet_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    currency_code: 'ARS',
    amount: 50000,
    updated_at: '2026-05-02T20:40:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    wallet_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    currency_code: 'USD',
    amount: 35000,
    updated_at: '2026-07-31T09:15:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000010',
    wallet_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    currency_code: 'ARS',
    amount: 890000,
    updated_at: '2026-07-31T09:10:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000011',
    wallet_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    currency_code: 'EUR',
    amount: 5000,
    updated_at: '2026-07-30T17:00:00.000Z',
  },
  {
    id: '10000000-0000-4000-8000-000000000012',
    wallet_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    currency_code: 'ARS',
    amount: 75000,
    updated_at: '2026-04-15T17:55:00.000Z',
  },
]
