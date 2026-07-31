import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentBalances } from '../../../api/balances'
import { getTransactionsByCurrency } from '../../../api/transactions'
import TransactionList from '../../../components/TransactionList'
import type { Balance } from '../../../mocks/data/balances'
import type { Transaction } from '../../../mocks/data/transactions'

export default function AccountDetail() {
  const { currency } = useParams()
  const code = currency?.toUpperCase() ?? ''
  const [balance, setBalance] = useState<Balance | undefined>()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getCurrentBalances().then((bs) => setBalance(bs.find((b) => b.currency_code === code)))
    getTransactionsByCurrency(code).then(setTransactions)
  }, [code])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cuenta {code}</h1>

      {balance && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Saldo disponible</p>
          <p className="text-2xl font-semibold">
            {balance.amount.toLocaleString('es-AR')} {balance.currency_code}
          </p>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Historial de la cuenta</h2>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  )
}
