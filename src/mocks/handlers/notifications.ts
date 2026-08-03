import { delay } from '../delay'
import { notifications } from '../data/notifications'
import type { AppNotification } from '../data/notifications'

export async function getNotifications(): Promise<AppNotification[]> {
  await delay()
  return notifications
}

export async function getNotificationsByUserId(userId: string): Promise<AppNotification[]> {
  await delay()
  return notifications.filter((n) => n.user_id === userId)
}
