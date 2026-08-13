const META_KEY = (userId: string) => `globalance.contactMeta.${userId}`

export interface ContactMeta {
  favorite?: boolean
  category?: string | null
}

function readMeta(userId: string): Record<string, ContactMeta> {
  try {
    const raw = localStorage.getItem(META_KEY(userId))
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, ContactMeta>) : {}
  } catch {
    return {}
  }
}

function writeMeta(userId: string, value: Record<string, ContactMeta>): void {
  localStorage.setItem(META_KEY(userId), JSON.stringify(value))
}

export function getContactMeta(userId: string, contactId: string): ContactMeta {
  return readMeta(userId)[contactId] ?? {}
}

export function applyContactMeta<T extends { id: string }>(userId: string, contacts: T[]): T[] {
  const meta = readMeta(userId)
  return contacts.map((c) => {
    const m = meta[c.id]
    if (!m) return c
    return {
      ...c,
      ...(m.favorite !== undefined ? { favorite: m.favorite } : {}),
      ...(m.category !== undefined ? { category: m.category } : {}),
    }
  })
}

export function setContactMeta(userId: string, contactId: string, patch: ContactMeta): void {
  const all = readMeta(userId)
  const next = { ...all[contactId], ...patch }
  if (next.favorite === undefined && next.category === undefined) {
    const { [contactId]: _removed, ...rest } = all
    writeMeta(userId, rest)
    return
  }
  writeMeta(userId, { ...all, [contactId]: next })
}

export function removeContactMeta(userId: string, contactId: string): void {
  const all = readMeta(userId)
  if (!(contactId in all)) return
  const { [contactId]: _removed, ...rest } = all
  writeMeta(userId, rest)
}

export function clearContactMetaCategory(userId: string, categoryName: string): void {
  const all = readMeta(userId)
  let changed = false
  for (const id of Object.keys(all)) {
    if (all[id].category === categoryName) {
      all[id] = { ...all[id], category: undefined }
      changed = true
    }
  }
  if (changed) writeMeta(userId, all)
}

export function renameContactMetaCategory(userId: string, oldName: string, newName: string): void {
  const all = readMeta(userId)
  let changed = false
  for (const id of Object.keys(all)) {
    if ((all[id].category ?? '').toLowerCase() === oldName.toLowerCase()) {
      all[id] = { ...all[id], category: newName }
      changed = true
    }
  }
  if (changed) writeMeta(userId, all)
}
