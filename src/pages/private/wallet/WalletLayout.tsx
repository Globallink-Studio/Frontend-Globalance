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
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/dashboard/wallet'}
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
