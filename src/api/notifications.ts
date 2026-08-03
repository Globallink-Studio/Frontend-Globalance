import { getNotificationsByUserId } from '../mocks/handlers/notifications'
import { getCurrentUserId } from './auth'
import type { AppNotification } from '../mocks/data/notifications'

export async function getCurrentNotifications(): Promise<AppNotification[]> {
  return getNotificationsByUserId(getCurrentUserId())
}
