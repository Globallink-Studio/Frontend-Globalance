import { useEffect, useState } from 'react'
import { getCurrentBalanceSummary } from '../../api/balances'
import { getRecentTransactions } from '../../api/transactions'
import type { BalanceSummaryItem } from '../../api/balances'
import type { Transaction } from '../mocks/data/transactions'

const statusLabel: Record<string, string> = {
  completed: 'Completada',
  pending: 'Pendiente',
  failed: 'Fallida',
}

export default function Dashboard() {
  const [summary, setSummary] = useState<BalanceSummaryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getCurrentBalanceSummary().then(setSummary)
    getRecentTransactions(5).then(setTransactions)
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Dinero actual</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summary.map((item) => (
            <div key={item.currency_code} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{item.currency_name}</p>
              <p className="text-2xl font-semibold">
                {item.symbol} {item.amount.toLocaleString('es-AR')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Últimas transacciones</h2>
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-xs text-gray-500">{statusLabel[t.status] ?? t.status}</p>
              </div>
              <p className="text-sm font-semibold">
                {t.amount.toLocaleString('es-AR')} {t.currency_code}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
