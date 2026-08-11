import { useCallback, useEffect, useState } from 'react'
import {
  cancelPaymentRequest,
  listPaymentRequests,
  payPaymentRequest,
  paymentRequestStatusLabels,
  type PaymentRequestScope,
} from '../api/paymentRequests'
import type { PaymentRequest, PaymentRequestStatus } from '../mocks/data/paymentRequests'
import '../styles/pages/private/transactions.css'

function statusClass(status: PaymentRequestStatus): string {
  if (status === 'pending') return 'tx-status--pending'
  if (status === 'paid') return 'tx-status--completed'
  if (status === 'cancelled') return 'tx-status--cancelled'
  return 'tx-status--processing'
}

export default function PaymentRequestsSection() {
  const [scope, setScope] = useState<PaymentRequestScope>('received')
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback((s: PaymentRequestScope) => {
    setLoading(true)
    setErrorMessage(null)
    listPaymentRequests(s)
      .then(setRequests)
      .catch((err) => setErrorMessage(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(scope)
  }, [scope, load])

  const handlePay = async (paymentToken: string) => {
    setActioning(paymentToken)
    setErrorMessage(null)
    try {
      await payPaymentRequest(paymentToken)
      load(scope)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo pagar la solicitud')
    } finally {
      setActioning(null)
    }
  }

  const handleCancel = async (id: string) => {
    setActioning(id)
    setErrorMessage(null)
    try {
      await cancelPaymentRequest(id)
      load(scope)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo cancelar la solicitud')
    } finally {
      setActioning(null)
    }
  }

  return (
    <section className="tx-card">
      <div className="tx-summary__header">
        <h3 className="tx-section__title">Solicitudes de cobro</h3>
        <div className="tx-period" role="tablist" aria-label="Tipo de solicitudes">
          {(['received', 'sent'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scope === s}
              className={`tx-period__btn${scope === s ? ' tx-period__btn--active' : ''}`}
              onClick={() => setScope(s)}
            >
              {s === 'received' ? 'Recibidas' : 'Enviadas'}
            </button>
          ))}
        </div>
      </div>

      <h3 className="tx-section__title">
        {scope === 'received' ? 'Te solicitaron cobro' : 'Enviaste solicitudes'}
      </h3>

      {loading && <p className="tx-list__empty">Cargando solicitudes...</p>}

      {!loading && requests.length === 0 && (
        <p className="tx-list__empty">
          {scope === 'received'
            ? 'No tenés solicitudes de cobro pendientes.'
            : 'No enviaste solicitudes de cobro.'}
        </p>
      )}

      <ul className="tx-list">
        {requests.map((pr) => {
          const counterpart = scope === 'received' ? pr.requester_email : pr.payer_email
          const isPending = pr.status === 'pending'
          return (
            <li key={pr.id} className="tx-list__item">
              <div className="tx-list__info">
                <p className="tx-list__description">
                  {scope === 'received' ? 'Solicitud de ' : 'Solicitaste a '}
                  {counterpart ?? '—'}
                </p>
                <div className="tx-list__status">
                  <span className={`tx-status ${statusClass(pr.status)}`}>
                    {paymentRequestStatusLabels[pr.status]}
                  </span>
                </div>
              </div>
              <div className="tx-list__right">
                <p className="tx-list__amount">
                  {Number(pr.amount).toLocaleString('es-AR')} {pr.currency_code}
                </p>
                {isPending && scope === 'received' && (
                  <button
                    type="button"
                    className="tx-button tx-button--primary"
                    disabled={actioning === pr.payment_token}
                    onClick={() => handlePay(pr.payment_token)}
                  >
                    {actioning === pr.payment_token ? 'Pagando...' : 'Pagar'}
                  </button>
                )}
                {isPending && scope === 'sent' && (
                  <button
                    type="button"
                    className="tx-button tx-button--secondary"
                    disabled={actioning === pr.id}
                    onClick={() => handleCancel(pr.id)}
                  >
                    {actioning === pr.id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {errorMessage && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">No se pudo completar la operación</h3>
            <p className="tx-modal__message">{errorMessage}</p>
            <button
              type="button"
              className="tx-button tx-button--primary tx-button--block"
              onClick={() => setErrorMessage(null)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
