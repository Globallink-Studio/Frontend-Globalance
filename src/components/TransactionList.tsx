import type { Transaction } from '../mocks/data/transactions'
import { transactionStatusLabels } from '../api/transactions'

interface TransactionListProps {
  transactions: Transaction[]
  compact?: boolean
}

export default function TransactionList({ transactions, compact = false }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin transacciones.</p>
  }

  if (compact) {
    return (
      <ul className="tx-list">
        {transactions.map((t) => (
          <li key={t.id} className="tx-list__item">
            <div className="tx-list__info">
              <p className="tx-list__description">{t.description}</p>
              <p className="tx-list__status">
                {t.concept ? `${t.concept} · ` : ''}
                {transactionStatusLabels[t.status]}
              </p>
            </div>
            <p className="tx-list__amount">
              {t.amount.toLocaleString('es-AR')} {t.currency_code}
            </p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-soft">
          <div>
            <p className="text-sm font-medium">{t.description}</p>
            <p className="text-xs text-muted-foreground">
              {t.concept ? `${t.concept} · ` : ''}
              {transactionStatusLabels[t.status]}
            </p>
          </div>
          <p className="text-sm font-semibold">
            {t.amount.toLocaleString('es-AR')} {t.currency_code}
          </p>
        </li>
      ))}
    </ul>
  )
}
