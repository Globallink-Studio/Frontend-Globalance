import { getContactsByUserId } from '../mocks/handlers/contacts'
import { getCurrentUserId } from './auth'
import type { Contact } from '../mocks/data/contacts'

export async function getCurrentContacts(): Promise<Contact[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getContactsByUserId(id)
}
