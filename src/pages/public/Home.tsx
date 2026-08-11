import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, User, ArrowRight, Sparkles, Coins, TrendingUp, RefreshCw, ChevronDown, Mail } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ThemeToggle } from '../../components/ThemeToggle'
import ProfileMenu from '../../components/layout/ProfileMenu'
import AppFooter from '../../components/layout/AppFooter'
import { useAuth } from '../../providers/authentication/AuthContext'
import { getCurrentUserProfile } from '../../api/users'
import type { CompanyProfile } from '../../mocks/data/companyProfiles'
import { landingMock } from '../../data/mocks'
import '../../styles/pages/public/home.css'

const navLinks = [
  { label: 'Inicio', to: '#inicio' },
  { label: 'Preguntas frecuentes', to: '#preguntas' },
  { label: 'Nosotros', to: '#nosotros' },
]

const featureIcons = [Coins, TrendingUp, RefreshCw]

const balanceEvolution = [
  { month: 'Ene', saldo: 8200 },
  { month: 'Feb', saldo: 8900 },
  { month: 'Mar', saldo: 8600 },
  { month: 'Abr', saldo: 9700 },
  { month: 'May', saldo: 11200 },
  { month: 'Jun', saldo: 11800 },
  { month: 'Jul', saldo: 12480.5 },
]

const quoteEvolution = [
  { time: '09:00', compra: 1242 },
  { time: '10:00', compra: 1246 },
  { time: '11:00', compra: 1244 },
  { time: '12:00', compra: 1249 },
  { time: '13:00', compra: 1251 },
  { time: '14:00', compra: 1248 },
  { time: '15:00', compra: 1253 },
  { time: '16:00', compra: 1256 },
  { time: '17:00', compra: 1254 },
  { time: '18:00', compra: 1258 },
]

const teamMembers = [
  {
    name: 'Fernanda Posada',
    role: 'Fullstack · Frontend',
    email: 'ferposadagarcia@gmail.com',
    initials: 'FP',
  },
  {
    name: 'Lucia Lemes',
    role: 'Fullstack · Frontend',
    email: 'lemeslucya@gmail.com',
    initials: 'LL',
  },
  {
    name: 'Manuela Henao',
    role: 'Fullstack · Backend',
    email: 'manuelahenaod19@gmail.com',
    initials: 'MH',
  },
  {
    name: 'Jazmin Morinigo',
    role: 'Fullstack · Backend',
    email: 'noejazminmrivas@gmail.com',
    initials: 'JM',
  },
]

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const faqs = [
  {
    question: '¿Cómo agrego dinero a mi billetera?',
    answer:
      'Podés cargar saldo desde la sección Billetera usando tu tarjeta o una transferencia desde otra cuenta de Globalance. Elegí el método, ingresá el monto y confirmá la operación.',
  },
  {
    question: '¿Cómo envío dinero a otra persona?',
    answer:
      'Ingresá a Billetera y tocá el botón de transferencia. Completá el alias o número de cuenta del destinatario, elegí la moneda y el monto, y confirmá.',
  },
  {
    question: '¿Cuánto tarda una transferencia?',
    answer:
      'Las transferencias entre usuarios de Globalance se acreditan al instante.',
  },
  {
    question: '¿Mi dinero está seguro?',
    answer:
      'Sí. Tus fondos se protegen con cifrado en tránsito y en reposo, verificación de identidad y autenticación segura. Cada operación queda registrada en tu historial para que puedas auditarla.',
  },
  {
    question: '¿Cómo recupero el acceso a mi cuenta?',
    answer:
      'Desde la pantalla de inicio de sesión usá la opción de recuperación de contraseña. También podés completar la verificación de identidad para restaurar el acceso a tu cuenta.',
  },
  {
    question: '¿Qué monedas soporta Globalance?',
    answer:
      'Globalance soporta USD, EUR y ARS. Podés convertir entre ellas desde tu billetera al instante, con tipos de cambio actualizados.',
  },
  {
    question: '¿Cómo contacto a soporte?',
    answer:
      'Usá el Asistente IA desde tu panel para resolver dudas al instante, o escribinos por los canales de atención que figuran en la sección de contacto.',
  },
]

