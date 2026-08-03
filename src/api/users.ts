import { getUsers, getUserById, getUserByEmail } from '../mocks/handlers/users'
import { personProfiles } from '../mocks/data/personProfiles'
import { companyProfiles } from '../mocks/data/companyProfiles'
import type { User } from '../mocks/data/users'
import type { PersonProfile } from '../mocks/data/personProfiles'
import type { CompanyProfile } from '../mocks/data/companyProfiles'
import { getCurrentUserId } from './auth'

export async function getCurrentUser(): Promise<User | undefined> {
  return getUserById(getCurrentUserId())
}

export async function getCurrentUserProfile(): Promise<PersonProfile | CompanyProfile | undefined> {
  const user = await getCurrentUser()
  if (!user) return undefined
  if (user.user_type === 'person') {
    return personProfiles.find((p) => p.user_id === user.id)
  }
  return companyProfiles.find((c) => c.user_id === user.id)
}

export { getUsers, getUserById, getUserByEmail }
