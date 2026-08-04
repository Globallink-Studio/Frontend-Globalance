import { Outlet } from 'react-router-dom'
import { Tabs } from '../../../components/layout/Tabs'

const tabs = [
  { label: 'Datos personales', to: '/dashboard/profile', end: true },
  { label: 'Tarjetas', to: '/dashboard/profile/cards' },
  { label: 'Contactos frecuentes', to: '/dashboard/profile/contacts' },
  { label: 'Notificaciones', to: '/dashboard/profile/notifications' },
  { label: 'Ajustes', to: '/dashboard/profile/settings' },
]

export default function ProfileLayout() {
  return (
    <div>
      <Tabs items={tabs} />
      <Outlet />
    </div>
  )
}
