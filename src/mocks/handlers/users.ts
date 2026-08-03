import { delay } from '../delay'
import { users } from '../data/users'
import type { User } from '../data/users'

export async function getUsers(): Promise<User[]> {
  await delay()
  return users
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay()
  return users.find((u) => u.id === id)
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  await delay()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}
