import type { AppNotification } from '../mocks/data/notifications'
import type { Card } from '../mocks/data/cards'
import type { Contact } from '../mocks/data/contacts'
import type { Transaction } from '../mocks/data/transactions'
import type { Wallet } from '../mocks/data/wallets'
import { transactionStatusLabels } from './transactions'

export type SearchSectionKey = 'contacts' | 'transactions' | 'wallet' | 'cards' | 'notifications'

export interface SearchData {
  contacts: Contact[]
  transactions: Transaction[]
  wallet?: Wallet
  cards: Card[]
  notifications: AppNotification[]
}

export interface SearchHit {
  id: string
  title: string
  subtitle: string
  to: string
  state?: Record<string, string>
}

export interface SearchSection {
  key: SearchSectionKey
  label: string
  to: string
  total: number
  hits: SearchHit[]
}

const transactionTypeLabels: Record<Transaction['type'], string> = {
  transfer: 'Transferencia',
  deposit: 'Depósito',
  conversion: 'Conversión',
  request: 'Solicitud',
  withdrawal: 'Retiro',
}

const normalize = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const includes = (query: string, ...values: (string | null | undefined)[]): boolean => {
  const q = normalize(query)
  return values.some((value) => value != null && value !== '' && normalize(value).includes(q))
}

function buildSection(
  key: SearchSectionKey,
  label: string,
  to: string,
  hits: SearchHit[],
  maxHits: number,
): SearchSection {
  return { key, label, to, total: hits.length, hits: hits.slice(0, maxHits) }
}

const FAVORITE_KEYWORDS = ['favorito', 'favoritos', 'favorit']

export function searchGlobal(data: SearchData, query: string, maxHitsPerSection = 6): SearchSection[] {
  const q = query.trim()
  if (q.length < 2) return []
  const sections: SearchSection[] = []

  const matchesFavorites = FAVORITE_KEYWORDS.some((k) => q.includes(k) || k.startsWith(q))

  const contactHits = data.contacts
    .filter(
      (c) =>
        includes(q, c.alias, c.account, c.email, c.phone, c.category, c.description) ||
        (c.favorite && matchesFavorites),
    )
    .map<SearchHit>((c) => ({
      id: c.id,
      title: c.alias,
      subtitle: [c.favorite ? '★ Favorito' : null, c.email, c.account].filter(Boolean).join(' · ') || 'Contacto',
      to: '/dashboard/contacts',
    }))
  if (contactHits.length > 0) {
    sections.push(buildSection('contacts', 'Contactos', '/dashboard/contacts', contactHits, maxHitsPerSection))
  }

  const transactionHits = data.transactions
    .filter((t) =>
      includes(
        q,
        t.description,
        t.concept,
        t.currency_code,
        transactionTypeLabels[t.type],
        transactionStatusLabels[t.status],
      ),
    )
    .map<SearchHit>((t) => ({
      id: t.id,
      title: t.description,
      subtitle: `${transactionTypeLabels[t.type]} · ${t.currency_code} ${t.amount.toLocaleString('es-AR')} · ${transactionStatusLabels[t.status]}`,
      to: '/dashboard/history',
    }))
  if (transactionHits.length > 0) {
    sections.push(buildSection('transactions', 'Transacciones', '/dashboard/history', transactionHits, maxHitsPerSection))
  }

  if (data.wallet && includes(q, data.wallet.alias, data.wallet.account_number)) {
    sections.push(
      buildSection('wallet', 'Billetera', '/dashboard/wallet', [
        {
          id: data.wallet.id,
          title: data.wallet.alias,
          subtitle: data.wallet.account_number,
          to: '/dashboard/wallet',
        },
      ], maxHitsPerSection),
    )
  }

  const cardHits = data.cards
    .filter((c) => includes(q, c.holder, c.brand, c.last_four, c.masked_number))
    .map<SearchHit>((c) => ({
      id: c.id,
      title: c.holder,
      subtitle: `${c.brand === 'visa' ? 'Visa' : 'Mastercard'} ·••• ${c.last_four}`,
      to: '/dashboard/cards',
    }))
  if (cardHits.length > 0) {
    sections.push(buildSection('cards', 'Tarjetas', '/dashboard/cards', cardHits, maxHitsPerSection))
  }

  const notificationHits = data.notifications
    .filter((n) => includes(q, n.title, n.message))
    .map<SearchHit>((n) => ({
      id: n.id,
      title: n.title,
      subtitle: n.message,
      to: '/dashboard/notifications',
      state: { openedId: n.id },
    }))
  if (notificationHits.length > 0) {
    sections.push(buildSection('notifications', 'Notificaciones', '/dashboard/notifications', notificationHits, maxHitsPerSection))
  }

  return sections
}
