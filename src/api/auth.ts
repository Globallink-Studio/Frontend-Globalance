import { login as mockLogin, logout as mockLogout, register as mockRegister } from '../mocks/handlers/auth'
import type { User } from '../mocks/data/users'

const STORAGE_KEY = 'globalance.currentUserId'

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
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

export async function register(input: { fullName: string; email: string }): Promise<User> {
  const user = await mockRegister(input)
  setCurrentUser(user.id)
  return user
}

export async function logout(): Promise<void> {
  await mockLogout()
  clearCurrentUser()
}
