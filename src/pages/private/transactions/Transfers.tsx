import { useEffect, useState } from 'react'
import { getTransactionsByType } from '../../../api/transactions'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'

export default function Transfers() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactionsByType('transfer').then(setTransactions)
  }, [])

  return (
    <div>
      <h2>Transacciones / Transferencias</h2>
      <TransactionList transactions={transactions} />
    </div>
  )
}
