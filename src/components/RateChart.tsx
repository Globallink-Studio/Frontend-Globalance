import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { getRateHistory } from '../api/exchangeRates'
import type { ExchangeRatePoint } from '../mocks/data/exchangeRates'
import '../styles/components/rate-chart.css'

const DAYS = 30
const PAIRS = [
  { value: 'USD/ARS', label: 'USD / ARS' },
  { value: 'EUR/ARS', label: 'EUR / ARS' },
  { value: 'USD/EUR', label: 'USD / EUR' },
]

const fmt = (v: number) => v.toLocaleString('es-AR')

function ChartTooltip({ active, label, payload }: { active?: boolean; label?: string; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  const formatted = value < 10 ? value.toLocaleString('es-AR', { maximumFractionDigits: 4 }) : value.toLocaleString('es-AR')
  return (
    <div className="rate-chart__tooltip">
      {label && <span className="rate-chart__tooltip-label">{label}</span>}
      <span className="rate-chart__tooltip-value">${formatted}</span>
    </div>
  )
}

function asPoints(history: ExchangeRatePoint[], ratioTo?: number): { label: string; value: number }[] {
  return history.map((p) => ({
    label: p.date.slice(5),
    value: ratioTo !== undefined ? Math.round((p.buy_price / ratioTo) * 10000) / 10000 : p.buy_price,
  }))
}

export default function RateChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const [pair, setPair] = useState('USD/ARS')
  const [points, setPoints] = useState<{ label: string; value: number }[]>([])

  const [base, quote] = pair.split('/')

  useEffect(() => {
    let cancelled = false
    if (quote === 'ARS') {
      getRateHistory(base, DAYS).then((history) => {
        if (cancelled) return
        setPoints(asPoints(history))
      })
      return () => {
        cancelled = true
      }
    }
    Promise.all([getRateHistory(base, DAYS), getRateHistory(quote, DAYS)]).then(([a, b]) => {
      if (cancelled) return
      setPoints(asPoints(a).map((p, i) => ({ ...p, value: Math.round((a[i].buy_price / (b[i]?.buy_price ?? 1)) * 10000) / 10000 })))
    })
    return () => {
      cancelled = true
    }
  }, [base, quote, refreshKey])

  const data = useMemo(() => points, [points])

  const isEmpty = data.length === 0

  const first = data[0]?.value ?? 0
  const last = data[data.length - 1]?.value ?? 0
  const delta = first > 0 ? ((last - first) / first) * 100 : 0
  const rounded = Math.round(delta * 10) / 10
  const up = rounded > 0
  const down = rounded < 0
  const color = up ? 'var(--success)' : down ? 'var(--destructive)' : 'var(--chart-5)'
  const gradId = 'rate-chart-grad'
  const isRatio = quote !== 'ARS'
  const formattedLast = isRatio ? last.toLocaleString('es-AR', { maximumFractionDigits: 4 }) : `$${fmt(last)}`

  return (
    <div className="rate-chart">
      <div className="rate-chart__header">
        <div>
          <h3 className="rate-chart__title">Evolución</h3>
          <p className="rate-chart__sub">{pair}</p>
        </div>
        <div className="rate-chart__range">
          {PAIRS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPair(p.value)}
              className={`rate-chart__range-btn${pair === p.value ? ' rate-chart__range-btn--active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rate-chart__value-row">
        <span className="rate-chart__value">{isEmpty ? '—' : formattedLast}</span>
        {!isEmpty && (
          <span
            className={`rate-chart__delta${up ? ' rate-chart__delta--up' : down ? ' rate-chart__delta--down' : ' rate-chart__delta--flat'}`}
          >
            {up && <TrendingUp className="size-3" />}
            {down && <TrendingDown className="size-3" />}
            {rounded === 0 ? 'Estable' : `${rounded > 0 ? '+' : ''}${fmt(rounded)}%`}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="rate-chart__empty">
          El histórico de tasas estará disponible próximamente.
        </div>
      ) : (
        <div className="rate-chart__plot">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v: number) => (v < 10 ? v.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : fmt(v))}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: 'var(--border)' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
