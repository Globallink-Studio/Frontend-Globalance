import { delay } from '../delay'
import type { PaymentRequest } from '../data/paymentRequests'
import { getMockPaymentRequests, saveMockPaymentRequests } from '../storage'

function requestHasExpired(pr: PaymentRequest): boolean {
  return pr.status === 'pending' && new Date(pr.expires_at).getTime() <= Date.now()
}

export async function listPaymentRequests(userId: string, scope: 'sent' | 'received'): Promise<PaymentRequest[]> {
  await delay()
  return getMockPaymentRequests()
    .filter((pr) => (scope === 'sent' ? pr.requester_user_id === userId : pr.payer_user_id === userId))
    .map((pr) => (requestHasExpired(pr) ? { ...pr, status: 'expired' } : pr))
}

export async function getPaymentRequestByToken(userId: string, token: string): Promise<PaymentRequest | undefined> {
  await delay()
  const pr = getMockPaymentRequests().find((p) => p.payment_token === token)
  if (!pr || pr.payer_user_id !== userId) return undefined
  return requestHasExpired(pr) ? { ...pr, status: 'expired' } : pr
}

export async function payPaymentRequest(userId: string, token: string): Promise<PaymentRequest | undefined> {
  await delay()
  const pr = getMockPaymentRequests().find((p) => p.payment_token === token)
  if (!pr || pr.payer_user_id !== userId || pr.status !== 'pending' || requestHasExpired(pr)) return undefined

  const now = new Date().toISOString()
  const paid: PaymentRequest = {
    ...pr,
    status: 'paid',
    paid_transaction_id: crypto.randomUUID(),
    paid_at: now,
    updated_at: now,
  }
  saveMockPaymentRequests(getMockPaymentRequests().map((p) => (p.id === pr.id ? paid : p)))
  return paid
}

export async function cancelPaymentRequest(userId: string, id: string): Promise<PaymentRequest | undefined> {
  await delay()
  const pr = getMockPaymentRequests().find((p) => p.id === id)
  if (!pr || pr.requester_user_id !== userId || pr.status !== 'pending' || requestHasExpired(pr)) return undefined

  const now = new Date().toISOString()
  const cancelled: PaymentRequest = {
    ...pr,
    status: 'cancelled',
    cancelled_at: now,
    updated_at: now,
  }
  saveMockPaymentRequests(getMockPaymentRequests().map((p) => (p.id === pr.id ? cancelled : p)))
  return cancelled
}
