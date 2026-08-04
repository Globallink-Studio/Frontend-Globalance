import type { User } from './data/users'
import { users as staticUsers } from './data/users'
import type { PersonProfile } from './data/personProfiles'
import { personProfiles as staticPersonProfiles } from './data/personProfiles'

const USERS_KEY = 'globalance.mock.users'
const PERSON_PROFILES_KEY = 'globalance.mock.personProfiles'

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getMockUsers(): User[] {
  return [...staticUsers, ...read<User>(USERS_KEY)]
}

export function addMockUser(user: User): void {
  write(USERS_KEY, [...read<User>(USERS_KEY), user])
}

export function getMockPersonProfiles(): PersonProfile[] {
  return [...staticPersonProfiles, ...read<PersonProfile>(PERSON_PROFILES_KEY)]
}

export function addMockPersonProfile(profile: PersonProfile): void {
  write(PERSON_PROFILES_KEY, [...read<PersonProfile>(PERSON_PROFILES_KEY), profile])
}
