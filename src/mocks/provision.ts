import {
  addMockWallet,
  addMockBalances,
  addMockCards,
  addMockTransactions,
  getMockWallets,
  getMockPersonProfiles,
} from './storage'
import { balances as demoBalances } from './data/balances'
import { cards as demoCards } from './data/cards'
import { transactions as demoTransactions } from './data/transactions'

const DEMO_WALLET_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111'

export function provisionDemoData(userId: string, nameHint = ''): void {
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
