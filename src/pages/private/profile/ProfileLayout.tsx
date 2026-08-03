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
      <nav className="mb-6 flex flex-wrap gap-6 border-b border-gray-300 pb-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/dashboard/profile'}
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
