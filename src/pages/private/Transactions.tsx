import { useEffect, useMemo, useState } from 'react'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { getRecentTransactions, transactionStatusLabels } from '../../api/transactions'
import Select from '../../components/Select'
import DatePicker from '../../components/DatePicker'
import Pagination from '../../components/Pagination'
import TransactionDetailModal from '../../components/TransactionDetailModal'
import PaymentRequestsSection from '../../components/PaymentRequestsSection'
import type { Transaction, TransactionStatus } from '../../mocks/data/transactions'
import '../../styles/pages/private/transactions.css'
import '../../styles/pages/private/profile.css'
import '../../styles/pages/private/contacts.css'

const TRANSACTIONS_PER_PAGE = 10

const typeLabels: Record<string, string> = {
  transfer: 'Transferencias',
  deposit: 'Depósitos',
  conversion: 'Conversiones',
  request: 'Solicitudes',
  withdrawal: 'Retiros',
}

const categoryLabels: Record<string, string> = {
  transfer: 'Retiro',
  deposit: 'Ingreso',
  conversion: 'Cambio',
  request: 'Solicitud',
  withdrawal: 'Retiro',
}

const currencies = ['USD', 'EUR', 'ARS']

const formatMoney = (amount: number, currency: string) => `${amount.toLocaleString('es-AR')} ${currency}`

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [type, setType] = useState('')
  const [currency, setCurrency] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Transaction | null>(null)

  useEffect(() => {
    getRecentTransactions(1000).then(setTransactions)
  }, [])

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (type && t.type !== type) return false
        if (currency && t.currency_code !== currency) return false
        if (status && t.status !== status) return false
        if (query.trim()) {
          const q = query.trim().toLowerCase()
          if (
            !t.description.toLowerCase().includes(q) &&
            !(t.concept ?? '').toLowerCase().includes(q)
          )
            return false
        }
        const day = t.created_at.slice(0, 10)
        if (from && day < from) return false
        if (to && day > to) return false
        return true
      }),
    [transactions, type, currency, status, query, from, to],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / TRANSACTIONS_PER_PAGE))
  const paged = filtered.slice((page - 1) * TRANSACTIONS_PER_PAGE, page * TRANSACTIONS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [type, currency, status, query, from, to])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const hasFilters = Boolean(type || currency || status || from || to || query.trim())

  const clearFilters = () => {
    setType('')
    setCurrency('')
    setStatus('')
    setFrom('')
    setTo('')
    setQuery('')
  }

  const typeChips = [
    { value: '', label: 'Todos' },
    ...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
  ]

  return (
    <div className="tx-page">
      <div className="min-w-0">
        <div className="profile-card history-toolbar">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por descripción o concepto..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pl-9 text-sm outline-none ring-offset-background transition-shadow focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((s) => !s)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:bg-surface${
                    showAdvanced ? ' border-ring bg-surface' : ' border-border'
                  }`}
                >
                  <Filter className="size-4" />
                  Filtros
                </button>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-surface"
                  >
                    <RotateCcw className="size-4" />
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto pb-1">
            {typeChips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setType(chip.value)}
                className={`contacts-chip${type === chip.value ? ' contacts-chip--active' : ''}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {showAdvanced && (
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
              <Select
                id="history-currency"
                label="Moneda"
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: '', label: 'Todas las monedas' },
                  ...currencies.map((c) => ({ value: c, label: c })),
                ]}
              />
              <Select
                id="history-status"
                label="Estado"
                value={status}
                onChange={setStatus}
                options={[
                  { value: '', label: 'Todos los estados' },
                  ...(Object.entries(transactionStatusLabels) as [TransactionStatus, string][])
                    .filter(([value]) => value !== 'reversed')
                    .map(([value, label]) => ({ value, label })),
                ]}
              />
              <DatePicker
                id="history-from"
                label="Desde"
                value={from}
                onChange={setFrom}
                placeholder="Elegir fecha"
              />
              <DatePicker
                id="history-to"
                label="Hasta"
                value={to}
                onChange={setTo}
                placeholder="Elegir fecha"
              />
            </div>
          )}

          {type === 'request' && (
            <div className="mt-6">
              <PaymentRequestsSection />
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No hay movimientos para los filtros seleccionados.
            </p>
          ) : (
            <>
              <div className="profile-card tx-table-card">
                <div className="overflow-x-auto">
                  <table className="tx-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Categoría</th>
                        <th>Moneda</th>
                        <th>Importe</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((t) => {
                        const isIncome = t.type === 'deposit' || t.type === 'request' || (t.type === 'transfer' && t.direction === 'in')
                        const isExpense = t.type === 'withdrawal' || (t.type === 'transfer' && t.direction !== 'in')
                        const sign = isExpense ? '-' : isIncome ? '+' : ''
                        return (
                          <tr key={t.id} className="tx-table__row" onClick={() => setSelected(t)}>
                            <td className="tx-table__date">
                              {new Date(t.created_at).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </td>
                            <td>
                              <p className="tx-table__name">
                                {t.concept?.trim() || t.description}
                              </p>
                              {t.concept && (
                                <p className="tx-table__detail">{t.description}</p>
                              )}
                            </td>
                            <td>
                              <span className="tx-table__concept">{categoryLabels[t.type] ?? t.type}</span>
                            </td>
                            <td>
                              <span className="tx-table__currency">{t.currency_code}</span>
                            </td>
                            <td>
                              <span
                                className={`tx-table__amount${
                                  isIncome ? ' tx-table__amount--income' : ''
                                }`}
                              >
                                {sign}
                                {formatMoney(t.amount, t.currency_code)}
                              </span>
                            </td>
                            <td>
                              <span className={`tx-status tx-status--${t.status}`}>
                                {transactionStatusLabels[t.status]}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
      </div>

      <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
