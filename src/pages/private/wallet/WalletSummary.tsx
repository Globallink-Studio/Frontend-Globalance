import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Repeat,
} from 'lucide-react'
import { getCurrentBalanceSummary } from '../../../api/balances'
import { getRecentTransactions, createDeposit, createMoneyRequest } from '../../../api/transactions'
import { getCurrentCards } from '../../../api/cards'
import { getPaymentMethodsList } from '../../../api/paymentMethods'
import { getQuotes } from '../../../api/exchangeRates'
import { getCurrentContacts } from '../../../api/contacts'
import Modal from '../../../components/Modal'
import type { BalanceSummaryItem } from '../../../api/balances'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Card } from '../../../mocks/data/cards'
import type { PaymentMethod } from '../../../mocks/data/paymentMethods'
import type { ExchangeRate } from '../../../mocks/data/exchangeRates'
import type { Contact } from '../../../mocks/data/contacts'
import '../../../styles/pages/private/wallet-summary.css'
import '../../../styles/pages/private/transactions.css'

const currencyIcons: Record<string, string> = {
  USD: '$',
  EUR: '€',
  ARS: '$',
}

const statusLabel: Record<string, string> = {
  completed: 'Completada',
  pending: 'Pendiente',
  failed: 'Fallida',
}

const cardVariants = [
  'wallet-physical-card--iridescent',
  'wallet-physical-card--ocean',
  'wallet-physical-card--graphite',
]

