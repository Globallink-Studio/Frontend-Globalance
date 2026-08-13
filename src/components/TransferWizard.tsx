import { useEffect, useState, type FormEvent } from 'react'
import { createTransfer } from '../api/transactions'
import { getCurrentBalances } from '../api/balances'
import { getAuthMode } from '../api/auth'
import { getWalletByAlias, getWalletByAccountNumber } from '../mocks/handlers/wallets'
import Select from './Select'
import type { Contact } from '../mocks/data/contacts'
import type { Balance } from '../mocks/data/balances'

export interface TransferReviewData {
  recipient: string
  recipientUserId: string
  destinationType: 'alias' | 'accountNumber'
  currencyCode: string
  amount: number
  concept?: string
  idLabel: string
  idValue: string
}

interface TransferWizardProps {
  contacts: Contact[]
  step: number
  setStep: (v: number) => void
  onDone: (msg: string) => void
  onError: (error: unknown) => void
  sending: boolean
  setSending: (v: boolean) => void
  initialContactId?: string
}

export default function TransferWizard({ contacts, step, setStep, onDone, onError, sending, setSending, initialContactId }: TransferWizardProps) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [sendMethod, setSendMethod] = useState<'alias' | 'accountNumber' | 'contact'>(initialContactId ? 'contact' : 'alias')
  const [destination, setDestination] = useState('')
  const [contactId, setContactId] = useState(initialContactId ?? '')
  const [currencyCode, setCurrencyCode] = useState('ARS')
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')
  const [review, setReview] = useState<TransferReviewData | null>(null)

  useEffect(() => {
    getCurrentBalances().then(setBalances)
  }, [])

  const selectedBalance = balances.find((b) => b.currency_code === currencyCode)
  const value = Number(amount)
  const recipientFilled = sendMethod === 'contact' ? Boolean(contactId) : Boolean(destination.trim())
  const exceedsBalance = selectedBalance ? value > selectedBalance.amount : false
  const isValid = recipientFilled && value > 0 && !exceedsBalance

  const handleNext = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onError('')
    if (!recipientFilled) {
      onError('Completa el destinatario para continuar')
      return
    }
    if (!(value > 0)) {
      onError('Ingresa un monto válido para continuar')
      return
    }

    let recipient = ''
    let recipientUserId = ''
    let destinationType: 'alias' | 'accountNumber' = 'alias'
    let idLabel = 'Alias'
    let idValue = ''
    if (sendMethod === 'contact') {
      const contact = contacts.find((c) => c.id === contactId)
      recipient = contact?.alias ?? ''
      recipientUserId = contact?.recipient_user_id ?? ''
      destinationType =
        contact?.contact_type === 'account_number' || contact?.account ? 'accountNumber' : 'alias'
      idLabel = destinationType === 'accountNumber' ? 'Número de cuenta' : 'Alias'
      idValue = contact?.contact_value ?? contact?.account ?? contact?.alias ?? ''
    } else {
      const trimmedDestination = destination.trim()
      destinationType = sendMethod === 'accountNumber' ? 'accountNumber' : 'alias'
      idLabel = sendMethod === 'accountNumber' ? 'Número de cuenta' : 'Alias'
      if (getAuthMode() === 'mock') {
        const wallet =
          sendMethod === 'accountNumber'
            ? await getWalletByAccountNumber(trimmedDestination)
            : await getWalletByAlias(trimmedDestination)
        if (!wallet || wallet.status !== 'active') {
          onError(
            sendMethod === 'accountNumber'
              ? 'No se encontró ninguna cuenta activa con ese número'
              : 'No se encontró ninguna billetera activa con ese alias',
          )
          return
        }
        recipient = wallet.alias
        recipientUserId = wallet.user_id
      } else {
        recipient = trimmedDestination
        recipientUserId = ''
      }
      idValue = trimmedDestination
    }

    setReview({
      recipient,
      recipientUserId,
      destinationType,
      currencyCode,
      amount: value,
      concept: concept.trim() || undefined,
      idLabel,
      idValue,
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
        destinationType: review.destinationType,
        currencyCode: review.currencyCode,
        amount: review.amount,
        concept: review.concept,
        destinationAlias: review.idValue,
      })
      onDone(`Transferencia a ${review.recipient} enviada`)
    } catch (err) {
      setReview(null)
      setStep(1)
      onError(err)
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
            <dt className="tx-review__label">{review.idLabel}</dt>
            <dd className="tx-review__value">{review.idValue}</dd>
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
          <div className="tx-review__row">
            <dt className="tx-review__label">Comisión</dt>
            <dd className="tx-review__value">Próximamente</dd>
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
            disabled={sending || !review.recipient || (getAuthMode() === 'mock' && !review.recipientUserId) || !(review.amount > 0) || !review.idValue}
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
                value="accountNumber"
                checked={sendMethod === 'accountNumber'}
                onChange={() => setSendMethod('accountNumber')}
              />
              Número de cuenta
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
          </div>
        </div>

      {sendMethod === 'contact' ? (
        <>
          <Select
            id="contact"
            label="Contacto"
            value={contactId}
            onChange={setContactId}
            options={[
              { value: '', label: 'Elige un contacto' },
              ...contacts.map((c) => ({ value: c.id, label: c.alias })),
            ]}
            required
          />
          {(() => {
            const contact = contacts.find((c) => c.id === contactId)
            if (!contact) return null
            const isAccount = contact.contact_type === 'account_number' || Boolean(contact.account)
            const value = isAccount
              ? contact.contact_value ?? contact.account ?? ''
              : contact.contact_value ?? contact.alias ?? ''
            return (
              <div className="tx-form__field">
                <label htmlFor="contact-value" className="tx-form__label">
                  {isAccount ? 'Número de cuenta' : 'Alias'}
                </label>
                <input
                  id="contact-value"
                  type="text"
                  value={value}
                  readOnly
                  className="tx-form__control tx-form__control--readonly"
                />
              </div>
            )
          })()}
        </>
      ) : (
        <div className="tx-form__field">
          <label htmlFor="alias" className="tx-form__label tx-form__label--required">
            {sendMethod === 'accountNumber' ? 'Número de cuenta del destinatario' : 'Alias del destinatario'}
          </label>
          <input
            id="alias"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={sendMethod === 'accountNumber' ? 'GLB-1A2B3C4D' : 'juan.cash'}
            className="tx-form__control"
            required
            aria-required="true"
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
          <label htmlFor="amount" className="tx-form__label tx-form__label--required">Monto</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="tx-form__control"
            required
            aria-required="true"
          />
          {selectedBalance && value > selectedBalance.amount && (
            <p className="tx-form__error" role="alert">Saldo insuficiente</p>
          )}
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

      <button
        type="submit"
        disabled={!isValid}
        className="tx-button tx-button--primary tx-button--block"
      >
        Continuar
      </button>
    </form>
  )
}
