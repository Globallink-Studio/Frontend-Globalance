import { getCurrentBalanceSummary } from './balances'
import { convertCurrency } from './exchangeRates'
import { getCurrentTransactions } from './transactions'
import type { ChartPoint, Metric } from '../data/mocks'
import type { Transaction } from '../mocks/data/transactions'

function isIncome(t: Transaction): boolean {
  if (t.status !== 'completed') return false
  if (t.type === 'deposit') return true
  return t.type === 'transfer' && t.direction === 'in'
}

function isExpense(t: Transaction): boolean {
  if (t.status !== 'completed') return false
  if (t.type === 'withdrawal') return true
  return t.type === 'transfer' && t.direction !== 'in'
}

function getTransactionMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}

function getDashboardMonth(transactions: Transaction[]): string {
  const completed = transactions.filter((t) => t.status === 'completed')
  if (completed.length === 0) return new Date().toISOString().slice(0, 7)
  const latest = completed.reduce((max, t) => (t.created_at > max.created_at ? t : max), completed[0])
  return getTransactionMonth(latest.created_at)
}

async function sumByCurrencyToUsd(amounts: Record<string, number>): Promise<number> {
  let total = 0
  for (const [currency, amount] of Object.entries(amounts)) {
    total += await convertCurrency(currency, 'USD', amount)
  }
  return Math.round(total * 100) / 100
}

export async function getDashboardMetrics(): Promise<Metric[]> {
  const balances = await getCurrentBalanceSummary()
  const transactions = await getCurrentTransactions()
  const month = getDashboardMonth(transactions)
  const monthTxs = transactions.filter(
    (t) => t.status === 'completed' && getTransactionMonth(t.created_at) === month,
  )

  let totalUsd = 0
  for (const balance of balances) {
    const usd =
      balance.currency_code === 'USD'
        ? balance.amount
        : await convertCurrency(balance.currency_code, 'USD', balance.amount)
    totalUsd += usd
  }

  const incomeByCurrency: Record<string, number> = {}
  const expenseByCurrency: Record<string, number> = {}
  for (const t of monthTxs) {
    if (isIncome(t)) {
      incomeByCurrency[t.currency_code] = (incomeByCurrency[t.currency_code] ?? 0) + t.amount
    }
    if (isExpense(t)) {
      expenseByCurrency[t.currency_code] = (expenseByCurrency[t.currency_code] ?? 0) + t.amount
    }
  }

  const incomeUsd = await sumByCurrencyToUsd(incomeByCurrency)
  const expenseUsd = await sumByCurrencyToUsd(expenseByCurrency)

  return [
    { label: 'Saldo Total', amount: Math.round(totalUsd * 100) / 100, currency: 'USD', change: 0 },
    { label: 'Ingresos del mes', amount: incomeUsd, currency: 'USD', change: 0 },
    { label: 'Gastos del mes', amount: expenseUsd, currency: 'USD', change: 0 },
  ]
}

export async function getDashboardChart(): Promise<ChartPoint[]> {
  const transactions = await getCurrentTransactions()
  const month = getDashboardMonth(transactions)
  const [year, monthNum] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const monthTxs = transactions.filter(
    (t) => t.status === 'completed' && getTransactionMonth(t.created_at) === month,
  )

  const points: ChartPoint[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const datePrefix = `${month}-${String(day).padStart(2, '0')}`
    const dayTxs = monthTxs.filter((t) => t.created_at.startsWith(datePrefix))

    const incomeByCurrency: Record<string, number> = {}
    const expenseByCurrency: Record<string, number> = {}
    for (const t of dayTxs) {
      if (isIncome(t)) {
        incomeByCurrency[t.currency_code] = (incomeByCurrency[t.currency_code] ?? 0) + t.amount
      }
      if (isExpense(t)) {
        expenseByCurrency[t.currency_code] = (expenseByCurrency[t.currency_code] ?? 0) + t.amount
      }
    }

    const ingresos = await sumByCurrencyToUsd(incomeByCurrency)
    const gastos = await sumByCurrencyToUsd(expenseByCurrency)
    const prevSaldo = points.length > 0 ? points[points.length - 1].saldo : 0
    points.push({
      month: String(day),
      ingresos,
      gastos,
      saldo: Math.round((prevSaldo + ingresos - gastos) * 100) / 100,
    })
  }

  return points
}
