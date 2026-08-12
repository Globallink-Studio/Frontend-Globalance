import { getContactsByUserId, createContact as createMockContact, updateContact as updateMockContact, removeContact } from '../mocks/handlers/contacts'
import { getAuthMode, getCurrentUserId } from './auth'
import { fetchApi } from './fetchApi'
import { ApiError } from './errors'
import { applyContactMeta, removeContactMeta, setContactMeta } from './contactMeta'
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
    contact_type: apiContact.contact_type,
    contact_value: apiContact.contact_value,
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
    const mapped = (resp.contacts ?? []).map(mapApiContact)
    const userId = getCurrentUserId()
    return userId ? applyContactMeta(userId, mapped) : mapped
  }
  const userId = getCurrentUserId()
  if (!userId) return []
  return applyContactMeta(userId, await getContactsByUserId(userId))
}

export async function createContact(input: {
  name: string
  contactType: 'alias' | 'account_number'
  contactValue: string
}): Promise<Contact> {
  if (!input.name.trim()) throw new Error('Indicá un nombre para el contacto')
  const userId = getCurrentUserId()
  if (getAuthMode() === 'firebase') {
    let resp: { contact: ApiContact }
    try {
      resp = await fetchApi<{ contact: ApiContact }>('/contacts', {
        method: 'POST',
        body: {
          name: input.name.trim().slice(0, 50),
          type: input.contactType,
          value: input.contactValue.trim(),
        },
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        const target = input.contactType === 'alias' ? 'alias' : 'número de cuenta'
        throw new Error(
          `No existe ninguna cuenta Globalance con ese ${target}. Revisa el dato e intenta de nuevo.`,
        )
      }
      throw err
    }
    const contact = mapApiContact(resp.contact)
    return userId ? applyContactMeta(userId, [contact])[0] : contact
  }
  if (!userId) throw new Error('No hay usuario autenticado')
  return applyContactMeta(userId, [await createMockContact({ userId, ...input })])[0]
}

export async function updateContact(
  id: string,
  patch: Partial<
    Pick<
      Contact,
      | 'alias'
      | 'contact_type'
      | 'contact_value'
      | 'phone'
      | 'email'
      | 'category'
      | 'description'
      | 'favorite'
      | 'account'
    >
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
  } else {
    await removeContact(id)
  }
  const userId = getCurrentUserId()
  if (userId) removeContactMeta(userId, id)
}

export async function setContactFavorite(id: string, favorite: boolean): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('No hay usuario autenticado')
  setContactMeta(userId, id, { favorite })
  if (getAuthMode() !== 'firebase') {
    await updateMockContact(id, { favorite })
  }
}

export async function setContactCategory(id: string, category: string | null): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) throw new Error('No hay usuario autenticado')
  setContactMeta(userId, id, { category })
  if (getAuthMode() !== 'firebase') {
    await updateMockContact(id, { category })
  }
}
