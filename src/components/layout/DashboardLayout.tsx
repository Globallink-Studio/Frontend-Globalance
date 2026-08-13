import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
  Home,
  Wallet,
  History,
  Users,
  BookUser,
  CreditCard,
  LineChart,
  Search,
  Sparkles,
  Menu,
  Bell,
} from 'lucide-react'
import { getCurrentUserProfile } from '../../api/users'
import type { CompanyProfile } from '../../mocks/data/companyProfiles'
import { ThemeToggle } from '../ThemeToggle'
import ProfileMenu from './ProfileMenu'
import AppFooter from './AppFooter'
import { useNotifications } from '../../hooks/useNotifications'
import { useNotificationPrefs } from '../../hooks/useNotificationPrefs'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import NotificationsList from '../notifications/NotificationsList'
import SearchModal from '../search/SearchModal'
import '../../styles/components/dashboard-layout.css'

const menuItems = [
  { label: 'Resumen', to: '/dashboard', icon: Home },
  { label: 'Billetera', to: '/dashboard/wallet', icon: Wallet },
  { label: 'Transacciones', to: '/dashboard/transactions', icon: History },
  { label: 'Billetera Grupal', to: '/dashboard/groups', icon: Users },
  { label: 'Cotizaciones', to: '/dashboard/exchange', icon: LineChart },
  { label: 'Contactos', to: '/dashboard/contacts', icon: BookUser },
  { label: 'Notificaciones', to: '/dashboard/notifications', icon: Bell },
  { label: 'Tarjetas', to: '/dashboard/cards', icon: CreditCard },
  { label: 'Asistente IA', to: '/dashboard/assistant', icon: Sparkles },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Resumen',
  '/dashboard/wallet': 'Billetera',
  '/dashboard/transactions': 'Transacciones',
  '/dashboard/groups': 'Billetera Grupal',
  '/dashboard/exchange': 'Cotizaciones',
  '/dashboard/contacts': 'Contactos',
  '/dashboard/notifications': 'Notificaciones',
  '/dashboard/terms': 'Términos y condiciones',
  '/dashboard/privacy': 'Política de privacidad',
  '/dashboard/cards': 'Tarjetas',
  '/dashboard/profile': 'Perfil',
  '/dashboard/assistant': 'Asistente IA',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const notifRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifPos, setNotifPos] = useState<{ top: number; right: number } | null>(null)
  const { unreadCount } = useNotifications()
  const { enabled: notificationsEnabled } = useNotificationPrefs()
  const searchData = useGlobalSearch()

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

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      if (notifRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setNotifOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    setNotifOpen(false)
    setSearchOpen(false)
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!notifOpen) return
    const onResize = () => {
      if (!notifRef.current) return
      const r = notifRef.current.getBoundingClientRect()
      setNotifPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [notifOpen])

  const toggleNotif = () => {
    if (!notifOpen && notifRef.current) {
      const r = notifRef.current.getBoundingClientRect()
      setNotifPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setNotifOpen((o) => !o)
  }

  const closeSearch = () => {
    setSearchOpen(false)
  }

  const currentTitle =
    Object.entries(pageTitles)
      .sort(([a], [b]) => b.length - a.length)
      .find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Globalance'

  return (
    <div className="app-shell">
      <div className={`app-shell__backdrop${sidebarOpen ? ' app-shell__backdrop--visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`app-sidebar${sidebarOpen ? ' app-sidebar--open' : ''}`}>
        <Link to="/" className="app-sidebar__brand">
          <span className="app-sidebar__logo" aria-hidden="true">
            <Wallet className="app-sidebar__logo-icon" />
          </span>
          <span className="app-sidebar__name">Globalance</span>
        </Link>

        <nav className="app-sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
              }
            >
              <item.icon className="app-sidebar__icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>
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
          <div className="app-topbar__titles">
            <h1 className="app-topbar__title">{currentTitle}</h1>
            {location.pathname.startsWith('/dashboard/groups') && (
              <span className="app-topbar__subtitle">Próximamente · En desarrollo</span>
            )}
          </div>
          <button
            type="button"
            className="app-topbar__search"
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
          >
            <Search className="app-topbar__search-icon" />
            <span className="app-topbar__search-placeholder">Buscar...</span>
          </button>
          <SearchModal
            open={searchOpen}
            data={searchData}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={closeSearch}
          />
          <div className="app-topbar__notif" ref={notifRef}>
            <button
              type="button"
              className="app-topbar__bell"
              onClick={toggleNotif}
              aria-label="Notificaciones"
              aria-expanded={notifOpen}
            >
              <Bell className="app-topbar__bell-icon" />
              {notificationsEnabled && unreadCount > 0 && <span className="app-topbar__badge">{unreadCount}</span>}
            </button>
            {notifOpen &&
              createPortal(
                <div
                  className="notifications-panel"
                  role="menu"
                  ref={panelRef}
                  style={notifPos ? { top: notifPos.top, right: notifPos.right } : undefined}
                >
                  <NotificationsList fromBell />
                </div>,
                document.body,
              )}
          </div>
          <ThemeToggle />
          <ProfileMenu name={displayName} />
        </header>

        <main className="app-shell__content">
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  )
}
