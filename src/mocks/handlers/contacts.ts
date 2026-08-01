import { delay } from '../delay'
import { contacts } from '../data/contacts'
import type { Contact } from '../data/contacts'

export async function getContacts(): Promise<Contact[]> {
  await delay()
  return contacts
}

export async function getContactsByUserId(userId: string): Promise<Contact[]> {
  await delay()
  return contacts.filter((c) => c.user_id === userId)
}
