import {
  listPaymentRequests as mockListPaymentRequests,
  getPaymentRequestByToken as mockGetPaymentRequestByToken,
  payPaymentRequest as mockPayPaymentRequest,
  cancelPaymentRequest as mockCancelPaymentRequest,
} from '../mocks/handlers/paymentRequests'
import type { PaymentRequest, PaymentRequestStatus } from '../mocks/data/paymentRequests'
import { getAuthMode, getCurrentUserId } from './auth'
import { fetchApi } from './fetchApi'

export type PaymentRequestScope = 'sent' | 'received'

export const paymentRequestStatusLabels: Record<PaymentRequestStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  expired: 'Vencida',
  cancelled: 'Cancelada',
}

interface ApiPaymentRequestsResponse {
  paymentRequests: PaymentRequest[]
  pagination?: { limit: number; offset: number; returned: number }
}

interface ApiPaymentRequestResponse {
  message: string
  paymentRequest: PaymentRequest
}

function currentUserIdOrThrow(): string {
  const id = getCurrentUserId()
  if (!id) throw new Error('No hay usuario autenticado')
  return id
}

export async function listPaymentRequests(scope: PaymentRequestScope): Promise<PaymentRequest[]> {
  if (getAuthMode() === 'mock') {
    const id = getCurrentUserId()
    if (!id) return []
    return mockListPaymentRequests(id, scope)
  }
  const resp = await fetchApi<ApiPaymentRequestsResponse>(`/payment-requests?scope=${scope}`)
  return resp.paymentRequests
}

export async function getPaymentRequestByToken(token: string): Promise<PaymentRequest | undefined> {
  if (!token) throw new Error('Falta el token de la solicitud')
  if (getAuthMode() === 'mock') {
    const id = getCurrentUserId()
    if (!id) return undefined
    return mockGetPaymentRequestByToken(id, token)
  }
  const resp = await fetchApi<ApiPaymentRequestResponse>(`/payment-requests/${token}`)
  return resp.paymentRequest
}

export async function payPaymentRequest(token: string): Promise<PaymentRequest> {
  if (!token) throw new Error('Falta el token de la solicitud')
  if (getAuthMode() === 'mock') {
    const paid = await mockPayPaymentRequest(currentUserIdOrThrow(), token)
    if (!paid) throw new Error('No se pudo pagar la solicitud')
    return paid
  }
  const resp = await fetchApi<ApiPaymentRequestResponse>(`/payment-requests/${token}/pay`, {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
  })
  return resp.paymentRequest
}

export async function cancelPaymentRequest(id: string): Promise<PaymentRequest> {
  if (!id) throw new Error('Falta la solicitud a cancelar')
  if (getAuthMode() === 'mock') {
    const cancelled = await mockCancelPaymentRequest(currentUserIdOrThrow(), id)
    if (!cancelled) throw new Error('No se pudo cancelar la solicitud')
    return cancelled
  }
  const resp = await fetchApi<ApiPaymentRequestResponse>(`/payment-requests/${id}/cancel`, {
    method: 'PATCH',
  })
  return resp.paymentRequest
}
