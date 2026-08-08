import { getContactsByUserId, createContact as createMockContact, updateContact as updateMockContact, removeContact } from '../mocks/handlers/contacts'
import { getCurrentUserId } from './auth'
import type { Contact } from '../mocks/data/contacts'

export async function getCurrentContacts(): Promise<Contact[]> {
  const id = getCurrentUserId()
  if (!id) return []
  return getContactsByUserId(id)
}

export async function createContact(input: {
  recipientUserId: string
  alias: string
  phone?: string | null
  email?: string | null
  category?: string | null
  description?: string | null
  favorite?: boolean
  account?: string | null
}): Promise<Contact> {
  const id = getCurrentUserId()
  if (!id) throw new Error('No hay usuario autenticado')
  if (!input.recipientUserId) throw new Error('Indicá el contacto a agregar')
  if (!input.alias.trim()) throw new Error('Indicá un alias para el contacto')
  return createMockContact({ userId: id, ...input })
}

export async function updateContact(
  id: string,
  patch: Partial<
    Pick<Contact, 'alias' | 'phone' | 'email' | 'category' | 'description' | 'favorite' | 'account'>
  >,
): Promise<Contact | undefined> {
  if (!id) throw new Error('Falta el contacto a editar')
  return updateMockContact(id, patch)
}

export async function deleteContact(id: string): Promise<void> {
  if (!id) throw new Error('Falta el contacto a eliminar')
  await removeContact(id)
}
