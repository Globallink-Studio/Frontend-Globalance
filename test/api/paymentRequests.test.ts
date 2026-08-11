import {
  cancelPaymentRequest,
  getPaymentRequestByToken,
  listPaymentRequests,
  payPaymentRequest,
} from '../../src/api/paymentRequests'
import { getCurrentUserId } from '../../src/api/auth'
import { fetchApi } from '../../src/api/fetchApi'
import { addMockPaymentRequests } from '../../src/mocks/storage'
import { seedDemoUser } from '../fixtures/db'
import type { PaymentRequest } from '../../src/mocks/data/paymentRequests'

const { getAuthModeMock } = vi.hoisted(() => ({ getAuthModeMock: vi.fn(() => 'mock') }))

vi.mock('../../src/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/auth')>()
  return { ...actual, getAuthMode: getAuthModeMock }
})

vi.mock('../../src/api/fetchApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/fetchApi')>()
  return { ...actual, fetchApi: vi.fn() }
})

const mockFetch = vi.mocked(fetchApi)

describe('payment requests API — modo mock (desarrollo local)', () => {
  beforeEach(async () => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('mock')
    mockFetch.mockReset()
    const { logout } = await import('../../src/api/auth')
    await logout()
  })

  test('lista las solicitudes recibidas y enviadas del usuario', async () => {
    await seedDemoUser()

    const received = await listPaymentRequests('received')
    expect(received.length).toBeGreaterThan(0)
    expect(received.every((r) => r.payer_user_id === getCurrentUserId())).toBe(true)

    const sent = await listPaymentRequests('sent')
    expect(sent.length).toBeGreaterThan(0)
    expect(sent.every((r) => r.requester_user_id === getCurrentUserId())).toBe(true)
  })

  test('devuelve [] si no hay usuario activo', async () => {
    const received = await listPaymentRequests('received')
    expect(received).toEqual([])
  })

  test('consulta una solicitud por token', async () => {
    await seedDemoUser()

    const received = await listPaymentRequests('received')
    const target = received[0]

    const pr = await getPaymentRequestByToken(target.payment_token)
    expect(pr).toBeDefined()
    expect(pr!.id).toBe(target.id)
  })

  test('paga una solicitud recibida pendiente', async () => {
    await seedDemoUser()

    const received = await listPaymentRequests('received')
    const pending = received.find((r) => r.status === 'pending')
    expect(pending).toBeDefined()

    const paid = await payPaymentRequest(pending!.payment_token)
    expect(paid.status).toBe('paid')
    expect(paid.paid_at).toBeTruthy()
  })

  test('cancela una solicitud enviada pendiente', async () => {
    await seedDemoUser()

    const sent = await listPaymentRequests('sent')
    const pending = sent.find((r) => r.status === 'pending')
    expect(pending).toBeDefined()

    const cancelled = await cancelPaymentRequest(pending!.id)
    expect(cancelled.status).toBe('cancelled')
    expect(cancelled.cancelled_at).toBeTruthy()
  })

  test('no permite pagar una solicitud ajena', async () => {
    await seedDemoUser()

    const foreign: PaymentRequest = {
      id: '50000000-0000-4000-8000-000000000999',
      payment_token: '50000000-0000-4000-8000-000000000909',
      requester_user_id: '99999999-9999-4999-8999-999999999999',
      payer_user_id: '88888888-8888-4888-8888-888888888888',
      payer_email: 'otro@ejemplo.com',
      currency_code: 'ARS',
      amount: '500.00',
      status: 'pending',
      paid_transaction_id: null,
      created_at: '2026-08-05T12:00:00.000Z',
      updated_at: '2026-08-05T12:00:00.000Z',
      expires_at: '2026-09-05T12:00:00.000Z',
      paid_at: null,
      cancelled_at: null,
    }
    addMockPaymentRequests([foreign])

    await expect(payPaymentRequest(foreign.payment_token)).rejects.toThrow('No se pudo pagar la solicitud')
  })
})

describe('payment requests API — modo firebase (API real)', () => {
  beforeEach(async () => {
    localStorage.clear()
    getAuthModeMock.mockReturnValue('firebase')
    mockFetch.mockReset()
    const { logout } = await import('../../src/api/auth')
    await logout()
  })

  const apiPaymentRequest: PaymentRequest = {
    id: '50000000-0000-4000-8000-000000000003',
    payment_token: '50000000-0000-4000-8000-000000000103',
    requester_user_id: '22222222-2222-4222-8222-222222222222',
    payer_user_id: '11111111-1111-4111-8111-111111111111',
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
    requester_email: 'juan@ejemplo.com',
  }

  test('lista las solicitudes con GET /payment-requests?scope=…', async () => {
    mockFetch.mockResolvedValue({
      paymentRequests: [apiPaymentRequest],
      pagination: { limit: 20, offset: 0, returned: 1 },
    })

    const list = await listPaymentRequests('received')

    expect(mockFetch).toHaveBeenCalledWith('/payment-requests?scope=received')
    expect(list).toHaveLength(1)
    expect(list[0]).toEqual(apiPaymentRequest)
  })

  test('consulta una solicitud por token con GET /payment-requests/{token}', async () => {
    mockFetch.mockResolvedValue({ message: 'ok', paymentRequest: apiPaymentRequest })

    const pr = await getPaymentRequestByToken(apiPaymentRequest.payment_token)

    expect(mockFetch).toHaveBeenCalledWith(`/payment-requests/${apiPaymentRequest.payment_token}`)
    expect(pr).toEqual(apiPaymentRequest)
  })

  test('paga una solicitud con POST /payment-requests/{token}/pay e Idempotency-Key', async () => {
    mockFetch.mockResolvedValue({
      message: 'Solicitud de cobro pagada correctamente',
      paymentRequest: { ...apiPaymentRequest, status: 'paid', paid_at: '2026-08-11T12:00:00.000Z' },
    })

    const paid = await payPaymentRequest(apiPaymentRequest.payment_token)

    expect(mockFetch).toHaveBeenCalledWith(`/payment-requests/${apiPaymentRequest.payment_token}/pay`, {
      method: 'POST',
      headers: { 'Idempotency-Key': expect.any(String) },
    })
    expect(paid.status).toBe('paid')
  })

  test('cancela una solicitud con PATCH /payment-requests/{id}/cancel', async () => {
    mockFetch.mockResolvedValue({
      message: 'Solicitud de cobro cancelada correctamente',
      paymentRequest: { ...apiPaymentRequest, status: 'cancelled', cancelled_at: '2026-08-11T12:00:00.000Z' },
    })

    const cancelled = await cancelPaymentRequest(apiPaymentRequest.id)

    expect(mockFetch).toHaveBeenCalledWith(`/payment-requests/${apiPaymentRequest.id}/cancel`, {
      method: 'PATCH',
    })
    expect(cancelled.status).toBe('cancelled')
  })

  test('rechaza pagar sin token antes de llamar a la API', async () => {
    await expect(payPaymentRequest('')).rejects.toThrow('Falta el token de la solicitud')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('propaga los errores de la API', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(listPaymentRequests('received')).rejects.toThrow('Network error')
  })
})
