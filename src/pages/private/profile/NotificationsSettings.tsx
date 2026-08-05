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

      {notifications.length === 0 && <p className="text-sm text-muted-foreground">Sin notificaciones.</p>}

      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{n.title}</p>
              {!n.read && <span className="rounded-full bg-ring/15 px-2 py-0.5 text-xs text-ring">Nueva</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleString('es-AR')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
