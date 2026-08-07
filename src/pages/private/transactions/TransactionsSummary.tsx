import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getRecentTransactions } from '../../../api/transactions'
import { getQuotes } from '../../../api/exchangeRates'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'
import type { ExchangeRate } from '../../../mocks/data/exchangeRates'

type Period = 'month' | '30d'

const typeLabels: Record<string, string> = {
  transfer: 'Transferencias',
  deposit: 'Depósitos',
  conversion: 'Conversiones',
  request: 'Solicitudes',
}

const currencySymbol: Record<string, string> = {
  USD: 'US$',
  EUR: '€',
  ARS: '$',
}

const round2 = (n: number) => Math.round(n * 100) / 100

const fmtUSD = (n: number) =>
  `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtNative = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isIncome = (t: Transaction) => t.type === 'deposit' || t.type === 'conversion'

export default function TransactionsSummary() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])
  const [period, setPeriod] = useState<Period>('30d')

  useEffect(() => {
    getRecentTransactions(1000).then(setTransactions)
    getQuotes().then(setQuotes)
  }, [])

  const quoteByCode = useMemo(() => new Map(quotes.map((q) => [q.currency_code, q])), [quotes])

  const periodStart = useMemo(() => {
    const now = new Date()
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
    const start = new Date(now)
    start.setDate(start.getDate() - 30)
    return start
  }, [period])

  const periodTransactions = useMemo(
    () =>
      transactions
        .filter((t) => new Date(t.created_at) >= periodStart)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [transactions, periodStart],
  )

  const usdValue = useMemo(() => {
    const usd = quoteByCode.get('USD')
    if (!usd) return () => 0
    return (t: Transaction) => {
      const quote = quoteByCode.get(t.currency_code)
      if (!quote) return 0
      return t.amount * (quote.buy_price / usd.buy_price)
    }
  }, [quoteByCode])

  const metrics = useMemo(() => {
    let ingresos = 0
    let egresos = 0
    for (const t of periodTransactions) {
      const v = usdValue(t)
      if (isIncome(t)) ingresos += v
      else egresos += v
    }
    return { ingresos: round2(ingresos), egresos: round2(egresos), neto: round2(ingresos - egresos) }
  }, [periodTransactions, usdValue])

  const byType = useMemo(() => {
    const totals: Record<string, { total: number; count: number }> = {
      transfer: { total: 0, count: 0 },
      deposit: { total: 0, count: 0 },
      conversion: { total: 0, count: 0 },
      request: { total: 0, count: 0 },
    }
    for (const t of periodTransactions) {
      totals[t.type].total += usdValue(t)
      totals[t.type].count += 1
    }
    return (Object.keys(typeLabels) as (keyof typeof typeLabels)[]).map((type) => ({
      type,
      label: typeLabels[type],
      total: round2(totals[type].total),
      count: totals[type].count,
    }))
  }, [periodTransactions, usdValue])

  const byCurrency = useMemo(() => {
    const totals = new Map<string, { total: number; count: number }>()
    for (const t of periodTransactions) {
      const cur = totals.get(t.currency_code) ?? { total: 0, count: 0 }
      cur.total += t.amount
      cur.count += 1
      totals.set(t.currency_code, cur)
    }
    return [...totals.entries()].map(([code, v]) => ({
      code,
      symbol: currencySymbol[code] ?? code,
      total: round2(v.total),
      count: v.count,
    }))
  }, [periodTransactions])

  const weekly = useMemo(() => {
    const now = new Date()
    const monthShort = (d: Date) =>
      d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
    const weeks: { week: string; ingresos: number; egresos: number }[] = []
    for (let i = 4; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7)
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6)
      let ingresos = 0
      let egresos = 0
      for (const t of periodTransactions) {
        const d = new Date(t.created_at)
        if (d >= start && d <= end) {
          const v = usdValue(t)
          if (isIncome(t)) ingresos += v
          else egresos += v
        }
      }
      weeks.push({
        week: `${start.getDate()} ${monthShort(start)}`,
        ingresos: round2(ingresos),
        egresos: round2(egresos),
      })
    }
    return weeks
  }, [periodTransactions, usdValue])

  const maxType = Math.max(...byType.map((b) => b.total), 1)

  return (
    <div className="tx-page">
      <div className="tx-summary__header">
        <h2 className="tx-page__title">Resumen de transacciones</h2>
        <div className="tx-period" role="tablist" aria-label="Período">
          <button
            type="button"
            className={`tx-period__btn${period === 'month' ? ' tx-period__btn--active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Este mes
          </button>
          <button
            type="button"
            className={`tx-period__btn${period === '30d' ? ' tx-period__btn--active' : ''}`}
            onClick={() => setPeriod('30d')}
          >
            Últimos 30 días
          </button>
        </div>
      </div>

      <div className="tx-summary__metrics">
        <article className="tx-card tx-summary__metric">
          <p className="tx-summary__metric-label">Ingresos</p>
          <p className="tx-summary__metric-amount tx-summary__metric-amount--positive">{fmtUSD(metrics.ingresos)}</p>
          <span className="tx-summary__metric-hint">Entradas del período</span>
        </article>
        <article className="tx-card tx-summary__metric">
          <p className="tx-summary__metric-label">Egresos</p>
          <p className="tx-summary__metric-amount tx-summary__metric-amount--negative">{fmtUSD(metrics.egresos)}</p>
          <span className="tx-summary__metric-hint">Salidas del período</span>
        </article>
        <article className="tx-card tx-summary__metric">
          <p className="tx-summary__metric-label">Balance neto</p>
          <p className={`tx-summary__metric-amount${metrics.neto >= 0 ? ' tx-summary__metric-amount--positive' : ' tx-summary__metric-amount--negative'}`}>
            {fmtUSD(metrics.neto)}
          </p>
          <span className="tx-summary__metric-hint">Ingresos menos egresos</span>
        </article>
      </div>

      <div className="tx-summary__grid">
        <section className="tx-card tx-summary__card">
          <h3 className="tx-card__title">Movimiento por semana</h3>
          <div className="tx-summary__chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtUSD(v)} />
                <Tooltip
                  cursor={{ fill: 'color-mix(in oklab, var(--muted) 40%, transparent)' }}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value, name) => [fmtUSD(Number(value)), name === 'ingresos' ? 'Ingresos' : 'Egresos']}
                />
                <Bar dataKey="ingresos" name="ingresos" fill="var(--pastel-mint)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="egresos" name="egresos" fill="var(--pastel-lilac)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="tx-card tx-summary__card">
          <h3 className="tx-card__title">Por tipo de operación</h3>
          <ul className="tx-breakdown">
            {byType.map((b) => (
              <li key={b.type} className="tx-breakdown__row">
                <div className="tx-breakdown__head">
                  <span className="tx-breakdown__label">{b.label}</span>
                  <span className="tx-breakdown__value">
                    {fmtUSD(b.total)}
                    <span className="tx-breakdown__count">{b.count} op.</span>
                  </span>
                </div>
                <div className="tx-breakdown__track">
                  <div className="tx-breakdown__bar" style={{ width: `${(b.total / maxType) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="tx-card tx-summary__card">
          <h3 className="tx-card__title">Por moneda</h3>
          <ul className="tx-breakdown">
            {byCurrency.map((b) => (
              <li key={b.code} className="tx-breakdown__row">
                <div className="tx-breakdown__head">
                  <span className="tx-breakdown__label">{b.code}</span>
                  <span className="tx-breakdown__value">
                    {b.symbol} {fmtNative(b.total)}
                    <span className="tx-breakdown__count">{b.count} op.</span>
                  </span>
                </div>
              </li>
            ))}
            {byCurrency.length === 0 && <p className="tx-list__empty">Sin movimientos en el período.</p>}
          </ul>
        </section>

        <section className="tx-card tx-summary__card">
          <h3 className="tx-card__title">Últimas transacciones</h3>
          <TransactionList transactions={periodTransactions.slice(0, 6)} compact />
        </section>
      </div>
    </div>
  )
}
