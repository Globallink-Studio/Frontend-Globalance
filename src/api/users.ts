import { getUsers, getUserById, getUserByEmail, updatePersonProfile, updateUser } from '../mocks/handlers/users'
import { getMockPersonProfiles } from '../mocks/storage'
import { companyProfiles } from '../mocks/data/companyProfiles'
import type { User } from '../mocks/data/users'
import type { PersonProfile } from '../mocks/data/personProfiles'
import type { CompanyProfile } from '../mocks/data/companyProfiles'
import { getCachedUser, getCurrentUserId, refreshCachedUser } from './auth'

export async function getCurrentUser(): Promise<User | undefined> {
  const cached = getCachedUser()
  if (cached) return cached
  const id = getCurrentUserId()
  if (!id) return undefined
  return getUserById(id)
}

export async function getCurrentUserProfile(): Promise<PersonProfile | CompanyProfile | undefined> {
  const user = await getCurrentUser()
  if (!user) return undefined
  if (user.user_type === 'person') {
    return getMockPersonProfiles().find((p) => p.user_id === user.id)
  }
  return companyProfiles.find((c) => c.user_id === user.id)
}

export async function updateCurrentPersonProfile(
  patch: Partial<PersonProfile>,
): Promise<PersonProfile | undefined> {
  const user = await getCurrentUser()
  if (!user || user.user_type !== 'person') return undefined
  return updatePersonProfile(user.id, patch)
}

export async function updateCurrentUser(patch: Partial<User>): Promise<User | undefined> {
  const user = await getCurrentUser()
  if (!user) return undefined
  const updated = await updateUser(user.id, patch)
  if (updated) refreshCachedUser(updated)
  return updated
}

export { getUsers, getUserById, getUserByEmail }
