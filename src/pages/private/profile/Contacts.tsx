import { useEffect, useState } from 'react'
import { getCurrentContacts } from '../../../api/contacts'
import type { Contact } from '../../../mocks/data/contacts'

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    getCurrentContacts().then(setContacts)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contactos frecuentes</h1>

      {contacts.length === 0 && <p className="text-sm text-muted-foreground">Sin contactos.</p>}

      <ul className="space-y-2">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-soft">
            <div>
              <p className="text-sm font-medium">{c.alias}</p>
              {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
