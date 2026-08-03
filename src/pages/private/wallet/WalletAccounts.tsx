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
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-400"
          >
            <p className="text-sm text-gray-500">{item.currency_name}</p>
            <p className="text-2xl font-semibold">
              {item.symbol} {item.amount.toLocaleString('es-AR')}
            </p>
            <p className="mt-2 text-xs text-blue-500">Ver detalle →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
