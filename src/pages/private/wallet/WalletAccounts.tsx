import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentBalanceSummary } from '../../../api/balances'
import type { BalanceSummaryItem } from '../../../api/balances'

export default function WalletAccounts() {
  const [summary, setSummary] = useState<BalanceSummaryItem[]>([])

  useEffect(() => {
    getCurrentBalanceSummary().then(setSummary)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cuentas</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <Link
            key={item.currency_code}
            to={`/dashboard/wallet/accounts/${item.currency_code.toLowerCase()}`}
            className="block rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-ring"
          >
            <p className="text-sm text-muted-foreground">{item.currency_name}</p>
            <p className="text-2xl font-semibold">
              {item.symbol} {item.amount.toLocaleString('es-AR')}
            </p>
            <p className="mt-2 text-xs text-ring">Ver detalle →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
