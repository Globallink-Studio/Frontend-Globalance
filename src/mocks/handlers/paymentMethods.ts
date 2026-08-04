import { delay } from '../delay'
import { paymentMethods } from '../data/paymentMethods'
import type { PaymentMethod } from '../data/paymentMethods'

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  await delay()
  return paymentMethods
}