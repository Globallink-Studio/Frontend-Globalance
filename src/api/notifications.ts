import {
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from '../mocks/handlers/notifications'
import { getCurrentUserId, getAuthMode } from './auth'
import type { AppNotification, NotificationType } from '../mocks/data/notifications'

export async function getCurrentNotifications(): Promise<AppNotification[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getNotificationsByUserId(id)
}

export async function markNotificationRead(id: string): Promise<void> {
  return markAsRead(id)
}

export async function markAllNotificationsRead(): Promise<void> {
  const id = getCurrentUserId()
  if (!id) return
  return markAllAsRead(id)
}

export async function deleteCurrentNotification(id: string): Promise<void> {
  return deleteNotification(id)
}

// Notificaciones generadas por eventos. En modo mock las crea el front; en
// deploy las genera el back (ver "Pedir al back → 2. Notificaciones").
export async function notifyUser(
  userId: string | null | undefined,
  title: string,
  message: string,
  type?: NotificationType,
  link?: string,
): Promise<void> {
  if (getAuthMode() !== 'mock') return
  if (!userId) return
  await createNotification(userId, { title, message, type, link })
}

export async function notifyCurrentUser(
  title: string,
  message: string,
  type?: NotificationType,
  link?: string,
): Promise<void> {
  await notifyUser(getCurrentUserId(), title, message, type, link)
}
