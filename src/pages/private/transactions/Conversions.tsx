import { useEffect, useState, type FormEvent } from 'react'
import { createConversion, getTransactionsByType } from '../../../api/transactions'
import { getCurrentBalances } from '../../../api/balances'
import { convertCurrency, getQuotes } from '../../../api/exchangeRates'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Balance } from '../../../mocks/data/balances'
import type { ExchangeRate } from '../../../mocks/data/exchangeRates'
import '../../../styles/pages/private/transactions.css'

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

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

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
    <div className="tx-page">
      <h2 className="tx-page__title">Nueva conversión</h2>

      <div className="tx-grid">
        <form onSubmit={handleSubmit} className="tx-card tx-form">
          <div className="tx-form__grid">
            <div className="tx-form__field">
              <label htmlFor="from" className="tx-form__label">Desde</label>
              <select
                id="from"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="tx-form__control"
              >
                {balances.map((b) => (
                  <option key={b.currency_code} value={b.currency_code}>{b.currency_code}</option>
                ))}
              </select>
              {fromBalance && (
                <p className="tx-form__hint">
                  Saldo: {fromBalance.amount.toLocaleString('es-AR')} {fromBalance.currency_code}
                </p>
              )}
            </div>

            <div className="tx-form__field">
              <label htmlFor="to" className="tx-form__label">Hacia</label>
              <select
                id="to"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="tx-form__control"
              >
                {quotes
                  .filter((q) => q.currency_code !== fromCurrency)
                  .map((q) => (
                    <option key={q.currency_code} value={q.currency_code}>{q.currency_code}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="tx-form__field">
            <label htmlFor="amount" className="tx-form__label">Monto</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="tx-form__control"
            />
            {result !== null && (
              <p className="tx-form__result">
                Recibís ≈ {result.toLocaleString('es-AR')} {toCurrency}
              </p>
            )}
          </div>

          <button type="submit" disabled={sending} className="tx-button tx-button--primary tx-button--block">
            {sending ? 'Convirtiendo...' : 'Convertir'}
          </button>
        </form>

        <section className="tx-card">
          <h3 className="tx-section__title">Historial de conversiones</h3>
          <TransactionList transactions={transactions} compact />
        </section>
      </div>

      {message && (
        <div className="tx-toast">{message}</div>
      )}

      {errorMessage && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">No se pudo realizar la operación</h3>
            <p className="tx-modal__message">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="tx-button tx-button--primary tx-button--block"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
