import { delay } from '../delay'
import {
  getMockPaymentMethods,
  addMockPaymentMethod,
  updateMockPaymentMethod,
  deleteMockPaymentMethod,
} from '../storage'
import type { PaymentMethod } from '../data/paymentMethods'

export type PaymentMethodType = 'bank' | 'merchant'

export interface PaymentMethodInput {
  type: PaymentMethodType
  name: string
  last_four?: string
  currency_code: string
  currency_name?: string
}

function validatePaymentMethodInput(input: PaymentMethodInput): void {
  if (input.type !== 'bank' && input.type !== 'merchant') {
    throw new Error('El tipo de método de pago es inválido')
  }
  if (!input.name?.trim()) throw new Error('El nombre del método de pago es obligatorio')
  if (!input.currency_code?.trim()) throw new Error('La moneda del método de pago es obligatoria')
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  await delay()
  return getMockPaymentMethods()
}

export async function getPaymentMethodsByUserId(userId: string): Promise<PaymentMethod[]> {
  await delay()
  return getMockPaymentMethods().filter((p) => p.user_id === userId)
}

export async function createPaymentMethod(userId: string, input: PaymentMethodInput): Promise<PaymentMethod> {
  await delay()
  validatePaymentMethodInput(input)
  const method: PaymentMethod = {
    id: crypto.randomUUID(),
    user_id: userId,
    type: input.type,
    name: input.name.trim(),
    last_four: input.last_four?.trim() ?? '',
    currency_code: input.currency_code.trim(),
    currency_name: input.currency_name?.trim() ?? '',
    created_at: new Date().toISOString(),
  }
  addMockPaymentMethod(method)
  return method
}

export async function updatePaymentMethod(
  id: string,
  patch: Partial<Pick<PaymentMethod, 'type' | 'name' | 'last_four' | 'currency_code' | 'currency_name'>>,
): Promise<PaymentMethod | undefined> {
  await delay()
  const current = getMockPaymentMethods().find((p) => p.id === id)
  if (!current) return undefined

  const next: Partial<PaymentMethod> = { ...patch }
  if (next.type !== undefined && next.type !== 'bank' && next.type !== 'merchant') {
    throw new Error('El tipo de método de pago es inválido')
  }
  if (next.name !== undefined && !next.name.trim()) throw new Error('El nombre del método de pago es obligatorio')
  if (next.currency_code !== undefined && !next.currency_code.trim()) {
    throw new Error('La moneda del método de pago es obligatoria')
  }

  updateMockPaymentMethod(id, next)
  return { ...current, ...next }
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await delay()
  deleteMockPaymentMethod(id)
}
