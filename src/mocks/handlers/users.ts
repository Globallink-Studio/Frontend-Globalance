import { delay } from '../delay'
import type { User } from '../data/users'
import { getMockUsers } from '../storage'

export async function getUsers(): Promise<User[]> {
  await delay()
  return getMockUsers()
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay()
  return getMockUsers().find((u) => u.id === id)
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  await delay()
  return getMockUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}