export default function Home() {
  const { isAuthenticated, initializing } = useAuth()
  const { totalBalance, currencies, stats, features } = landingMock
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [team] = useState(() => shuffle(teamMembers))
  const [displayName, setDisplayName] = useState('')
  const [activeSection, setActiveSection] = useState('#inicio')

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.to.slice(1)))
      .filter((section): section is HTMLElement => section !== null)

    const handleScroll = () => {
      const offset = 120
      let current = navLinks[0].to
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset) {
          current = `#${section.id}`
        }
      }
      setActiveSection(current)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    getCurrentUserProfile().then((profile) => {
      if (!profile) return
      if ('first_name' in profile) {
        setDisplayName(`${profile.first_name} ${profile.last_name}`)
      } else {
        setDisplayName((profile as CompanyProfile).legal_name)
      }
    })
  }, [isAuthenticated])

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
            <a
              key={link.label}
              href={link.to}
              className={`home-nav__link${activeSection === link.to ? ' home-nav__link--active' : ''}`}
              aria-current={activeSection === link.to ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="home-nav__actions">
          <ThemeToggle />
          {initializing ? null : isAuthenticated ? (
            <ProfileMenu name={displayName} />
          ) : (
            <>
              <Link
                to="/signin"
                className="home-nav__user"
                aria-label="Iniciar sesión"
              >
                <User className="home-nav__user-icon" />
              </Link>
              <Link to="/signin" className="home-nav__login">Ingresar</Link>
              <Link to="/signup" className="home-nav__cta">Crear cuenta</Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section id="inicio" className="home-hero">
          <div className="home-hero__left">
            <h1 className="home-hero__title">
              Tu dinero en un solo lugar,  <span className="home-hero__highlight">y sin fronteras</span>
            </h1>
            <p className="home-hero__subtitle">
              Simplifica tus cobros internacionales, maximiza tus ingresos con
              tipos de cambio reales y visualiza tu crecimiento financiero con
              total claridad y sin complicaciones.
            </p>

            <div className="home-hero__actions">
              <Link to={isAuthenticated ? '/dashboard' : '/signin'} className="home-hero__primary">
                Ver tu Billetera
                <ArrowRight className="home-hero__primary-icon" />
              </Link>
              <Link to={isAuthenticated ? '/dashboard/assistant' : '/signin'} className="home-hero__secondary">
                <Sparkles className="home-hero__secondary-icon" />
                Probar el agente IA
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

        <section className="home-demo">
          <div className="home-demo__header">
            <h2 className="home-demo__title">Así se ve tu dinero</h2>
            <p className="home-demo__subtitle">
              Ejemplo ilustrativo con datos ficticios de lo que vas a encontrar dentro de tu billetera.
            </p>
          </div>
          <div className="home-demo__grid">
            <article className="home-demo-card">
              <h3 className="home-demo-card__title">Evolución del saldo</h3>
              <div className="home-demo-card__plot">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceEvolution} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="homeSaldoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--pastel-lilac)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--pastel-lilac)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area type="monotone" dataKey="saldo" name="Saldo" stroke="var(--pastel-lilac)" fill="url(#homeSaldoGradient)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="home-demo-card">
              <h3 className="home-demo-card__title">Cotización en tiempo real · USD → ARS</h3>
              <div className="home-demo-card__plot">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quoteEvolution} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 4', 'dataMax + 4']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        color: 'var(--foreground)',
                      }}
                      formatter={(value) => [`$${Number(value).toLocaleString('es-AR')}`, 'Compra']}
                    />
                    <Line
                      type="monotone"
                      dataKey="compra"
                      name="Compra"
                      stroke="var(--pastel-sky)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </section>

        <section id="preguntas" className="home-faq">
          <h2 className="home-faq__title">Preguntas frecuentes</h2>
          <div className="home-faq__list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div key={faq.question} className="home-faq__item">
                  <h3 className="home-faq__heading">
                    <button
                      type="button"
                      className="home-faq__button"
                      aria-expanded={isOpen}
                      aria-controls={`home-faq-body-${index}`}
                      id={`home-faq-heading-${index}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span className="home-faq__question">{faq.question}</span>
                      <ChevronDown className={`home-faq__icon${isOpen ? ' home-faq__icon--open' : ''}`} aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    id={`home-faq-body-${index}`}
                    className={`home-faq__body${isOpen ? ' home-faq__body--open' : ''}`}
                    role="region"
                    aria-labelledby={`home-faq-heading-${index}`}
                  >
                    <p className="home-faq__answer">{faq.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section id="nosotros" className="home-about">
          <div className="home-about__header">
            <h2 className="home-about__title">Nosotros</h2>
            <p className="home-about__subtitle">
              Somos el equipo detrás de Globalance, un proyecto final de Soy Henry.
              Fullstack developers con especialización en frontend y backend.
            </p>
          </div>
          <div className="home-about__grid">
            {team.map((member) => (
              <article key={member.name} className="home-member">
                <span className="home-member__avatar" aria-hidden="true">
                  {member.initials}
                </span>
                <h3 className="home-member__name">{member.name}</h3>
                <p className="home-member__role">{member.role}</p>
                <a href={`mailto:${member.email}`} className="home-member__email">
                  <Mail className="home-member__email-icon" />
                  {member.email}
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
