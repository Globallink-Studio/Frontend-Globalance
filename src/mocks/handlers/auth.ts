import { delay } from '../delay'
import { users } from '../data/users'
import type { User } from '../data/users'

export async function login(email: string): Promise<User> {
  await delay()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    throw new Error('Usuario no encontrado')
  }
  if (user.status === 'inactive') {
    throw new Error('Usuario inactivo')
  }
  return user
}

export async function logout(): Promise<void> {
  await delay(200)
}
