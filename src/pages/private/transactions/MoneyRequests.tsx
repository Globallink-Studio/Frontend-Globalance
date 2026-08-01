import { useEffect, useState } from 'react'
import { getTransactionsByType } from '../../../api/transactions'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'

export default function MoneyRequests() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactionsByType('request').then(setTransactions)
  }, [])

  return (
    <div>
      <h2>Transacciones / Solicitudes</h2>
      <TransactionList transactions={transactions} />
    </div>
  )
}
