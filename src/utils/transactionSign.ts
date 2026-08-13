import type { Transaction } from '../mocks/data/transactions'

export function transactionSign(t: Transaction): string {
  const isExpense = t.type === 'withdrawal' || (t.type === 'transfer' && t.direction !== 'in')
  if (isExpense) return '-'
  const isIncome = t.type === 'deposit' || t.type === 'request' || (t.type === 'transfer' && t.direction === 'in')
  return isIncome ? '+' : ''
}
