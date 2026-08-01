import { login as mockLogin, logout as mockLogout } from '../mocks/handlers/auth'
import type { User } from '../mocks/data/users'

const STORAGE_KEY = 'globalance.currentUserId'
const DEFAULT_USER_ID = '11111111-1111-4111-8111-111111111111'

export function getCurrentUserId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_USER_ID
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEY, userId)
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function login(email: string): Promise<User> {
  const user = await mockLogin(email)
  setCurrentUser(user.id)
  return user
}

export async function logout(): Promise<void> {
  await mockLogout()
  clearCurrentUser()
}
