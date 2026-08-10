import { useEffect, useState } from 'react'
import { getCurrentContacts } from '../api/contacts'
import { getCurrentTransactions } from '../api/transactions'
import { getCurrentWallet } from '../api/wallets'
import { getCurrentCards } from '../api/cards'
import { getCurrentNotifications } from '../api/notifications'
import type { SearchData } from '../api/search'

export function useGlobalSearch(): SearchData | null {
  const [data, setData] = useState<SearchData | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([
      getCurrentContacts(),
      getCurrentTransactions(),
      getCurrentWallet(),
      getCurrentCards(),
      getCurrentNotifications(),
    ]).then(([contacts, transactions, wallet, cards, notifications]) => {
      if (!active) return
      setData({ contacts, transactions, wallet, cards, notifications })
    })
    return () => {
      active = false
    }
  }, [])

  return data
}
