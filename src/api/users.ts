import { getUsers, getUserById, getUserByEmail, updatePersonProfile, updateUser } from '../mocks/handlers/users'
import { getMockPersonProfiles } from '../mocks/storage'
import { companyProfiles } from '../mocks/data/companyProfiles'
import type { User } from '../mocks/data/users'
import type { PersonProfile } from '../mocks/data/personProfiles'
import type { CompanyProfile } from '../mocks/data/companyProfiles'
import {
  getAuthMode,
  getCachedUser,
  getCurrentUserId,
  getFirebaseDisplayName,
  refreshCachedUser,
  syncWithGoogleAccount,
} from './auth'
import { fetchApi } from './fetchApi'

interface ApiAuthMe {
  uid: string
  email?: string | null
  name?: string | null
  picture?: string | null
}

export async function getCurrentUser(): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    const cached = getCachedUser()
    if (cached) return cached
    const id = getCurrentUserId()
    if (!id) return undefined
    return getUserById(id)
  }
  const cached = getCachedUser()
  if (cached) return cached
  const resp = await fetchApi<{ data: ApiAuthMe | null }>('/auth/me')
  if (!resp?.data?.uid) return undefined
  return {
    id: resp.data.uid,
    firebase_uid: resp.data.uid,
    email: resp.data.email ?? '',
    user_type: 'person',
    display_currency: 'ARS',
    status: 'active',
    created_at: new Date().toISOString(),
    last_access_at: null,
  }
}

interface ApiUserProfile {
  id: string
  user_type: 'person' | 'company' | null
  display_currency?: string | null
  first_name?: string | null
  last_name?: string | null
  legal_name?: string | null
}

function splitFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
}

interface ApiWalletResponse {
  wallet?: { alias?: string | null }
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
  const firebaseName = getFirebaseDisplayName() ?? ''
  const personName = `${firstName} ${lastName}`.trim() || firebaseName

  let isPerson: boolean
  if (p.user_type === 'company') isPerson = false
  else if (p.user_type === 'person') isPerson = true
  else if (legalName && !firstName && !lastName) isPerson = false
  else isPerson = true

  if (isPerson) {
    const fb = firebaseName ? splitFullName(firebaseName) : { first: '', last: '' }
    return {
      user_id: p.id,
      first_name: firstName || fb.first,
      last_name: lastName || fb.last,
      document: '',
      phone: null,
    }
  }
  return {
    user_id: p.id,
    legal_name: legalName || personName,
    document: '',
    phone: null,
  }
}

export type PersonProfilePatch = Partial<PersonProfile> & { alias?: string; displayCurrency?: string }

export async function updateCurrentPersonProfile(patch: PersonProfilePatch): Promise<PersonProfile | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user || user.user_type !== 'person') return undefined
    return updatePersonProfile(user.id, patch)
  }

  const [profileResp, walletResp] = await Promise.all([
    fetchApi<{ data: ApiUserProfile }>('/users/profile'),
    fetchApi<ApiWalletResponse>('/wallet'),
  ])
  const current = profileResp.data
  const fallbackUser = await getCurrentUser()
  const userId = current?.id ?? fallbackUser?.id
  if (!userId) return undefined

  const firebaseName = getFirebaseDisplayName() ?? ''
  const fb = firebaseName ? splitFullName(firebaseName) : { first: '', last: '' }
  const firstName = patch.first_name ?? current?.first_name ?? fb.first
  const lastName = patch.last_name ?? current?.last_name ?? fb.last
  const alias = patch.alias ?? walletResp.wallet?.alias ?? ''
  const displayCurrency =
    patch.displayCurrency ?? getCachedUser()?.display_currency ?? current?.display_currency ?? 'ARS'

  const body: Record<string, string> = {
    userType: 'person',
    firstName,
    lastName,
    alias,
    displayCurrency,
  }
  const document = patch.document?.trim() ?? ''
  const phone = patch.phone?.trim() ?? ''
  if (document) body.document = document
  if (phone) body.phone = phone

  await fetchApi<{ data: { message: string } }>('/users/profile', {
    method: 'PATCH',
    body,
  })

  return {
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    document,
    phone: phone || null,
  }
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

export interface CompleteGoogleProfileInput {
  first_name: string
  last_name: string
  document: string
  phone: string
  alias: string
}

export async function completeGoogleProfile(patch: CompleteGoogleProfileInput): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    throw new Error('El alta con Google no está disponible en modo mock')
  }
  const user = await syncWithGoogleAccount()
  await updateCurrentPersonProfile(patch)
  return user
}

export { getUsers, getUserById, getUserByEmail }
