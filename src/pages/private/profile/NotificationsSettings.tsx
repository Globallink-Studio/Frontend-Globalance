import { useEffect, useState } from 'react'
import { getCurrentNotifications } from '../../../api/notifications'
import type { AppNotification } from '../../../mocks/data/notifications'

export default function NotificationsSettings() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    getCurrentNotifications().then(setNotifications)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notificaciones</h1>

      {notifications.length === 0 && <p className="text-sm text-gray-500">Sin notificaciones.</p>}

      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{n.title}</p>
              {!n.read && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">Nueva</span>}
            </div>
            <p className="mt-1 text-sm text-gray-600">{n.message}</p>
            <p className="mt-2 text-xs text-gray-400">
              {new Date(n.created_at).toLocaleString('es-AR')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
