import { useEffect, useState, type FormEvent } from 'react'
import { createConversion, getTransactionsByType } from '../../../api/transactions'
import { getCurrentBalances } from '../../../api/balances'
import { convertCurrency, getQuotes } from '../../../api/exchangeRates'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Balance } from '../../../mocks/data/balances'
import type { ExchangeRate } from '../../../mocks/data/exchangeRates'

export default function Conversions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])
  const [fromCurrency, setFromCurrency] = useState('ARS')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const loadConversions = () => getTransactionsByType('conversion').then(setTransactions)

  useEffect(() => {
    loadConversions()
    getCurrentBalances().then(setBalances)
    getQuotes().then(setQuotes)
  }, [])

  const fromBalance = balances.find((b) => b.currency_code === fromCurrency)

  useEffect(() => {
    const value = Number(amount)
    if (!value || value <= 0 || fromCurrency === toCurrency) {
      setResult(null)
      return
    }
    convertCurrency(fromCurrency, toCurrency, value).then(setResult)
  }, [amount, fromCurrency, toCurrency])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = Number(amount)
    setErrorMessage(null)
    setMessage(null)

    if (fromCurrency === toCurrency) {
      setErrorMessage('La moneda de origen y destino deben ser distintas')
      return
    }
    if (!value || value <= 0) {
      setErrorMessage('Ingresá un monto válido')
      return
    }

    setSending(true)
    try {
      await createConversion({ fromCurrency, toCurrency, amount: value })
      setMessage(`Convertidos ${value} ${fromCurrency} a ${toCurrency}`)
      setAmount('')
      setResult(null)
      await loadConversions()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al convertir')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Nueva conversión</h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div>
          <label htmlFor="from" className="mb-1 block text-sm text-gray-600">Desde</label>
          <select
            id="from"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {balances.map((b) => (
              <option key={b.currency_code} value={b.currency_code}>{b.currency_code}</option>
            ))}
          </select>
          {fromBalance && (
            <p className="mt-1 text-xs text-gray-500">
              Saldo disponible: {fromBalance.amount.toLocaleString('es-AR')} {fromBalance.currency_code}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="to" className="mb-1 block text-sm text-gray-600">Hacia</label>
          <select
            id="to"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {quotes
              .filter((q) => q.currency_code !== fromCurrency)
              .map((q) => (
                <option key={q.currency_code} value={q.currency_code}>{q.currency_code}</option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm text-gray-600">Monto</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {result !== null && (
            <p className="mt-1 text-sm text-gray-600">
              Recibís ≈ {result.toLocaleString('es-AR')} {toCurrency}
            </p>
          )}
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? 'Convirtiendo...' : 'Convertir'}
        </button>
      </form>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Historial de conversiones</h3>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  )
}
