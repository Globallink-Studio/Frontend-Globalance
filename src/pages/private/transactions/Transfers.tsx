import { useEffect, useState, type FormEvent } from 'react'
import { createTransfer, getTransactionsByType } from '../../../api/transactions'
import { getCurrentBalances } from '../../../api/balances'
import { getCurrentContacts } from '../../../api/contacts'
import { getUserByEmail } from '../../../api/users'
import TransactionList from '../../../components/TransactionList'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Contact } from '../../../mocks/data/contacts'
import type { Balance } from '../../../mocks/data/balances'

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
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Nueva transferencia</h2>

      {review ? (
        <div className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Confirmá la transferencia</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Destinatario</dt>
              <dd className="font-medium">{review.recipient}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Moneda</dt>
              <dd className="font-medium">{review.currencyCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Monto</dt>
              <dd className="font-semibold">{review.amount.toLocaleString('es-AR')} {review.currencyCode}</dd>
            </div>
          </dl>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReview(null)}
              disabled={sending}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={sending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Confirmar transferencia'}
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="mb-1 block text-sm text-gray-600">Enviar a</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="sendMethod"
                  value="contact"
                  checked={sendMethod === 'contact'}
                  onChange={() => setSendMethod('contact')}
                />
                Contacto
              </label>
              <label className="flex items-center gap-2 text-sm">
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
            <div>
              <label htmlFor="contact" className="mb-1 block text-sm text-gray-600">Contacto</label>
              <select
                id="contact"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Elegí un contacto</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.alias}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-gray-600">Correo del destinatario</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="currency" className="mb-1 block text-sm text-gray-600">Moneda</label>
            <select
              id="currency"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {balances.map((b) => (
                <option key={b.currency_code} value={b.currency_code}>{b.currency_code}</option>
              ))}
            </select>
            {selectedBalance && (
              <p className="mt-1 text-xs text-gray-500">
                Saldo disponible: {selectedBalance.amount.toLocaleString('es-AR')} {selectedBalance.currency_code}
              </p>
            )}
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
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Continuar
          </button>
        </form>
      )}

      {message && (
        <div className="fixed right-4 top-4 z-50 max-w-xs rounded-lg bg-green-600 px-4 py-3 text-sm text-white shadow-lg">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">No se pudo realizar la operación</h3>
            <p className="mb-4 text-sm text-gray-600">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null)
                if (dismissReturns) setReview(null)
              }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Historial de transferencias</h3>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  )
}
