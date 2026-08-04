import { getPaymentMethods } from '../mocks/handlers/paymentMethods'
import type { PaymentMethod } from '../mocks/data/paymentMethods'

export async function getPaymentMethodsList(): Promise<PaymentMethod[]> {
  return getPaymentMethods()
}