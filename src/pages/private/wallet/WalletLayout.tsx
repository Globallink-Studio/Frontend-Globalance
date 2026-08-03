import { Outlet } from 'react-router-dom'
import { Tabs } from '../../../components/layout/Tabs'

const tabs = [
  { label: 'Resumen', to: '/dashboard/wallet', end: true },
  { label: 'Cuentas', to: '/dashboard/wallet/accounts' },
  { label: 'Contactos frecuentes', to: '/dashboard/wallet/contacts' },
  { label: 'Historial', to: '/dashboard/wallet/history' },
]

export default function WalletLayout() {
  return (
    <div>
      <Tabs items={tabs} />
      <Outlet />
    </div>
  )
}
