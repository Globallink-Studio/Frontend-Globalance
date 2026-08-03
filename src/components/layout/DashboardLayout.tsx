import { useEffect, useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { getCurrentUserProfile } from '../../api/users'
import type { CompanyProfile } from '../../mocks/data/companyProfiles'

const menuItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Wallet', to: '/dashboard/wallet' },
  { label: 'Transacciones', to: '/dashboard/transactions' },
  { label: 'Wallet Grupal', to: '/dashboard/groups' },
  { label: 'Cotizaciones', to: '/dashboard/exchange' },
  { label: 'Perfil', to: '/dashboard/profile' },
  { label: 'Buscar', to: '/dashboard/search' },
  { label: 'Asistente IA', to: '/dashboard/assistant' },
]

export default function DashboardLayout() {
  const [displayName, setDisplayName] = useState('')

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

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r border-gray-300 p-4">
        <div className="mb-6">
          <NavLink to="/" className="text-sm">
            ← Home
          </NavLink>
        </div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `block px-2 py-1.5 text-sm ${isActive ? 'bg-gray-200 font-semibold' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-gray-300 px-4">
          <span className="text-sm">Globalance</span>
          {displayName && <span className="text-sm">Hola, {displayName}</span>}
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
