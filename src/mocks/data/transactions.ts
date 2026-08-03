export type TransactionType = 'transfer' | 'deposit' | 'conversion' | 'request'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface Transaction {
  id: string
  wallet_id: string
  currency_code: string
  type: TransactionType
  amount: number
  description: string
  status: TransactionStatus
  created_at: string
}

export const transactions: Transaction[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'ARS',
    type: 'deposit',
    amount: 50000,
    description: 'Depósito de sueldo',
    status: 'completed',
    created_at: '2026-07-28T09:00:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'ARS',
    type: 'transfer',
    amount: 12000,
    description: 'Pago de alquiler',
    status: 'completed',
    created_at: '2026-07-25T15:30:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'ARS',
    type: 'request',
    amount: 3000,
    description: 'Cena compartida con amigos',
    status: 'pending',
    created_at: '2026-07-30T20:10:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    wallet_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    currency_code: 'USD',
    type: 'conversion',
    amount: 500,
    description: 'Conversión desde EUR',
    status: 'completed',
    created_at: '2026-07-22T11:45:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    wallet_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    currency_code: 'USD',
    type: 'deposit',
    amount: 2000,
    description: 'Depósito de cliente freelance',
    status: 'completed',
    created_at: '2026-07-27T10:20:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000006',
    wallet_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    currency_code: 'USD',
    type: 'transfer',
    amount: 350,
    description: 'Pago de servicio de hosting',
    status: 'completed',
    created_at: '2026-07-24T14:05:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000007',
    wallet_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    currency_code: 'USD',
    type: 'request',
    amount: 100,
    description: 'Préstamo a un colega',
    status: 'failed',
    created_at: '2026-07-21T18:40:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000008',
    wallet_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    currency_code: 'EUR',
    type: 'deposit',
    amount: 800,
    description: 'Pago de curso online',
    status: 'completed',
    created_at: '2026-07-26T09:30:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000009',
    wallet_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    currency_code: 'USD',
    type: 'deposit',
    amount: 10000,
    description: 'Pago de proyecto de desarrollo',
    status: 'completed',
    created_at: '2026-07-30T08:00:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000010',
    wallet_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    currency_code: 'ARS',
    type: 'transfer',
    amount: 150000,
    description: 'Pago a proveedores',
    status: 'completed',
    created_at: '2026-07-29T16:15:00.000Z',
  },
]
