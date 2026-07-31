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
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/dashboard/transactions'}
            style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400, fontSize: 14 })}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
