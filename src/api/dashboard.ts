import { getAuthMode } from './auth'
import { getCurrentBalanceSummary } from './balances'
import { convertCurrency } from './exchangeRates'
import { dashboardMock, type ChartPoint, type Metric } from '../data/mocks'

export async function getDashboardMetrics(): Promise<Metric[]> {
  if (getAuthMode() === 'mock') return dashboardMock.metrics

  const balances = await getCurrentBalanceSummary()
  let totalUsd = 0
  for (const balance of balances) {
    const usd =
      balance.currency_code === 'USD'
        ? balance.amount
        : await convertCurrency(balance.currency_code, 'USD', balance.amount)
    totalUsd += usd
  }

  return [
    { label: 'Saldo Total', amount: Math.round(totalUsd * 100) / 100, currency: 'USD', change: 0 },
    { label: 'Ingresos del mes', amount: 0, currency: 'USD', change: 0 },
    { label: 'Gastos del mes', amount: 0, currency: 'USD', change: 0 },
  ]
}

export async function getDashboardChart(): Promise<ChartPoint[]> {
  if (getAuthMode() === 'mock') return dashboardMock.chart

  return dashboardMock.chart.map((point) => ({ month: point.month, ingresos: 0, gastos: 0, saldo: 0 }))
}
