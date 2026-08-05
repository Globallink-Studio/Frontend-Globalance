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

      {cards.length === 0 && <p className="text-sm text-muted-foreground">Sin tarjetas.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.id} className="iridescent rounded-2xl p-5 shadow-soft on-iridescent">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium">{brandLabel[card.brand] ?? card.brand}</span>
              <span className="text-xs on-iridescent opacity-70">{card.status}</span>
            </div>
            <p className="mb-4 font-mono text-lg tracking-widest">•••• •••• •••• {card.last_four}</p>
            <p className="text-sm on-iridescent opacity-70">{card.holder}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
