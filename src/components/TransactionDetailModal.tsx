import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { transactionStatusLabels } from '../api/transactions'
import type { Transaction } from '../mocks/data/transactions'

const typeLabels: Record<string, string> = {
  transfer: 'Transferencia',
  deposit: 'Depósito',
  conversion: 'Conversión',
  request: 'Solicitud',
  withdrawal: 'Retiro',
}

interface TransactionDetailModalProps {
  transaction: Transaction | null
  onClose: () => void
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  useEffect(() => {
    if (!transaction) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [transaction, onClose])

  if (!transaction) return null

  const date = new Date(transaction.created_at)

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label="Detalle de transacción">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__panel tx-detail">
        <div className="modal__header">
          <div className="modal__header-text">
            <h2 className="modal__title">Detalle de transacción</h2>
            <p className="modal__step">{typeLabels[transaction.type] ?? transaction.type}</p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            <X className="modal__close-icon" />
          </button>
        </div>
        <div className="modal__body">
          <div className="tx-detail__amount">
            <p className="tx-detail__value">
              {transaction.amount.toLocaleString('es-AR')} {transaction.currency_code}
            </p>
            <span className={`tx-status tx-status--${transaction.status}`}>
              {transactionStatusLabels[transaction.status]}
            </span>
          </div>
          <dl className="tx-detail__rows">
            <div className="tx-detail__row">
              <dt>Fecha</dt>
              <dd>
                {date.toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div className="tx-detail__row">
              <dt>Hora</dt>
              <dd>{date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</dd>
            </div>
            <div className="tx-detail__row">
              <dt>Descripción</dt>
              <dd>{transaction.description}</dd>
            </div>
            {transaction.concept && (
              <div className="tx-detail__row">
                <dt>Concepto</dt>
                <dd>{transaction.concept}</dd>
              </div>
            )}
            <div className="tx-detail__row">
              <dt>Moneda</dt>
              <dd>{transaction.currency_code}</dd>
            </div>
            <div className="tx-detail__row">
              <dt>ID</dt>
              <dd className="tx-detail__id">{transaction.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>,
    document.body,
  )
}
