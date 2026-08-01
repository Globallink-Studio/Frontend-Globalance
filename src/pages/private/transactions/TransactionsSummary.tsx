import { useEffect, useState } from 'react'
import { getRecentTransactions } from '../../../api/transactions'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'

export default function TransactionsSummary() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getRecentTransactions(10).then(setTransactions)
  }, [])

  return (
    <div>
      <h2>Transacciones / Resumen</h2>
      <TransactionList transactions={transactions} />
    </div>
  )
}
