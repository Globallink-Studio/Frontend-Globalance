import { useEffect, useState } from 'react'
import { getQuotes } from '../../api/exchangeRates'
import type { ExchangeRate } from '../../mocks/data/exchangeRates'

export default function Exchange() {
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])

  useEffect(() => {
    getQuotes().then(setQuotes)
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Cotizaciones</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quotes.map((q) => (
          <div key={q.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{q.currency_name}</p>
            <p className="mb-3 text-2xl font-semibold">{q.symbol}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Compra</span>
                <span className="font-medium">
                  {q.buy_price.toLocaleString('es-AR')} ARS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venta</span>
                <span className="font-medium">
                  {q.sell_price.toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
