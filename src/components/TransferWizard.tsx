import { useEffect, useState, type FormEvent } from 'react'
import { createTransfer } from '../api/transactions'
import { getCurrentBalances } from '../api/balances'
import { getUserByEmail } from '../mocks/handlers/users'
import { getWalletByAlias } from '../mocks/handlers/wallets'
import Select from './Select'
import type { Contact } from '../mocks/data/contacts'
import type { Balance } from '../mocks/data/balances'

export interface TransferReviewData {
  recipient: string
  recipientUserId: string
  currencyCode: string
  amount: number
  concept?: string
}

interface TransferWizardProps {
  contacts: Contact[]
  step: number
  setStep: (v: number) => void
  onDone: (msg: string) => void
  onError: (msg: string) => void
  sending: boolean
  setSending: (v: boolean) => void
}

export default function TransferWizard({ contacts, step, setStep, onDone, onError, sending, setSending }: TransferWizardProps) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [sendMethod, setSendMethod] = useState<'alias' | 'contact' | 'email'>('alias')
  const [alias, setAlias] = useState('')
  const [contactId, setContactId] = useState('')
  const [email, setEmail] = useState('')
  const [currencyCode, setCurrencyCode] = useState('ARS')
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')
  const [review, setReview] = useState<TransferReviewData | null>(null)

  useEffect(() => {
    getCurrentBalances().then(setBalances)
  }, [])

  const selectedBalance = balances.find((b) => b.currency_code === currencyCode)
  const value = Number(amount)
  const recipientFilled =
    sendMethod === 'contact'
      ? Boolean(contactId)
      : sendMethod === 'email'
        ? /^\S+@\S+\.\S+$/.test(email.trim())
        : Boolean(alias.trim())

  const handleNext = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onError('')
    if (!recipientFilled) {
      onError('Completá el destinatario para continuar')
      return
    }
    if (!(value > 0)) {
      onError('Ingresá un monto válido para continuar')
      return
    }

    let recipient = ''
    let recipientUserId = ''
    if (sendMethod === 'contact') {
      const contact = contacts.find((c) => c.id === contactId)
      recipient = contact?.alias ?? ''
      recipientUserId = contact?.recipient_user_id ?? ''
    } else if (sendMethod === 'email') {
      const user = await getUserByEmail(email.trim())
      if (!user) {
        onError('No existe un usuario registrado con ese correo')
        return
      }
      recipient = user.email
      recipientUserId = user.id
    } else {
      const wallet = await getWalletByAlias(alias)
      if (!wallet || wallet.status !== 'active') {
        onError('No se encontró ninguna billetera activa con ese alias')
        return
      }
      recipient = wallet.alias
      recipientUserId = wallet.user_id
    }

    setReview({
      recipient,
      recipientUserId,
      currencyCode,
      amount: value,
      concept: concept.trim() || undefined,
    })
    setStep(2)
  }

  const handleConfirm = async () => {
    if (!review) return
    setSending(true)
    onError('')
    try {
      await createTransfer({
        recipient: review.recipient,
        recipientUserId: review.recipientUserId,
        currencyCode: review.currencyCode,
        amount: review.amount,
        concept: review.concept,
      })
      onDone(`Transferencia a ${review.recipient} enviada`)
    } catch (err) {
      setReview(null)
      setStep(1)
      onError(err instanceof Error ? err.message : 'No se pudo realizar la transferencia')
    } finally {
      setSending(false)
    }
  }

  if (step === 2 && review) {
    return (
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
          {review.concept && (
            <div className="tx-review__row">
              <dt className="tx-review__label">Concepto</dt>
              <dd className="tx-review__value">{review.concept}</dd>
            </div>
          )}
        </dl>

        <div className="tx-review__actions">
          <button
            type="button"
            onClick={() => setStep(1)}
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
    )
  }

  return (
    <form onSubmit={handleNext} className="tx-form">
      <div className="tx-form__field">
        <p className="tx-form__label">Enviar a</p>
        <div className="tx-form__options">
          <label className="tx-form__option">
            <input
              type="radio"
              name="sendMethod"
              value="alias"
              checked={sendMethod === 'alias'}
              onChange={() => setSendMethod('alias')}
            />
            Alias
          </label>
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
        <Select
          id="contact"
          label="Contacto"
          value={contactId}
          onChange={setContactId}
          options={[
            { value: '', label: 'Elegí un contacto' },
            ...contacts.map((c) => ({ value: c.id, label: c.alias })),
          ]}
        />
      ) : sendMethod === 'email' ? (
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
      ) : (
        <div className="tx-form__field">
          <label htmlFor="alias" className="tx-form__label">Alias del destinatario</label>
          <input
            id="alias"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="juan.cash"
            className="tx-form__control"
          />
        </div>
      )}

      <div className="tx-form__grid">
        <Select
          id="currency"
          label="Moneda"
          value={currencyCode}
          onChange={setCurrencyCode}
          options={balances.map((b) => ({ value: b.currency_code, label: b.currency_code }))}
          hint={
            selectedBalance
              ? `Saldo: ${selectedBalance.amount.toLocaleString('es-AR')} ${selectedBalance.currency_code}`
              : undefined
          }
        />

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
      </div>

      <div className="tx-form__field">
        <label htmlFor="concept" className="tx-form__label">Concepto</label>
        <input
          id="concept"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="¿Para qué es esta transferencia?"
          className="tx-form__control"
        />
      </div>

      <button type="submit" className="tx-button tx-button--primary tx-button--block">
        Continuar
      </button>
    </form>
  )
}
