import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { dashboardMock, type Metric, type ChartPoint } from '../../data/mocks'
import { getCurrentBalanceSummary, getUnifiedBalance, type BalanceSummaryItem } from '../../api/balances'
import { getCurrentUser } from '../../api/users'
import { getDashboardMetrics, getDashboardChart } from '../../api/dashboard'
import { convertCurrency } from '../../api/exchangeRates'
import { getRecentTransactions } from '../../api/transactions'
import type { Transaction } from '../../mocks/data/transactions'
import '../../styles/pages/private/dashboard.css'

const statusLabel: Record<string, string> = {
  completed: 'Completada',
  pending: 'Pendiente',
  failed: 'Fallida',
  cancelled: 'Cancelada',
  reversed: 'Revertida',
}

const formatAmount = (value: number, currency: string) => {
  return `${currency} ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { aiSummary } = dashboardMock
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [baseMetrics, setBaseMetrics] = useState<Metric[]>([])
  const [chart, setChart] = useState<ChartPoint[]>([])
  const [balances, setBalances] = useState<BalanceSummaryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [displayCurrency, setDisplayCurrency] = useState('ARS')

  useEffect(() => {
    getCurrentUser().then((u) => setDisplayCurrency(u?.display_currency ?? 'ARS'))
  }, [])

  useEffect(() => {
    getDashboardMetrics().then((m) => {
      setBaseMetrics(m)
      setMetrics(m)
    })
    getDashboardChart().then(setChart)
    getCurrentBalanceSummary().then(setBalances)
    getRecentTransactions(5).then(setTransactions)
  }, [])

  useEffect(() => {
    if (!displayCurrency || baseMetrics.length === 0) return
    const apply = async () => {
      const converted: Metric[] = []
      for (const m of baseMetrics) {
        if (m.label === 'Saldo Total') {
          const total = await getUnifiedBalance(displayCurrency)
          converted.push({ ...m, amount: total, currency: displayCurrency })
        } else if (m.label === 'Ingresos del mes' || m.label === 'Gastos del mes') {
          const amount = await convertCurrency(m.currency, displayCurrency, m.amount)
          converted.push({ ...m, amount, currency: displayCurrency })
        } else {
          converted.push(m)
        }
      }
      setMetrics(converted)
    }
    void apply()
  }, [displayCurrency, baseMetrics])

  return (
    <div className="dashboard">
      <div className="dashboard__metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="dashboard-card dashboard-metric">
            <p className="dashboard-metric__label">{metric.label}</p>
            <p className="dashboard-metric__amount">{formatAmount(metric.amount, metric.currency)}</p>
            <span className={`dashboard-metric__badge${metric.change >= 0 ? ' dashboard-metric__badge--positive' : ' dashboard-metric__badge--negative'}`}>
              {metric.change >= 0 ? '▲' : '▼'} {Math.abs(metric.change)}%
            </span>
          </article>
        ))}
      </div>

      <div className="dashboard__grid">
        <section className="dashboard-card dashboard-chart">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Evolución financiera</h2>
            <span className="dashboard-card__period">Últimos 7 meses</span>
          </div>
          <div className="dashboard-chart__plot">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="var(--pastel-lilac)" fill="var(--pastel-lilac)" fillOpacity={0.3} strokeWidth={2.5} />
                <Area type="monotone" dataKey="gastos" name="Gastos" stroke="var(--pastel-sky)" fill="var(--pastel-sky)" fillOpacity={0.3} strokeWidth={2.5} />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="var(--pastel-mint)" fill="var(--pastel-mint)" fillOpacity={0.3} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-card dashboard-ai">
          <div className="dashboard-ai__header">
            <span className="dashboard-ai__icon" aria-hidden="true">
              <Sparkles className="dashboard-ai__icon-svg" />
            </span>
            <h2 className="dashboard-card__title">Asistente IA</h2>
          </div>
          <p className="dashboard-ai__summary">{aiSummary}</p>
          <button type="button" className="dashboard-ai__button" onClick={() => navigate('/dashboard/assistant')}>
            Consultar a mi asistente
          </button>
        </section>
      </div>

      <section className="dashboard-card dashboard-balances">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Mis monedas</h2>
        </div>
        <ul className="dashboard-balances__list">
          {balances.map((balance) => (
            <li key={balance.currency_code} className="dashboard-balance">
              <span className="dashboard-balance__currency">{balance.currency_code}</span>
              <span className="dashboard-balance__name">{balance.currency_name}</span>
              <span className="dashboard-balance__amount">
                {balance.symbol} {balance.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-card dashboard-transactions">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Últimas transacciones</h2>
        </div>
        <ul className="dashboard-transactions__list">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="dashboard-transaction">
              <div className="dashboard-transaction__info">
                <p className="dashboard-transaction__description">{transaction.description}</p>
                <p className="dashboard-transaction__status">{statusLabel[transaction.status] ?? transaction.status}</p>
              </div>
              <span className="dashboard-transaction__amount">
                {transaction.amount.toLocaleString('es-AR')} {transaction.currency_code}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
