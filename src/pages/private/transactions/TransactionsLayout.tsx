import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { label: 'Resumen', to: '/dashboard/transactions' },
  { label: 'Transferencias', to: '/dashboard/transactions/transfers' },
  { label: 'Depósitos', to: '/dashboard/transactions/deposits' },
  { label: 'Conversiones', to: '/dashboard/transactions/conversions' },
  { label: 'Solicitudes', to: '/dashboard/transactions/requests' },
  { label: 'Historial', to: '/dashboard/transactions/history' },
]

export default function TransactionsLayout() {
  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-6 border-b border-gray-300 pb-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/dashboard/transactions'}
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
