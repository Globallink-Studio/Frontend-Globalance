import { getUsers, getUserById, getUserByEmail, updatePersonProfile, updateCompanyProfile, updateUser } from '../mocks/handlers/users'
import { getMockPersonProfiles, getMockCompanyProfiles, addMockPersonProfile, addMockCompanyProfile } from '../mocks/storage'
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
import { ApiError } from './errors'

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
  document?: string | null
  phone?: string | null
  timezone?: string | null
}

function splitFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
}

function splitPersonName(
  first: string,
  last: string,
  fallback: { first: string; last: string },
): { first_name: string; last_name: string } {
  const merged = first.trim()
  if (!last && merged.includes(' ')) {
    const parts = merged.split(/\s+/).filter(Boolean)
    return { first_name: parts[0] ?? fallback.first, last_name: parts.slice(1).join(' ') }
  }
  return { first_name: first || fallback.first, last_name: last || fallback.last }
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
    return getMockCompanyProfiles().find((c) => c.user_id === user.id) ?? companyProfiles.find((c) => c.user_id === user.id)
  }
  try {
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
      const name = splitPersonName(firstName, lastName, fb)
      return {
        user_id: p.id,
        first_name: name.first_name,
        last_name: name.last_name,
        document: p.document ?? '',
        phone: p.phone ?? null,
        timezone: p.timezone ?? undefined,
      }
    }
    return {
      user_id: p.id,
      legal_name: legalName || personName,
      document: p.document ?? '',
      phone: p.phone ?? null,
      timezone: p.timezone ?? undefined,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
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
  const alias = patch.alias?.trim() || walletResp.wallet?.alias || ''
  const displayCurrency =
    patch.displayCurrency ?? getCachedUser()?.display_currency ?? current?.display_currency ?? 'ARS'
  const timezone = patch.timezone ?? current?.timezone ?? undefined

  const body: Record<string, string> = {
    firstName,
    lastName,
    displayCurrency,
  }
  if (alias) body.alias = alias
  const phone = patch.phone?.trim() ?? current?.phone ?? ''
  if (phone) body.phone = phone
  if (timezone) body.timezone = timezone

  await fetchApi<{ data: { message: string } }>('/users/profile', {
    method: 'PATCH',
    body,
  })

  return {
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    document: current?.document ?? '',
    phone: phone || null,
    timezone,
  }
}

export type CompanyProfilePatch = Partial<CompanyProfile> & { alias?: string; displayCurrency?: string }

export async function updateCurrentCompanyProfile(patch: CompanyProfilePatch): Promise<CompanyProfile | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user || user.user_type !== 'company') return undefined
    return updateCompanyProfile(user.id, patch)
  }

  const [profileResp, walletResp] = await Promise.all([
    fetchApi<{ data: ApiUserProfile }>('/users/profile'),
    fetchApi<ApiWalletResponse>('/wallet'),
  ])
  const current = profileResp.data
  const fallbackUser = await getCurrentUser()
  const userId = current?.id ?? fallbackUser?.id
  if (!userId) return undefined

  const legalName = patch.legal_name ?? current?.legal_name ?? ''
  const alias = patch.alias ?? walletResp.wallet?.alias ?? ''
  const displayCurrency =
    patch.displayCurrency ?? getCachedUser()?.display_currency ?? current?.display_currency ?? 'ARS'
  const timezone = patch.timezone ?? current?.timezone ?? undefined

  const body: Record<string, string> = {
    legalName,
    alias,
    displayCurrency,
  }
  const phone = patch.phone?.trim() ?? current?.phone ?? ''
  if (phone) body.phone = phone
  if (timezone) body.timezone = timezone

  await fetchApi<{ data: { message: string } }>('/users/profile', {
    method: 'PATCH',
    body,
  })

  return {
    user_id: userId,
    legal_name: legalName,
    document: current?.document ?? '',
    phone: phone || null,
    timezone,
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

export interface CreatePersonProfileInput {
  first_name: string
  last_name: string
  document: string
  phone: string
  alias: string
  display_currency: string
  timezone?: string
}

export async function createCurrentUserPersonProfile(input: CreatePersonProfileInput): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user) return undefined
    addMockPersonProfile({
      user_id: user.id,
      first_name: input.first_name,
      last_name: input.last_name,
      document: input.document,
      phone: input.phone,
    })
    return user
  }

  const user = await getCurrentUser()
  await fetchApi<{ data: { message: string } }>('/users/profile', {
    method: 'POST',
    body: {
      userType: 'person',
      firstName: input.first_name,
      lastName: input.last_name,
      document: input.document,
      phone: input.phone,
      alias: input.alias,
      displayCurrency: input.display_currency,
      ...(input.timezone ? { timezone: input.timezone } : {}),
    },
  })
  return user
}

export interface CreateCompanyProfileInput {
  legal_name: string
  document: string
  phone: string
  alias: string
  display_currency: string
  timezone?: string
}

export async function createCurrentUserCompanyProfile(input: CreateCompanyProfileInput): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    const user = await getCurrentUser()
    if (!user) return undefined
    addMockCompanyProfile({
      user_id: user.id,
      legal_name: input.legal_name,
      document: input.document,
      phone: input.phone,
    })
    return user
  }

  const user = await getCurrentUser()
  await fetchApi<{ data: { message: string } }>('/users/profile', {
    method: 'POST',
    body: {
      userType: 'company',
      legalName: input.legal_name,
      document: input.document,
      phone: input.phone,
      alias: input.alias,
      displayCurrency: input.display_currency,
      ...(input.timezone ? { timezone: input.timezone } : {}),
    },
  })
  return user
}

export async function completeGoogleProfile(patch: CompleteGoogleProfileInput): Promise<User | undefined> {
  if (getAuthMode() === 'mock') {
    throw new Error('El alta con Google no está disponible en modo mock')
  }
  const user = await syncWithGoogleAccount()
  await createCurrentUserPersonProfile({
    first_name: patch.first_name,
    last_name: patch.last_name,
    document: patch.document,
    phone: patch.phone,
    alias: patch.alias,
    display_currency: user?.display_currency ?? getCachedUser()?.display_currency ?? 'ARS',
  })
  return user
}

export async function deleteAccount(): Promise<void> {
  if (getAuthMode() === 'mock') {
    throw new Error('Eliminar cuenta no está disponible en modo mock')
  }
  await fetchApi<{ data: { message: string } }>('/users/profile', {
    method: 'DELETE',
  })
}

export { getUsers, getUserById, getUserByEmail }
