import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { label: 'Resumen', to: '' },
  { label: 'Participantes', to: 'participants' },
  { label: 'Balance', to: 'balance' },
  { label: 'Historial', to: 'history' },
  { label: 'Configuración', to: 'settings' },
]

export default function GroupLayout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.to === ''}
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
