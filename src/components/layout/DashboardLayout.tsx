import { Outlet, NavLink } from 'react-router-dom'

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
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 200, borderRight: '1px solid #ccc', padding: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <NavLink to="/" style={{ fontSize: 14 }}>← Home</NavLink>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '6px 8px',
                fontSize: 14,
                background: isActive ? '#eee' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 48, borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <span style={{ fontSize: 14 }}>Globalance</span>
        </header>

        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}
