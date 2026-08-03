import { Outlet } from 'react-router-dom'
import { Tabs } from '../../../components/layout/Tabs'

const tabs = [
  { label: 'Mis grupos', to: '/dashboard/groups', end: true },
  { label: 'Crear grupo', to: '/dashboard/groups/create' },
]

export default function GroupsLayout() {
  return (
    <div>
      <Tabs items={tabs} />
      <Outlet />
    </div>
  )
}
