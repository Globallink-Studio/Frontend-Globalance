import { delay } from '../delay'
import type { User } from '../data/users'
import type { PersonProfile } from '../data/personProfiles'
import { getMockUsers, getMockPersonProfiles, updateMockUser, updateMockPersonProfile } from '../storage'

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

export async function updateUser(id: string, patch: Partial<User>): Promise<User | undefined> {
  await delay()
  const current = getMockUsers().find((u) => u.id === id)
  if (!current) return undefined
  updateMockUser(id, patch)
  return { ...current, ...patch }
}

export async function updatePersonProfile(
  userId: string,
  patch: Partial<PersonProfile>,
): Promise<PersonProfile | undefined> {
  await delay()
  const current = getMockPersonProfiles().find((p) => p.user_id === userId)
  if (!current) return undefined
  updateMockPersonProfile(userId, patch)
  return { ...current, ...patch }
}
