import { delay } from '../delay'
import type { User } from '../data/users'
import { getMockUsers, addMockUser, addMockPersonProfile } from '../storage'

export async function login(email: string): Promise<User> {
  await delay()
  const user = getMockUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    throw new Error('Usuario no encontrado')
  }
  if (user.status === 'inactive') {
    throw new Error('Usuario inactivo')
  }
  return user
}

export async function register(input: {
  fullName: string
  email: string
}): Promise<User> {
  await delay()
  const exists = getMockUsers().some((u) => u.email.toLowerCase() === input.email.toLowerCase())
  if (exists) {
    throw new Error('El usuario ya existe')
  }
  const id = crypto.randomUUID()
  const user: User = {
    id,
    firebase_uid: `mock_${id}`,
    email: input.email,
    user_type: 'person',
    display_currency: 'ARS',
    status: 'active',
    created_at: new Date().toISOString(),
    last_access_at: new Date().toISOString(),
  }
  addMockUser(user)
  const [first_name, ...rest] = input.fullName.trim().split(/\s+/)
  addMockPersonProfile({
    user_id: id,
    first_name: first_name || 'Usuario',
    last_name: rest.join(' ') || '',
    document: 'DNI pendiente',
    phone: null,
  })
  return user
}

export async function logout(): Promise<void> {
  await delay(200)
}