export default function WalletSummary() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<BalanceSummaryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositStep, setDepositStep] = useState(1)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestStep, setRequestStep] = useState(1)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const reload = () => {
    getCurrentBalanceSummary().then(setSummary)
    getRecentTransactions(4).then(setTransactions)
  }

  useEffect(() => {
    reload()
    getCurrentCards().then(setCards)
    getPaymentMethodsList().then(setPaymentMethods)
    getCurrentContacts().then(setContacts)
    getQuotes().then(setQuotes)
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  const rateByCode = new Map(quotes.map((q) => [q.currency_code, q]))

  const totalBalanceUSD = summary.reduce((acc, item) => {
    const rate = item.currency_code === 'USD' ? 1 : item.currency_code === 'EUR' ? 1.08 : 0.0001
    return acc + item.amount * rate
  }, 0)

  return (
    <div className="wallet-summary">
      <div className="wallet-summary__grid">
        <div className="wallet-summary__main">
          <section className="wallet-card wallet-banner">
            <div className="wallet-banner__left">
              <p className="wallet-banner__label">SALDO UNIFICADO</p>
              <p className="wallet-banner__amount">US$ {totalBalanceUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="wallet-banner__actions">
              <button type="button" className="wallet-banner__btn wallet-banner__btn--primary" onClick={() => setDepositOpen(true)}>
                <Plus className="wallet-banner__btn-icon" />
                Agregar dinero
              </button>
              <button type="button" className="wallet-banner__btn wallet-banner__btn--primary" onClick={() => setRequestOpen(true)}>
                <Download className="wallet-banner__btn-icon" />
                Cobrar
              </button>
              <button type="button" className="wallet-banner__btn wallet-banner__btn--dark" onClick={() => navigate('/dashboard/transactions/transfers')}>
                <ArrowUpRight className="wallet-banner__btn-icon" />
                Transferir
              </button>
              <button type="button" className="wallet-banner__btn wallet-banner__btn--dark" onClick={() => navigate('/dashboard/exchange')}>
                <Repeat className="wallet-banner__btn-icon" />
                Convertir
              </button>
            </div>
          </section>

          <section className="wallet-card wallet-currencies">
            <div className="wallet-currencies__grid">
              {summary.map((item) => {
                const quote = rateByCode.get(item.currency_code)
                return (
                  <article key={item.currency_code} className="wallet-currency-card">
                    <div className="wallet-currency-card__header">
                      <span className="wallet-currency-card__icon">{currencyIcons[item.currency_code] ?? item.currency_code}</span>
                      <span className="wallet-currency-card__code">{item.currency_code}</span>
                    </div>
                    <p className="wallet-currency-card__name">{item.currency_name}</p>
                    <p className="wallet-currency-card__amount">
                      {item.symbol} {item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {quote && (
                      <p className="wallet-currency-card__rate">
                        1 {item.currency_code} = {quote.symbol} {quote.buy_price.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                      </p>
                    )}
                    <span className="wallet-currency-card__tag">
                      {item.currency_code === 'USD' ? 'Cuenta principal' : item.currency_code === 'EUR' ? 'IBAN virtual · ES21' : 'CVU local'}
                    </span>
                    <div className="wallet-currency-card__actions">
                      <button type="button" className="wallet-currency-card__btn">Depositar</button>
                      <button type="button" className="wallet-currency-card__btn">Retirar</button>
                      <button type="button" className="wallet-currency-card__btn">Ver</button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="wallet-card wallet-transactions">
            <div className="wallet-card__header">
              <h2 className="wallet-card__title">Últimos movimientos de la wallet</h2>
            </div>
            <ul className="wallet-transactions__list">
              {transactions.map((tx) => {
                const isPositive = tx.type === 'deposit' || tx.type === 'conversion'
                return (
                  <li key={tx.id} className="wallet-transaction">
                    <div className="wallet-transaction__info">
                      <p className="wallet-transaction__description">{tx.description}</p>
                      <p className="wallet-transaction__meta">{tx.currency_code} · {statusLabel[tx.status] ?? tx.status}</p>
                    </div>
                    <span className={`wallet-transaction__amount${isPositive ? ' wallet-transaction__amount--positive' : ' wallet-transaction__amount--negative'}`}>
                      {isPositive ? '+' : '-'}{tx.amount.toLocaleString('es-AR')} {tx.currency_code}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        <aside className="wallet-summary__sidebar">
          {cards.length > 0 && (
            <section className="wallet-card wallet-cards">
              <div className="wallet-card__header">
                <h2 className="wallet-card__title">Mis tarjetas</h2>
                <span className="wallet-cards__count">{activeCardIndex + 1} / {cards.length}</span>
              </div>

              <div className="wallet-cards__carousel">
                <div className="wallet-cards__stack">
                  {cards.map((card, index) => {
                    const isActive = index === activeCardIndex
                    const diff = index - activeCardIndex
                    const offset = isActive
                      ? 'translate(0, 0) scale(1)'
                      : diff > 0
                        ? 'translate(6%, -7%) scale(0.88)'
                        : 'translate(-6%, 5%) scale(0.88)'
                    return (
                      <div
                        key={card.id}
                        className={`wallet-physical-card ${cardVariants[index % cardVariants.length]}${isActive ? ' wallet-physical-card--active' : ''}`}
                        style={{ transform: offset, zIndex: 20 - Math.abs(diff) }}
                        onClick={() => setActiveCardIndex(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setActiveCardIndex(index)
                        }}
                        aria-label={`Tarjeta ${index + 1}: ${card.brand} ···· ${card.last_four}`}
                      >
                        <div className="wallet-physical-card__chip" />
                        <p className="wallet-physical-card__number">{card.masked_number}</p>
                        <div className="wallet-physical-card__footer">
                          <div>
                            <p className="wallet-physical-card__holder">{card.holder}</p>
                            <p className="wallet-physical-card__expiry">{card.expiry}</p>
                          </div>
                          <span className="wallet-physical-card__brand">{card.brand === 'visa' ? 'VISA' : 'MASTERCARD'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  className="wallet-cards__arrow wallet-cards__arrow--prev"
                  onClick={() => setActiveCardIndex((i) => (i - 1 + cards.length) % cards.length)}
                  aria-label="Tarjeta anterior"
                >
                  <ChevronLeft className="wallet-cards__arrow-icon" />
                </button>
                <button
                  type="button"
                  className="wallet-cards__arrow wallet-cards__arrow--next"
                  onClick={() => setActiveCardIndex((i) => (i + 1) % cards.length)}
                  aria-label="Tarjeta siguiente"
                >
                  <ChevronRight className="wallet-cards__arrow-icon" />
                </button>
              </div>
            </section>
          )}

          {paymentMethods.length > 0 && (
            <section className="wallet-card wallet-retiros">
              <h2 className="wallet-card__title">Retiros</h2>
              <ul className="wallet-retiros__list">
                {paymentMethods.map((pm) => (
                  <li key={pm.id} className="wallet-retiro">
                    <span className="wallet-retiro__name">{pm.name}</span>
                    <span className="wallet-retiro__detail">
                      {pm.last_four ? `···${pm.last_four}` : 'Sin vincular'} · {pm.currency_name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <Modal open={depositOpen} onClose={() => setDepositOpen(false)} title="Agregar dinero" step={depositStep} totalSteps={2}>
        <DepositWizard
          summary={summary}
          paymentMethods={paymentMethods}
          step={depositStep}
          setStep={setDepositStep}
          onDone={(msg) => {
            setDepositOpen(false)
            setDepositStep(1)
            setMessage(msg)
            reload()
          }}
          onError={setErrorMessage}
          sending={sending}
          setSending={setSending}
        />
      </Modal>

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Cobrar" step={requestStep} totalSteps={2}>
        <RequestWizard
          summary={summary}
          contacts={contacts}
          step={requestStep}
          setStep={setRequestStep}
          onDone={(msg) => {
            setRequestOpen(false)
            setRequestStep(1)
            setMessage(msg)
            reload()
          }}
          onError={setErrorMessage}
          sending={sending}
          setSending={setSending}
        />
      </Modal>

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

interface DepositWizardProps {
  summary: BalanceSummaryItem[]
  paymentMethods: PaymentMethod[]
  step: number
  setStep: (v: number) => void
  onDone: (msg: string) => void
  onError: (msg: string) => void
  sending: boolean
  setSending: (v: boolean) => void
}

function DepositWizard({ summary, paymentMethods, step, setStep, onDone, onError, sending, setSending }: DepositWizardProps) {
  const [currencyCode, setCurrencyCode] = useState('ARS')
  const [methodId, setMethodId] = useState('')
  const [amount, setAmount] = useState('')

  const value = Number(amount)
  const method = paymentMethods.find((pm) => pm.id === methodId)

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onError('')
    if (!value || value <= 0) {
      onError('Ingresá un monto válido')
      return
    }
    setStep(2)
  }

  const handleConfirm = async () => {
    onError('')
    setSending(true)
    try {
      await createDeposit({ currencyCode, amount: value, methodName: method?.name })
      onDone(`Depositados ${value.toLocaleString('es-AR')} ${currencyCode}`)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo realizar el depósito')
    } finally {
      setSending(false)
    }
  }

  if (step === 2) {
    return (
      <div className="tx-review">
        <dl className="tx-review__rows">
          <div className="tx-review__row">
            <dt className="tx-review__label">A la cuenta</dt>
            <dd className="tx-review__value">{currencyCode}</dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">Desde</dt>
            <dd className="tx-review__value">{method ? `${method.name}${method.last_four ? ` ····${method.last_four}` : ''}` : '—'}</dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">Monto</dt>
            <dd className="tx-review__value tx-review__amount">
              {value.toLocaleString('es-AR')} {currencyCode}
            </dd>
          </div>
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
            {sending ? 'Depositando...' : 'Confirmar depósito'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleNext} className="tx-form">
      <div className="tx-form__field">
        <label htmlFor="deposit-account" className="tx-form__label">A qué cuenta</label>
        <select
          id="deposit-account"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          className="tx-form__control"
        >
          {summary.map((s) => (
            <option key={s.currency_code} value={s.currency_code}>
              {s.currency_name} ({s.currency_code})
            </option>
          ))}
        </select>
      </div>

      <div className="tx-form__field">
        <label htmlFor="deposit-method" className="tx-form__label">Desde</label>
        <select
          id="deposit-method"
          value={methodId}
          onChange={(e) => setMethodId(e.target.value)}
          className="tx-form__control"
        >
          <option value="">Elegí un método</option>
          {paymentMethods.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.name}{pm.last_four ? ` ····${pm.last_four}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="tx-form__field">
        <label htmlFor="deposit-amount" className="tx-form__label">Monto</label>
        <input
          id="deposit-amount"
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
  )
}

interface RequestWizardProps {
  summary: BalanceSummaryItem[]
  contacts: Contact[]
  step: number
  setStep: (v: number) => void
  onDone: (msg: string) => void
  onError: (msg: string) => void
  sending: boolean
  setSending: (v: boolean) => void
}

function RequestWizard({ summary, contacts, step, setStep, onDone, onError, sending, setSending }: RequestWizardProps) {
  const [contactId, setContactId] = useState('')
  const [currencyCode, setCurrencyCode] = useState('ARS')
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')

  const value = Number(amount)
  const contact = contacts.find((c) => c.id === contactId)

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onError('')
    if (!contact) {
      onError('Elegí a quién querés cobrarle')
      return
    }
    if (!value || value <= 0) {
      onError('Ingresá un monto válido')
      return
    }
    setStep(2)
  }

  const handleConfirm = async () => {
    if (!contact) return
    onError('')
    setSending(true)
    try {
      await createMoneyRequest({
        recipient: contact.alias,
        recipientUserId: contact.recipient_user_id,
        currencyCode,
        amount: value,
        concept: concept.trim() || undefined,
      })
      onDone(`Solicitud de ${value.toLocaleString('es-AR')} ${currencyCode} enviada a ${contact.alias}`)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo realizar la solicitud')
    } finally {
      setSending(false)
    }
  }

  if (step === 2) {
    return (
      <div className="tx-review">
        <dl className="tx-review__rows">
          <div className="tx-review__row">
            <dt className="tx-review__label">Cobrarle a</dt>
            <dd className="tx-review__value">{contact?.alias}</dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">Moneda</dt>
            <dd className="tx-review__value">{currencyCode}</dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">Monto</dt>
            <dd className="tx-review__value tx-review__amount">
              {value.toLocaleString('es-AR')} {currencyCode}
            </dd>
          </div>
          {concept.trim() && (
            <div className="tx-review__row">
              <dt className="tx-review__label">Concepto</dt>
              <dd className="tx-review__value">{concept.trim()}</dd>
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
            {sending ? 'Enviando solicitud...' : 'Confirmar solicitud'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleNext} className="tx-form">
      <div className="tx-form__field">
        <label htmlFor="request-contact" className="tx-form__label">Cobrarle a</label>
        <select
          id="request-contact"
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

      <div className="tx-form__field">
        <label htmlFor="request-currency" className="tx-form__label">Moneda</label>
        <select
          id="request-currency"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          className="tx-form__control"
        >
          {summary.map((s) => (
            <option key={s.currency_code} value={s.currency_code}>{s.currency_code}</option>
          ))}
        </select>
      </div>

      <div className="tx-form__field">
        <label htmlFor="request-amount" className="tx-form__label">Monto</label>
        <input
          id="request-amount"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="tx-form__control"
        />
      </div>

      <div className="tx-form__field">
        <label htmlFor="request-concept" className="tx-form__label">Concepto</label>
        <input
          id="request-concept"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="¿Por qué motivo?"
          className="tx-form__control"
        />
      </div>

      <button type="submit" className="tx-button tx-button--primary tx-button--block">
        Continuar
      </button>
    </form>
  )
}
