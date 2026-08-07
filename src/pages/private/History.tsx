import { useEffect, useMemo, useState } from 'react'
import { getRecentTransactions } from '../../api/transactions'
import { transactionStatusLabels } from '../../api/transactions'
import type { Transaction } from '../../mocks/data/transactions'

const typeLabels: Record<string, string> = {
  transfer: 'Transferencias',
  deposit: 'Depósitos',
  conversion: 'Conversiones',
  request: 'Solicitudes',
}

const currencies = ['USD', 'EUR', 'ARS']

const monthKey = (iso: string) => iso.slice(0, 7)

const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00.000Z`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [type, setType] = useState('')
  const [currency, setCurrency] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    getRecentTransactions(1000).then(setTransactions)
  }, [])

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (type && t.type !== type) return false
        if (currency && t.currency_code !== currency) return false
        const day = t.created_at.slice(0, 10)
        if (from && day < from) return false
        if (to && day > to) return false
        return true
      }),
    [transactions, type, currency, from, to],
  )

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) {
      const key = monthKey(t.created_at)
      const list = map.get(key) ?? []
      list.push(t)
      map.set(key, list)
    }
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => ({
        key,
        label: monthLabel(key),
        items: items.sort((a, b) => b.created_at.localeCompare(a.created_at)),
      }))
  }, [filtered])

  return (
    <div className="tx-page">
      <h2 className="tx-page__title">Historial</h2>

      <div className="tx-form__grid history-filters">
        <div className="tx-form__field">
          <label className="tx-form__label" htmlFor="history-type">Tipo</label>
          <select
            id="history-type"
            className="tx-form__control"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="tx-form__field">
          <label className="tx-form__label" htmlFor="history-currency">Moneda</label>
          <select
            id="history-currency"
            className="tx-form__control"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="">Todas las monedas</option>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="tx-form__field">
          <label className="tx-form__label" htmlFor="history-from">Desde</label>
          <input
            id="history-from"
            type="date"
            className="tx-form__control"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="tx-form__field">
          <label className="tx-form__label" htmlFor="history-to">Hasta</label>
          <input
            id="history-to"
            type="date"
            className="tx-form__control"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="tx-list__empty">No hay movimientos para los filtros seleccionados.</p>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="history-group">
            <h3 className="tx-section__title history-group__title">{group.label}</h3>
            <ul className="tx-list">
              {group.items.map((t) => (
                <li key={t.id} className="tx-list__item">
                  <div className="tx-list__info">
                    <p className="tx-list__description">{t.description}</p>
                    <p className="tx-list__status">
                      {t.concept ? `${t.concept} · ` : ''}
                      {typeLabels[t.type] ?? t.type} · {transactionStatusLabels[t.status]}
                    </p>
                  </div>
                  <div className="tx-list__right">
                    <span className="tx-list__date">
                      {new Date(t.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                    <p className="tx-list__amount">
                      {t.amount.toLocaleString('es-AR')} {t.currency_code}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
