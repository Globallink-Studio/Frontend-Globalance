export interface PaymentMethod {
  id: string
  type: 'bank' | 'merchant'
  name: string
  last_four: string
  currency_code: string
  currency_name: string
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'bank',
    name: 'Santander',
    last_four: '4471',
    currency_code: 'EUR',
    currency_name: 'Euro',
  },
  {
    id: 'pm-002',
    type: 'merchant',
    name: 'Mercado Pago',
    last_four: '',
    currency_code: 'ARS',
    currency_name: 'Peso argentino',
  },
]