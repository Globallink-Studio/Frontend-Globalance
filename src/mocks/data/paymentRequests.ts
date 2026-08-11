export type PaymentRequestStatus = 'pending' | 'paid' | 'expired' | 'cancelled'
export type PaymentRequestCurrency = 'ARS' | 'USD' | 'EUR'

export interface PaymentRequest {
  id: string
  payment_token: string
  requester_user_id: string
  payer_user_id: string
  payer_email: string
  currency_code: PaymentRequestCurrency
  amount: string
  status: PaymentRequestStatus
  paid_transaction_id: string | null
  created_at: string
  updated_at: string
  expires_at: string
  paid_at: string | null
  cancelled_at: string | null
  requester_email?: string
}

const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111'
const JUAN_USER_ID = '22222222-2222-4222-8222-222222222222'
const CAMILA_USER_ID = '33333333-3333-4333-8333-333333333333'

export const paymentRequests: PaymentRequest[] = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    payment_token: '50000000-0000-4000-8000-000000000101',
    requester_user_id: DEMO_USER_ID,
    payer_user_id: JUAN_USER_ID,
    payer_email: 'juan@ejemplo.com',
    currency_code: 'ARS',
    amount: '25000.00',
    status: 'pending',
    paid_transaction_id: null,
    created_at: '2026-08-01T12:00:00.000Z',
    updated_at: '2026-08-01T12:00:00.000Z',
    expires_at: '2026-09-01T12:00:00.000Z',
    paid_at: null,
    cancelled_at: null,
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    payment_token: '50000000-0000-4000-8000-000000000102',
    requester_user_id: DEMO_USER_ID,
    payer_user_id: CAMILA_USER_ID,
    payer_email: 'camila@ejemplo.com',
    currency_code: 'USD',
    amount: '180.00',
    status: 'paid',
    paid_transaction_id: '20000000-0000-4000-8000-000000000099',
    created_at: '2026-07-25T09:30:00.000Z',
    updated_at: '2026-07-26T14:00:00.000Z',
    expires_at: '2026-08-25T09:30:00.000Z',
    paid_at: '2026-07-26T14:00:00.000Z',
    cancelled_at: null,
  },
  {
    id: '50000000-0000-4000-8000-000000000003',
    payment_token: '50000000-0000-4000-8000-000000000103',
    requester_user_id: JUAN_USER_ID,
    requester_email: 'juan@ejemplo.com',
    payer_user_id: DEMO_USER_ID,
    payer_email: 'sofia@test.com',
    currency_code: 'ARS',
    amount: '12000.00',
    status: 'pending',
    paid_transaction_id: null,
    created_at: '2026-08-02T10:15:00.000Z',
    updated_at: '2026-08-02T10:15:00.000Z',
    expires_at: '2026-09-02T10:15:00.000Z',
    paid_at: null,
    cancelled_at: null,
  },
  {
    id: '50000000-0000-4000-8000-000000000004',
    payment_token: '50000000-0000-4000-8000-000000000104',
    requester_user_id: CAMILA_USER_ID,
    requester_email: 'camila@ejemplo.com',
    payer_user_id: DEMO_USER_ID,
    payer_email: 'sofia@test.com',
    currency_code: 'EUR',
    amount: '95.50',
    status: 'paid',
    paid_transaction_id: '20000000-0000-4000-8000-000000000098',
    created_at: '2026-07-20T18:00:00.000Z',
    updated_at: '2026-07-21T09:00:00.000Z',
    expires_at: '2026-08-20T18:00:00.000Z',
    paid_at: '2026-07-21T09:00:00.000Z',
    cancelled_at: null,
  },
]
