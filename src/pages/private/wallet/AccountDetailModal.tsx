import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowRight, X } from 'lucide-react'
import { getCurrentWallet } from '../../../api/wallets'
import { getTransactionsByCurrency } from '../../../api/transactions'
import type { BalanceSummaryItem } from '../../../api/balances'
import type { Wallet } from '../../../mocks/data/wallets'
import type { Transaction } from '../../../mocks/data/transactions'

interface AccountDetailModalProps {
  open: boolean
  item: BalanceSummaryItem | null
  onClose: () => void
}

const accountTag = (code: string) =>
  code === 'USD' ? 'Cuenta principal' : code === 'EUR' ? 'IBAN virtual · ES21' : 'CVU local'

export default function AccountDetailModal({ open, item, onClose }: AccountDetailModalProps) {
  const [wallet, setWallet] = useState<Wallet | undefined>()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !item) return
    getCurrentWallet().then(setWallet)
    getTransactionsByCurrency(item.currency_code).then((all) => setTransactions(all.slice(0, 3)))
  }, [open, item])

  if (!open || !item) return null

  return createPortal(
    <div className="modal modal--fullscreen" role="dialog" aria-modal="true" aria-label={`Cuenta ${item.currency_code}`}>
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__panel modal__panel--account">
        <div className="modal__header">
          <div className="modal__header-text">
            <h2 className="modal__title">Cuenta {item.currency_code}</h2>
            <p className="modal__step">{item.currency_name}</p>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            <X className="modal__close-icon" />
          </button>
        </div>

        <div className="modal__body account-detail">
          <div className="account-detail__hero">
            <span className="account-detail__icon">{item.currency_code}</span>
            <div className="account-detail__hero-info">
              <p className="account-detail__tag">{accountTag(item.currency_code)}</p>
              <p className="account-detail__balance">
                {item.symbol} {item.amount.toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          <dl className="account-detail__grid">
            <div className="account-detail__field">
              <dt>Alias</dt>
              <dd>{wallet?.alias ?? '—'}</dd>
            </div>
            <div className="account-detail__field">
              <dt>Número de cuenta</dt>
              <dd>{wallet?.account_number ?? '—'}</dd>
            </div>
            <div className="account-detail__field">
              <dt>Moneda</dt>
              <dd>
                {item.currency_code} · {item.currency_name}
              </dd>
            </div>
            <div className="account-detail__field">
              <dt>Saldo total</dt>
              <dd>
                {item.symbol} {item.amount.toLocaleString('es-AR')}
              </dd>
            </div>
          </dl>

          <section className="account-detail__movements">
            <h3 className="account-detail__movements-title">Movimientos recientes</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin movimientos en esta moneda.</p>
            ) : (
              <ul className="account-detail__list">
                {transactions.map((tx) => {
                  const isPositive = tx.type === 'deposit' || tx.type === 'conversion'
                  return (
                    <li key={tx.id} className="account-detail__item">
                      <p className="account-detail__item-description">{tx.description}</p>
                      <p className="account-detail__item-amount">
                        {isPositive ? '+' : '-'}
                        {tx.amount.toLocaleString('es-AR')} {tx.currency_code}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link to="/dashboard/transactions" className="account-detail__link" onClick={onClose}>
              Ver todo el historial
              <ArrowRight className="account-detail__link-icon" />
            </Link>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  )
}
