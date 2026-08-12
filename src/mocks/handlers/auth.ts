import { delay } from '../delay'
import type { User } from '../data/users'
import {
  getMockUsers,
  addMockUser,
  addMockPersonProfile,
  getMockPersonProfiles,
  addMockCompanyProfile,
  getMockCompanyProfiles,
} from '../storage'
import { provisionDemoData } from '../provision'

type UserType = 'person' | 'company'

function createUser(email: string, fullName?: string, userType: UserType = 'person'): User {
  const id = crypto.randomUUID()
  const user: User = {
    id,
    firebase_uid: `mock_${id}`,
    email,
    user_type: userType,
    display_currency: 'ARS',
    status: 'active',
    created_at: new Date().toISOString(),
    last_access_at: new Date().toISOString(),
  }
  addMockUser(user)
  const name = fullName?.trim() || email.split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (userType === 'company') {
    addMockCompanyProfile({
      user_id: id,
      legal_name: name || 'Mi empresa',
      document: 'CUIT pendiente',
      phone: null,
    })
  } else {
    const [first_name, ...rest] = name.split(/\s+/)
    addMockPersonProfile({
      user_id: id,
      first_name: first_name || 'Usuario',
      last_name: rest.join(' ') || '',
      document: 'DNI pendiente',
      phone: null,
    })
  }
  return user
}

function userDisplayName(user: User): string {
  const person = getMockPersonProfiles().find((p) => p.user_id === user.id)
  if (person) return `${person.first_name} ${person.last_name}`.trim()
  const company = getMockCompanyProfiles().find((c) => c.user_id === user.id)
  if (company) return company.legal_name?.trim() || ''
  return user.email.split('@')[0].replace(/[._-]+/g, ' ').trim()
}

export async function login(email: string): Promise<User> {
  await delay()
  const normalized = email.trim().toLowerCase()
  let user = getMockUsers().find((u) => u.email.toLowerCase() === normalized)
  if (!user) {
    user = createUser(normalized)
  }
  provisionDemoData(user.id, userDisplayName(user))
  return user
}

export async function register(input: {
  fullName: string
  email: string
  userType?: UserType
}): Promise<User> {
  await delay()
  const normalized = input.email.trim().toLowerCase()
  const exists = getMockUsers().some((u) => u.email.toLowerCase() === normalized)
  if (exists) {
    throw new Error('El usuario ya existe')
  }
  const userType = input.userType === 'company' ? 'company' : 'person'
  const user = createUser(normalized, input.fullName, userType)
  provisionDemoData(user.id, input.fullName.trim())
  return user
}

export async function logout(): Promise<void> {
  await delay(200)
}
