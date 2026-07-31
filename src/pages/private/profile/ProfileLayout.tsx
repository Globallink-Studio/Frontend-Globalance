import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { label: 'Datos personales', to: '/dashboard/profile' },
  { label: 'Tarjetas', to: '/dashboard/profile/cards' },
  { label: 'Contactos frecuentes', to: '/dashboard/profile/contacts' },
  { label: 'Notificaciones', to: '/dashboard/profile/notifications' },
  { label: 'Ajustes', to: '/dashboard/profile/settings' },
]

export default function ProfileLayout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/dashboard/profile'}
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
