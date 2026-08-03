import { useEffect, useState } from 'react'
import { getCurrentCards } from '../../../api/cards'
import type { Card } from '../../../mocks/data/cards'

const brandLabel: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
}

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    getCurrentCards().then(setCards)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tarjetas</h1>

      {cards.length === 0 && <p className="text-sm text-gray-500">Sin tarjetas.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.id} className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-800 to-gray-900 p-5 text-white shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium">{brandLabel[card.brand] ?? card.brand}</span>
              <span className="text-xs text-gray-300">{card.status}</span>
            </div>
            <p className="mb-4 font-mono text-lg tracking-widest">•••• •••• •••• {card.last_four}</p>
            <p className="text-sm text-gray-300">{card.holder}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
