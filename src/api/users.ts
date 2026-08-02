import { getUsers, getUserById, getUserByEmail } from '../mocks/handlers/users'
import { getMockPersonProfiles } from '../mocks/storage'
import { companyProfiles } from '../mocks/data/companyProfiles'
import type { User } from '../mocks/data/users'
import type { PersonProfile } from '../mocks/data/personProfiles'
import type { CompanyProfile } from '../mocks/data/companyProfiles'
import { getCurrentUserId } from './auth'

export async function getCurrentUser(): Promise<User | undefined> {
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

export { getUsers, getUserById, getUserByEmail }
