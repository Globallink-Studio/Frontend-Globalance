import { useEffect, useState } from 'react'
import { getCurrentWallet } from '../../../api/wallets'
import { getCurrentBalanceSummary } from '../../../api/balances'
import type { Wallet } from '../../../mocks/data/wallets'
import type { BalanceSummaryItem } from '../../../api/balances'

export default function WalletSummary() {
  const [wallet, setWallet] = useState<Wallet | undefined>()
  const [summary, setSummary] = useState<BalanceSummaryItem[]>([])

  useEffect(() => {
    getCurrentWallet().then(setWallet)
    getCurrentBalanceSummary().then(setSummary)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>

      {wallet && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Alias</p>
          <p className="text-lg font-semibold">{wallet.alias}</p>
          <p className="mt-2 text-sm text-gray-500">Número de cuenta</p>
          <p className="text-lg font-semibold">{wallet.account_number}</p>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Saldos</h2>
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
    </div>
  )
}
