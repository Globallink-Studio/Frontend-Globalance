import {
  getPaymentMethodsByUserId,
  createPaymentMethod,
  updatePaymentMethod as updateMockPaymentMethod,
  deletePaymentMethod as deleteMockPaymentMethod,
} from '../mocks/handlers/paymentMethods'
import { getCurrentUserId } from './auth'
import type { PaymentMethod } from '../mocks/data/paymentMethods'

export async function getPaymentMethodsList(): Promise<PaymentMethod[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getPaymentMethodsByUserId(id)
}

export async function addPaymentMethod(input: {
  type: 'bank' | 'merchant'
  name: string
  last_four?: string
  currency_code: string
  currency_name?: string
}): Promise<PaymentMethod> {
  const id = getCurrentUserId()
  if (!id) throw new Error('No hay usuario autenticado')
  return createPaymentMethod(id, input)
}

export async function updatePaymentMethod(
  id: string,
  patch: Partial<Pick<PaymentMethod, 'type' | 'name' | 'last_four' | 'currency_code' | 'currency_name'>>,
): Promise<PaymentMethod | undefined> {
  if (!id) throw new Error('Falta el método de pago a editar')
  return updateMockPaymentMethod(id, patch)
}

export async function deletePaymentMethod(id: string): Promise<void> {
  if (!id) throw new Error('Falta el método de pago a eliminar')
  await deleteMockPaymentMethod(id)
}
