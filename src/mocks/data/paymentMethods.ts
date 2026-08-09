export interface PaymentMethod {
  id: string
  user_id: string
  type: 'bank' | 'merchant'
  name: string
  last_four: string
  currency_code: string
  currency_name: string
  created_at: string
}

// Semilla del usuario demo de referencia. provisionDemoData() clona estos
// métodos (con un id y user_id nuevos) para cada usuario que se registra o
// inicia sesión en modo mock.
export const paymentMethods: PaymentMethod[] = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    user_id: '11111111-1111-4111-8111-111111111111',
    type: 'bank',
    name: 'Santander',
    last_four: '4471',
    currency_code: 'EUR',
    currency_name: 'Euro',
    created_at: '2026-03-05T10:00:00.000Z',
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    user_id: '11111111-1111-4111-8111-111111111111',
    type: 'merchant',
    name: 'Mercado Pago',
    last_four: '',
    currency_code: 'ARS',
    currency_name: 'Peso argentino',
    created_at: '2026-03-05T10:00:00.000Z',
  },
]