import { useCallback, useEffect, useState } from 'react'
import {
  getCurrentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteCurrentNotification,
} from '../api/notifications'
import type { AppNotification } from '../mocks/data/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const items = await getCurrentNotifications()
      setNotifications(
        [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await markNotificationRead(id)
  }, [])

  const remove = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await deleteCurrentNotification(id)
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await markAllNotificationsRead()
  }, [])

  return { notifications, unreadCount, loading, refresh, markRead, remove, markAllRead }
}
