import type { Transaction } from '../mocks/data/transactions'
import { transactionStatusLabels } from '../api/transactions'

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500">Sin transacciones.</p>
  }
  return (
    <ul className="space-y-2">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div>
            <p className="text-sm font-medium">{t.description}</p>
            <p className="text-xs text-gray-500">{transactionStatusLabels[t.status]}</p>
          </div>
          <p className="text-sm font-semibold">
            {t.amount.toLocaleString('es-AR')} {t.currency_code}
          </p>
        </li>
      ))}
    </ul>
  )
}
