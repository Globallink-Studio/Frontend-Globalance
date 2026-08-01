import { useEffect, useState } from 'react'
import { getTransactionsByType } from '../../../api/transactions'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'

export default function Conversions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactionsByType('conversion').then(setTransactions)
  }, [])

  return (
    <div>
      <h2>Transacciones / Conversiones</h2>
      <TransactionList transactions={transactions} />
    </div>
  )
}
