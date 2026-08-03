import { useEffect, useState, type FormEvent } from 'react'
import { createTransfer, getTransactionsByType } from '../../../api/transactions'
import { getCurrentBalances } from '../../../api/balances'
import { getCurrentContacts } from '../../../api/contacts'
import { getUserByEmail } from '../../../api/users'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Contact } from '../../../mocks/data/contacts'
import type { Balance } from '../../../mocks/data/balances'
import '../../../styles/pages/private/transactions.css'

interface ReviewData {
  recipient: string
  recipientUserId: string
  currencyCode: string
  amount: number
}

export default function Transfers() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [sendMethod, setSendMethod] = useState<'contact' | 'email'>('contact')
  const [contactId, setContactId] = useState('')
  const [email, setEmail] = useState('')
  const [currencyCode, setCurrencyCode] = useState('ARS')
  const [amount, setAmount] = useState('')
  const [review, setReview] = useState<ReviewData | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dismissReturns, setDismissReturns] = useState(false)
  const [sending, setSending] = useState(false)

  const loadTransfers = () => getTransactionsByType('transfer').then(setTransactions)

  useEffect(() => {
    loadTransfers()
    getCurrentContacts().then(setContacts)
    getCurrentBalances().then(setBalances)
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  useEffect(() => {
    if (!transactions.some((t) => t.status === 'pending' || t.status === 'processing')) return
    const t = setTimeout(() => loadTransfers(), 1200)
    return () => clearTimeout(t)
  }, [transactions])

  const selectedBalance = balances.find((b) => b.currency_code === currencyCode)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = Number(amount)
    setErrorMessage(null)
    setMessage(null)

    let recipient = ''
    let recipientUserId = ''
    if (sendMethod === 'contact') {
      const contact = contacts.find((c) => c.id === contactId)
      if (!contact) {
        setDismissReturns(false)
        setErrorMessage('Elegí un contacto')
        return
      }
      recipient = contact.alias
      recipientUserId = contact.recipient_user_id
    } else {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        setDismissReturns(false)
        setErrorMessage('Ingresá un correo electrónico válido')
        return
      }
      const user = await getUserByEmail(email.trim())
      if (!user) {
        setDismissReturns(false)
        setErrorMessage('No existe un usuario registrado con ese correo')
        return
      }
      recipient = user.email
      recipientUserId = user.id
    }

    if (!value || value <= 0) {
      setDismissReturns(false)
      setErrorMessage('Ingresá un monto válido')
      return
    }

    setReview({ recipient, recipientUserId, currencyCode, amount: value })
  }

  const handleConfirm = async () => {
    if (!review) return
    setSending(true)
    setErrorMessage(null)
    setMessage(null)
    try {
      await createTransfer({
        recipient: review.recipient,
        recipientUserId: review.recipientUserId,
        currencyCode: review.currencyCode,
        amount: review.amount,
      })
      setMessage(`Transferencia a ${review.recipient} enviada`)
      setReview(null)
      setAmount('')
      await loadTransfers()
    } catch (err) {
      setDismissReturns(true)
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo realizar la transferencia')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="tx-page">
      <h2 className="tx-page__title">Nueva transferencia</h2>

      {review ? (
        <div className="tx-card tx-card--form">
          <h3 className="tx-card__title">Confirmá la transferencia</h3>
          <div className="tx-review">
            <dl className="tx-review__rows">
              <div className="tx-review__row">
                <dt className="tx-review__label">Destinatario</dt>
                <dd className="tx-review__value">{review.recipient}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Moneda</dt>
                <dd className="tx-review__value">{review.currencyCode}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Monto</dt>
                <dd className="tx-review__value tx-review__amount">
                  {review.amount.toLocaleString('es-AR')} {review.currencyCode}
                </dd>
              </div>
            </dl>

            <div className="tx-review__actions">
              <button
                type="button"
                onClick={() => setReview(null)}
                disabled={sending}
                className="tx-button tx-button--secondary"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={sending}
                className="tx-button tx-button--primary"
              >
                {sending ? 'Enviando...' : 'Confirmar transferencia'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="tx-card tx-card--form tx-form">
          <div className="tx-form__field">
            <p className="tx-form__label">Enviar a</p>
            <div className="tx-form__options">
              <label className="tx-form__option">
                <input
                  type="radio"
                  name="sendMethod"
                  value="contact"
                  checked={sendMethod === 'contact'}
                  onChange={() => setSendMethod('contact')}
                />
                Contacto
              </label>
              <label className="tx-form__option">
                <input
                  type="radio"
                  name="sendMethod"
                  value="email"
                  checked={sendMethod === 'email'}
                  onChange={() => setSendMethod('email')}
                />
                Correo electrónico
              </label>
            </div>
          </div>

          {sendMethod === 'contact' ? (
            <div className="tx-form__field">
              <label htmlFor="contact" className="tx-form__label">Contacto</label>
              <select
                id="contact"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="tx-form__control"
              >
                <option value="">Elegí un contacto</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.alias}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="tx-form__field">
              <label htmlFor="email" className="tx-form__label">Correo del destinatario</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@example.com"
                className="tx-form__control"
              />
            </div>
          )}

          <div className="tx-form__field">
            <label htmlFor="currency" className="tx-form__label">Moneda</label>
            <select
              id="currency"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="tx-form__control"
            >
              {balances.map((b) => (
                <option key={b.currency_code} value={b.currency_code}>{b.currency_code}</option>
              ))}
            </select>
            {selectedBalance && (
              <p className="tx-form__hint">
                Saldo disponible: {selectedBalance.amount.toLocaleString('es-AR')} {selectedBalance.currency_code}
              </p>
            )}
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
          </div>

          <button type="submit" className="tx-button tx-button--primary tx-button--block">
            Continuar
          </button>
        </form>
      )}

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
              onClick={() => {
                setErrorMessage(null)
                if (dismissReturns) setReview(null)
              }}
              className="tx-button tx-button--primary tx-button--block"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      <section className="tx-card">
        <h3 className="tx-section__title">Historial de transferencias</h3>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  )
}
