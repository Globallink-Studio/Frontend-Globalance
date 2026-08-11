import {
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from '../mocks/handlers/notifications'
import { getCurrentUserId } from './auth'
import type { AppNotification, NotificationType } from '../mocks/data/notifications'

// Las notificaciones se persisten en localStorage (sin BD). Este evento se
// dispara ante cualquier cambio para que los componentes que escuchan
// (useNotifications) refresquen su estado al instante.
export const NOTIFICATIONS_CHANGED_EVENT = 'globalance:notifications-changed'

function emitNotificationsChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT))
}

export async function getCurrentNotifications(): Promise<AppNotification[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getNotificationsByUserId(id)
}

export async function markNotificationRead(id: string): Promise<void> {
  await markAsRead(id)
  emitNotificationsChanged()
}

export async function markAllNotificationsRead(): Promise<void> {
  const id = getCurrentUserId()
  if (!id) return
  await markAllAsRead(id)
  emitNotificationsChanged()
}

export async function deleteCurrentNotification(id: string): Promise<void> {
  await deleteNotification(id)
  emitNotificationsChanged()
}

// Notificaciones generadas por eventos. Se guardan en localStorage sin importar
// el modo de auth, así la funcionalidad también funciona en deploy sin BD.
export async function notifyUser(
  userId: string | null | undefined,
  title: string,
  message: string,
  type?: NotificationType,
  link?: string,
): Promise<void> {
  if (!userId) return
  await createNotification(userId, { title, message, type, link })
  emitNotificationsChanged()
}

export async function notifyCurrentUser(
  title: string,
  message: string,
  type?: NotificationType,
  link?: string,
): Promise<void> {
  await notifyUser(getCurrentUserId(), title, message, type, link)
}
