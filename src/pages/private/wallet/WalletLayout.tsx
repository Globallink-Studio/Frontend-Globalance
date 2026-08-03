import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { label: 'Resumen', to: '/dashboard/wallet' },
  { label: 'Cuentas', to: '/dashboard/wallet/accounts' },
  { label: 'Contactos frecuentes', to: '/dashboard/wallet/contacts' },
  { label: 'Historial', to: '/dashboard/wallet/history' },
]

export default function WalletLayout() {
  return (
    <div>
      <nav className="mb-6 flex gap-6 border-b border-gray-300 pb-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/dashboard/wallet'}
            className={({ isActive }) => `text-sm ${isActive ? 'font-bold text-blue-600' : 'text-gray-600'}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
