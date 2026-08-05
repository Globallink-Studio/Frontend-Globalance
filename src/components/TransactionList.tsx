import type { Transaction } from '../mocks/data/transactions'
import { transactionStatusLabels } from '../api/transactions'

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin transacciones.</p>
  }
  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-soft">
          <div>
            <p className="text-sm font-medium">{t.description}</p>
            <p className="text-xs text-muted-foreground">{transactionStatusLabels[t.status]}</p>
          </div>
          <p className="text-sm font-semibold">
            {t.amount.toLocaleString('es-AR')} {t.currency_code}
          </p>
        </li>
      ))}
    </ul>
  )
}
