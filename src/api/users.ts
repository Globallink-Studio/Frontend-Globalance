import { getUsers, getUserById, getUserByEmail, updatePersonProfile, updateUser } from '../mocks/handlers/users'
import { getMockPersonProfiles } from '../mocks/storage'
import { companyProfiles } from '../mocks/data/companyProfiles'
import type { User } from '../mocks/data/users'
import type { PersonProfile } from '../mocks/data/personProfiles'
import type { CompanyProfile } from '../mocks/data/companyProfiles'
import { getAuthMode, getCachedUser, getCurrentUserId, refreshCachedUser } from './auth'
import { fetchApi } from './fetchApi'

export async function getCurrentUser(): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    const cached = getCachedUser()
    if (cached) return cached
    const id = getCurrentUserId()
    if (!id) return undefined
    return getUserById(id)
  }
  return getCachedUser() ?? undefined
}

interface ApiUserProfile {
  id: string
  user_type: 'person' | 'company' | null
  first_name?: string | null
  last_name?: string | null
  legal_name?: string | null
}

export async function getCurrentUserProfile(): Promise<PersonProfile | CompanyProfile | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user) return undefined
    if (user.user_type === 'person') {
      return getMockPersonProfiles().find((p) => p.user_id === user.id)
    }
    return companyProfiles.find((c) => c.user_id === user.id)
  }
  const resp = await fetchApi<{ data: ApiUserProfile }>('/users/profile')
  const p = resp.data
  if (!p) return undefined

  const firstName = p.first_name ?? ''
  const lastName = p.last_name ?? ''
  const legalName = p.legal_name ?? ''
  const nameHint = Boolean(firstName || lastName)

  let isPerson: boolean
  if (p.user_type === 'company') isPerson = false
  else if (p.user_type === 'person') isPerson = true
  else if (nameHint) isPerson = true
  else isPerson = getCachedUser()?.user_type === 'person'

  if (isPerson) {
    return {
      user_id: p.id,
      first_name: firstName,
      last_name: lastName,
      document: '',
      phone: null,
    }
  }
  return {
    user_id: p.id,
    legal_name: legalName || `${firstName} ${lastName}`.trim(),
    document: '',
    phone: null,
  }
}

export async function updateCurrentPersonProfile(
  patch: Partial<PersonProfile>,
): Promise<PersonProfile | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user || user.user_type !== 'person') return undefined
    return updatePersonProfile(user.id, patch)
  }
  throw new Error('La edición del perfil todavía no está disponible en el backend')
}

export async function updateCurrentUser(patch: Partial<User>): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user) return undefined
    const updated = await updateUser(user.id, patch)
    if (updated) refreshCachedUser(updated)
    return updated
  }
  throw new Error('Actualizar los datos del usuario todavía no está disponible en el backend')
}

export { getUsers, getUserById, getUserByEmail }
