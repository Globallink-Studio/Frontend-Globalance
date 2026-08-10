import { Outlet } from 'react-router-dom'
import { Tabs } from '../../../components/layout/Tabs'

const tabs = [
  { label: 'Resumen', to: '/dashboard/transactions', end: true },
  { label: 'Transferencias', to: '/dashboard/transactions/transfers' },
  { label: 'Depósitos', to: '/dashboard/transactions/deposits' },
  { label: 'Solicitudes', to: '/dashboard/transactions/requests' },
]

export default function TransactionsLayout() {
  return (
    <div>
      <Tabs items={tabs} />
      <Outlet />
    </div>
  )
}
