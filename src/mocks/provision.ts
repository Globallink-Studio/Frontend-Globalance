import {
  addMockUser,
  addMockWallet,
  addMockBalances,
  addMockCards,
  addMockTransactions,
  addMockContact,
  getMockUsers,
  getMockWallets,
  getMockBalances,
  getMockPersonProfiles,
  getMockContacts,
  getMockContactCategories,
  addMockContactCategory,
} from './storage'
import { users as demoUsers } from './data/users'
import { wallets as demoWallets } from './data/wallets'
import { balances as demoBalances } from './data/balances'
import { cards as demoCards } from './data/cards'
import { transactions as demoTransactions } from './data/transactions'
import { contacts as demoContacts } from './data/contacts'
import { contactCategories as demoContactCategories } from './data/contactCategories'

const DEMO_WALLET_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111'

// Usuarios de referencia del directorio demo: los que los contactos de ejemplo
// apuntan (email, wallet y moneda). Se siembran para que las validaciones de
// contactos tengan contra quién validar en modo mock.
const DIRECTORY_USER_IDS = [
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
]

function provisionDemoDirectory(): void {
  demoUsers
    .filter((u) => DIRECTORY_USER_IDS.includes(u.id))
    .forEach((u) => {
      if (!getMockUsers().some((x) => x.id === u.id)) addMockUser(u)
    })

  const directoryWalletIds = new Set(
    demoWallets.filter((w) => DIRECTORY_USER_IDS.includes(w.user_id)).map((w) => w.id),
  )
  demoWallets
    .filter((w) => directoryWalletIds.has(w.id))
    .forEach((w) => {
      if (!getMockWallets().some((x) => x.id === w.id)) addMockWallet(w)
    })

  const missingBalances = demoBalances.filter(
    (b) => directoryWalletIds.has(b.wallet_id) && !getMockBalances().some((x) => x.id === b.id),
  )
  if (missingBalances.length > 0) addMockBalances(missingBalances)
}

function provisionDemoContacts(userId: string): void {
  if (getMockContactCategories().length === 0) {
    demoContactCategories.forEach((name) => addMockContactCategory(name))
  }

  if (getMockContacts().some((c) => c.user_id === userId)) return

  demoContacts
    .filter((c) => c.user_id === DEMO_USER_ID)
    .forEach((c) => addMockContact({ ...c, id: crypto.randomUUID(), user_id: userId }))
}

export function provisionDemoData(userId: string, nameHint = ''): void {
  provisionDemoDirectory()
  provisionDemoContacts(userId)
  if (getMockWallets().some((w) => w.user_id === userId)) return

  const walletId = crypto.randomUUID()
  const aliasBase = nameHint
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
  addMockWallet({
    id: walletId,
    user_id: userId,
    alias: aliasBase ? `${aliasBase}.wallet` : 'wallet.demo',
    account_number: String(Math.floor(1000000000 + Math.random() * 9000000000)),
    status: 'active',
    created_at: new Date().toISOString(),
  })

  addMockBalances(
    demoBalances
      .filter((b) => b.wallet_id === DEMO_WALLET_ID)
      .map((b) => ({ ...b, id: crypto.randomUUID(), wallet_id: walletId })),
  )

  const profile = getMockPersonProfiles().find((p) => p.user_id === userId)
  const fallback = nameHint.trim() || 'Usuario'
  const holder = profile ? `${profile.first_name} ${profile.last_name}`.trim() || fallback : fallback
  addMockCards(
    demoCards
      .filter((c) => c.user_id === DEMO_USER_ID)
      .map((c) => ({ ...c, id: crypto.randomUUID(), user_id: userId, holder })),
  )

  addMockTransactions(
    demoTransactions
      .filter((t) => t.wallet_id === DEMO_WALLET_ID)
      .map((t) => ({ ...t, id: crypto.randomUUID(), wallet_id: walletId })),
  )
}
