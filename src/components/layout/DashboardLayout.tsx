import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Wallet,
  ArrowLeftRight,
  Users,
  LineChart,
  User,
  Search,
  Sparkles,
  ArrowLeft,
  Menu,
} from 'lucide-react'
import { getCurrentUserProfile } from '../../api/users'
import type { CompanyProfile } from '../../mocks/data/companyProfiles'
import { ThemeToggle } from '../ThemeToggle'
import '../../styles/components/dashboard-layout.css'

const menuItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Wallet', to: '/dashboard/wallet', icon: Wallet },
  { label: 'Transacciones', to: '/dashboard/transactions', icon: ArrowLeftRight },
  { label: 'Wallet Grupal', to: '/dashboard/groups', icon: Users },
  { label: 'Cotizaciones', to: '/dashboard/exchange', icon: LineChart },
  { label: 'Perfil', to: '/dashboard/profile', icon: User },
  { label: 'Buscar', to: '/dashboard/search', icon: Search },
  { label: 'Asistente IA', to: '/dashboard/assistant', icon: Sparkles },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/transactions': 'Transacciones',
  '/dashboard/groups': 'Wallet Grupal',
  '/dashboard/exchange': 'Cotizaciones',
  '/dashboard/profile': 'Perfil',
  '/dashboard/search': 'Buscar',
  '/dashboard/assistant': 'Asistente IA',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const location = useLocation()

  useEffect(() => {
    getCurrentUserProfile().then((profile) => {
      if (!profile) return
      if ('first_name' in profile) {
        setDisplayName(`${profile.first_name} ${profile.last_name}`)
      } else {
        setDisplayName((profile as CompanyProfile).legal_name)
      }
    })
  }, [])

  const currentTitle =
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Globalance'

  return (
    <div className="app-shell">
      <div className={`app-shell__backdrop${sidebarOpen ? ' app-shell__backdrop--visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`app-sidebar${sidebarOpen ? ' app-sidebar--open' : ''}`}>
        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo" aria-hidden="true">
            <Wallet className="app-sidebar__logo-icon" />
          </span>
          <span className="app-sidebar__name">Globalance</span>
        </div>

        <nav className="app-sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
              }
            >
              <item.icon className="app-sidebar__icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <NavLink to="/" className="app-sidebar__link app-sidebar__link--back">
            <ArrowLeft className="app-sidebar__icon" />
            Volver al inicio
          </NavLink>
        </div>
      </aside>

      <div className="app-shell__main">
        <header className="app-topbar">
          <button
            type="button"
            className="app-topbar__burger"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Abrir menú"
          >
            <Menu className="app-topbar__burger-icon" />
          </button>
          <h1 className="app-topbar__title">{currentTitle}</h1>
          {displayName && <span className="app-topbar__user">Hola, {displayName}</span>}
          <ThemeToggle />
        </header>

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
