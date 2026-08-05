import { Link } from 'react-router-dom'
import { Wallet, ArrowRight, Sparkles, Coins, TrendingUp, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import LogoutButton from '../../components/LogoutButton'
import { useAuth } from '../../providers/authentication/AuthContext'
import { landingMock } from '../../data/mocks'
import '../../styles/pages/public/home.css'

const navLinks = [
  { label: 'Producto', to: '#producto' },
  { label: 'Precios', to: '#precios' },
  { label: 'Recursos', to: '#recursos' },
]

const featureIcons = [Coins, TrendingUp, RefreshCw]

export default function Home() {
  const { isAuthenticated, initializing } = useAuth()
  const { totalBalance, currencies, stats, features } = landingMock

  return (
    <div className="home">
      <header className="home-nav">
        <div className="home-nav__brand">
          <span className="home-nav__logo" aria-hidden="true">
            <Wallet className="home-nav__logo-icon" />
          </span>
          <span className="home-nav__name">Globalance</span>
        </div>

        <nav className="home-nav__menu">
          {navLinks.map((link) => (
            <a key={link.label} href={link.to} className="home-nav__link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="home-nav__actions">
          <ThemeToggle />
          {initializing ? null : isAuthenticated ? (
            <LogoutButton />
          ) : (
            <>
              <Link to="/signin" className="home-nav__login">Ingresar</Link>
              <Link to="/signup" className="home-nav__cta">Crear cuenta</Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero__left">
            <h1 className="home-hero__title">
              Tu dinero en un solo lugar, y <span className="home-hero__highlight">sin fronteras</span>
            </h1>
            <p className="home-hero__subtitle">
              Simplifica tus cobros internacionales, maximiza tus ingresos con
              tipos de cambio reales y visualiza tu crecimiento financiero con
              total claridad y sin complicaciones.
            </p>

            <div className="home-hero__actions">
              <Link to={isAuthenticated ? '/dashboard' : '/signin'} className="home-hero__primary">
                Ver tu Wallet
                <ArrowRight className="home-hero__primary-icon" />
              </Link>
              <Link to="/dashboard/assistant" className="home-hero__secondary">
                <Sparkles className="home-hero__secondary-icon" />
                Probar el copiloto IA
              </Link>
            </div>

            <div className="home-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="home-stat">
                  <span className="home-stat__value">{stat.value}</span>
                  <span className="home-stat__label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="home-hero__right">
            <div className="home-card">
              <div className="home-card__header">
                <span className="home-card__label">Saldo unificado</span>
                <span className="home-card__total">{totalBalance}</span>
              </div>
              <ul className="home-card__list">
                {currencies.map((currency) => (
                  <li key={currency.code} className="home-card__row">
                    <span className="home-card__badge">{currency.code}</span>
                    <div className="home-card__info">
                      <span className="home-card__name">{currency.name}</span>
                      <div className="home-card__track">
                        <div
                          className="home-card__bar"
                          style={{ width: `${currency.ratio}%` }}
                        />
                      </div>
                    </div>
                    <span className="home-card__amount">{currency.amount.toLocaleString('es-AR')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="producto" className="home-features">
          {features.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <article key={feature.title} className="home-feature">
                <span className="home-feature__icon" aria-hidden="true">
                  <Icon className="home-feature__icon-svg" />
                </span>
                <h3 className="home-feature__title">{feature.title}</h3>
                <p className="home-feature__description">{feature.description}</p>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
