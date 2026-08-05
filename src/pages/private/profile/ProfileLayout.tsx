import { Outlet, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components/layout/Tabs'
import '../../../styles/pages/private/profile.css'

const tabs = [
  { label: 'Datos personales', to: '/dashboard/profile', end: true },
  { label: 'Tarjetas', to: '/dashboard/profile/cards' },
  { label: 'Contactos frecuentes', to: '/dashboard/profile/contacts' },
  { label: 'Notificaciones', to: '/dashboard/profile/notifications' },
  { label: 'Ajustes', to: '/dashboard/profile/settings' },
]

export default function ProfileLayout() {
  const location = useLocation()
  const isEdit = location.pathname.endsWith('/edit')

  return (
    <div>
      {!isEdit && <Tabs items={tabs} />}
      <Outlet />
    </div>
  )
}
