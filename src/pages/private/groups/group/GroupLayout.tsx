import { Outlet } from 'react-router-dom'
import { Tabs } from '../../../../components/layout/Tabs'

const tabs = [
  { label: 'Resumen', to: '.', end: true },
  { label: 'Participantes', to: 'participants' },
  { label: 'Balance', to: 'balance' },
  { label: 'Historial', to: 'history' },
  { label: 'Configuración', to: 'settings' },
]

export default function GroupLayout() {
  return (
    <div>
      <Tabs items={tabs} />
      <Outlet />
    </div>
  )
}
