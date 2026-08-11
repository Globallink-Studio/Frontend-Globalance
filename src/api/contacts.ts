import { getContactsByUserId, createContact as createMockContact, updateContact as updateMockContact, removeContact } from '../mocks/handlers/contacts'
import { getAuthMode, getCurrentUserId } from './auth'
import { fetchApi } from './fetchApi'
import type { Contact } from '../mocks/data/contacts'

interface ApiContact {
  id: string
  user_id: string
  name: string
  contact_type: 'alias' | 'account_number'
  contact_value: string
  contact_wallet_id: string | null
  created_at: string
}

function mapApiContact(apiContact: ApiContact): Contact {
  return {
    id: apiContact.id,
    user_id: apiContact.user_id,
    recipient_user_id: apiContact.contact_wallet_id ?? '',
    alias: apiContact.name,
    phone: null,
    email: null,
    category: null,
    description: null,
    favorite: false,
    account: apiContact.contact_type === 'account_number' ? apiContact.contact_value : null,
    currency_code: null,
    last_amount: null,
    last_activity: null,
    created_at: apiContact.created_at,
  }
}

export async function getCurrentContacts(): Promise<Contact[]> {
  if (getAuthMode() === 'firebase') {
    const resp = await fetchApi<{ contacts: ApiContact[] }>('/contacts')
    return (resp.contacts ?? []).map(mapApiContact)
  }
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
  if (!input.alias.trim()) throw new Error('Indicá un alias para el contacto')
  if (getAuthMode() === 'firebase') {
    const account = input.account?.trim()
    const resp = await fetchApi<{ contact: ApiContact }>('/contacts', {
      method: 'POST',
      body: {
        name: input.alias.trim().slice(0, 50),
        type: account ? 'account_number' : 'alias',
        value: account ?? input.alias.trim(),
      },
    })
    return mapApiContact(resp.contact)
  }
  const id = getCurrentUserId()
  if (!id) throw new Error('No hay usuario autenticado')
  if (!input.recipientUserId) throw new Error('Indicá el contacto a agregar')
  return createMockContact({ userId: id, ...input })
}

export async function updateContact(
  id: string,
  patch: Partial<
    Pick<Contact, 'alias' | 'phone' | 'email' | 'category' | 'description' | 'favorite' | 'account'>
  >,
): Promise<Contact | undefined> {
  if (!id) throw new Error('Falta el contacto a editar')
  if (getAuthMode() === 'firebase') {
    throw new Error('Editar contactos todavía no está disponible en el backend')
  }
  return updateMockContact(id, patch)
}

export async function deleteContact(id: string): Promise<void> {
  if (!id) throw new Error('Falta el contacto a eliminar')
  if (getAuthMode() === 'firebase') {
    await fetchApi<{ message: string }>(`/contacts/${id}`, { method: 'DELETE' })
    return
  }
  await removeContact(id)
}
