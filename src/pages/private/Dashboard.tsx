import { Sparkles } from 'lucide-react'
import { dashboardMock } from '../../data/mocks'
import '../../styles/pages/private/dashboard.css'

const barGradients = ['bar--lilac', 'bar--sky', 'bar--mint', 'bar--peach']

const formatAmount = (value: number, currency: string) => {
  return `${currency} ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Dashboard() {
  const { metrics, balances, chart, aiSummary } = dashboardMock

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
            <h2 className="dashboard-card__title">Flujo de ingresos</h2>
            <span className="dashboard-card__period">Últimos 7 meses</span>
          </div>
          <div className="dashboard-chart__plot">
            {chart.map((bar, index) => (
              <div key={bar.month} className="dashboard-chart__col">
                <div className="dashboard-chart__track">
                  <div
                    className={`dashboard-chart__bar ${barGradients[index % barGradients.length]}`}
                    style={{ height: `${(bar.income / 5000) * 100}%` }}
                    title={`${bar.month}: ${formatAmount(bar.income, 'USD')}`}
                  />
                </div>
                <span className="dashboard-chart__label">{bar.month}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card dashboard-ai">
          <div className="dashboard-ai__header">
            <span className="dashboard-ai__icon" aria-hidden="true">
              <Sparkles className="dashboard-ai__icon-svg" />
            </span>
            <h2 className="dashboard-card__title">Copiloto IA</h2>
          </div>
          <p className="dashboard-ai__summary">{aiSummary}</p>
          <button type="button" className="dashboard-ai__button">
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
            <li key={balance.currency} className="dashboard-balance">
              <span className="dashboard-balance__currency">{balance.currency}</span>
              <span className="dashboard-balance__name">{balance.name}</span>
              <span className="dashboard-balance__amount">
                {balance.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {balance.currency}
              </span>
              <span className="dashboard-balance__usd">≈ {formatAmount(balance.usdValue, 'USD')}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
