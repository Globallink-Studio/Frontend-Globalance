import { delay } from '../delay'
import {
  getMockNotifications,
  addMockNotification,
  updateMockNotification,
  deleteMockNotification,
} from '../storage'
import type { AppNotification, NotificationType } from '../data/notifications'

export interface NotificationInput {
  title: string
  message: string
  type?: NotificationType
  link?: string
}

// Política de retención (igual que la que se pide al back):
// - las no leídas se conservan siempre
// - de las leídas se guardan las últimas 25
// - las leídas más viejas que 90 días se eliminan
const MAX_READ_NOTIFICATIONS = 25
const NOTIFICATION_TTL_MS = 90 * 24 * 60 * 60 * 1000

function pruneUserNotifications(userId: string): void {
  const cutoff = Date.now() - NOTIFICATION_TTL_MS
  const items = getMockNotifications().filter((n) => n.user_id === userId)
  const freshRead = items
    .filter((n) => n.read && new Date(n.created_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const keepReadIds = new Set(freshRead.slice(0, MAX_READ_NOTIFICATIONS).map((n) => n.id))

  items
    .filter((n) => n.read && !keepReadIds.has(n.id))
    .forEach((n) => deleteMockNotification(n.id))
}

export async function getNotifications(): Promise<AppNotification[]> {
  await delay()
  return getMockNotifications()
}

export async function getNotificationsByUserId(userId: string): Promise<AppNotification[]> {
  await delay()
  pruneUserNotifications(userId)
  return getMockNotifications().filter((n) => n.user_id === userId)
}

export async function createNotification(userId: string, input: NotificationInput): Promise<AppNotification> {
  await delay()
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    user_id: userId,
    type: input.type ?? 'info',
    title: input.title.trim(),
    message: input.message.trim(),
    read: false,
    created_at: new Date().toISOString(),
    link: input.link,
  }
  addMockNotification(notification)
  pruneUserNotifications(userId)
  return notification
}

export async function markAsRead(id: string): Promise<void> {
  await delay()
  const current = getMockNotifications().find((n) => n.id === id)
  if (!current) return
  updateMockNotification(id, { read: true })
  pruneUserNotifications(current.user_id)
}

export async function markAllAsRead(userId: string): Promise<void> {
  await delay()
  getMockNotifications()
    .filter((n) => n.user_id === userId && !n.read)
    .forEach((n) => updateMockNotification(n.id, { read: true }))
  pruneUserNotifications(userId)
}

export async function deleteNotification(id: string): Promise<void> {
  await delay()
  deleteMockNotification(id)
}
