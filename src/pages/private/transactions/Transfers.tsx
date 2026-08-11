import { useEffect, useState } from 'react'
import { getTransactionsByType } from '../../../api/transactions'
import { getCurrentContacts } from '../../../api/contacts'
import TransactionList from '../../../components/TransactionList'
import TransferWizard from '../../../components/TransferWizard'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Contact } from '../../../mocks/data/contacts'
import '../../../styles/pages/private/transactions.css'

export default function Transfers() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const loadTransfers = () => getTransactionsByType('transfer').then(setTransactions)

  useEffect(() => {
    loadTransfers()
    getCurrentContacts().then(setContacts)
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

  return (
    <div className="tx-page">
      <div className="tx-grid">
        <div className="tx-card">
          <h3 className="tx-card__title">Nueva transferencia</h3>
          <TransferWizard
            contacts={contacts}
            step={step}
            setStep={setStep}
            onDone={(msg) => {
              setStep(1)
              setMessage(msg)
              void loadTransfers()
            }}
            onError={setErrorMessage}
            sending={sending}
            setSending={setSending}
          />
        </div>

        <section className="tx-card">
          <h3 className="tx-section__title">Historial de transferencias</h3>
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
              onClick={() => {
                setErrorMessage(null)
                setStep(1)
              }}
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
