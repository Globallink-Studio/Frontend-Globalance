import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Plus,
  Repeat,
} from 'lucide-react'
import { getCurrentBalanceSummary, getUnifiedBalance, type BalanceSummaryItem } from '../../../api/balances'
import { getCurrentUser } from '../../../api/users'
import { getRecentTransactions, createDeposit, createMoneyRequest, createConversion } from '../../../api/transactions'
import { getQuotes } from '../../../api/exchangeRates'
import { getCurrentCards } from '../../../api/cards'
import { getPaymentMethodsList } from '../../../api/paymentMethods'
import { getCurrentContacts } from '../../../api/contacts'
import Modal from '../../../components/Modal'
import AccountDetailModal from './AccountDetailModal'
import Select from '../../../components/Select'
import ConvertForm, { type ConvertData } from '../../../components/ConvertForm'
import TransferWizard from '../../../components/TransferWizard'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Card } from '../../../mocks/data/cards'
import type { PaymentMethod } from '../../../mocks/data/paymentMethods'
import type { Contact } from '../../../mocks/data/contacts'
import type { ExchangeRate } from '../../../mocks/data/exchangeRates'
import '../../../styles/pages/private/wallet-summary.css'
import '../../../styles/pages/private/transactions.css'

const compactFormatter = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 })

const formatAmount = (amount: number) =>
  amount >= 1_000_000
    ? compactFormatter.format(amount)
    : amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const cardVariants = [
  'wallet-physical-card--iridescent',
  'wallet-physical-card--ocean',
  'wallet-physical-card--graphite',
]

export default function WalletSummary() {
  const [summary, setSummary] = useState<BalanceSummaryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositStep, setDepositStep] = useState(1)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestStep, setRequestStep] = useState(1)
  const [convertOpen, setConvertOpen] = useState(false)
  const [convertStep, setConvertStep] = useState(1)
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferStep, setTransferStep] = useState(1)
  const [accountDetail, setAccountDetail] = useState<BalanceSummaryItem | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [unifiedBalance, setUnifiedBalance] = useState(0)
  const [displayCurrency, setDisplayCurrency] = useState('USD')

  const reload = () => {
    getCurrentBalanceSummary().then(setSummary)
    getRecentTransactions(5).then(setTransactions)
  }

  useEffect(() => {
    reload()
    getCurrentCards().then(setCards)
    getPaymentMethodsList().then(setPaymentMethods)
    getCurrentContacts().then(setContacts)
    getQuotes().then(setQuotes)
    getCurrentUser().then((u) => setDisplayCurrency(u?.display_currency ?? 'USD'))
  }, [])

  useEffect(() => {
    if (!displayCurrency) return
    getUnifiedBalance(displayCurrency).then(setUnifiedBalance)
  }, [displayCurrency])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  const unifiedSymbol =
    summary.find((s) => s.currency_code === displayCurrency)?.symbol ??
    (displayCurrency === 'USD' ? 'US$' : displayCurrency === 'EUR' ? '€' : '$')

  return (
    <div className="wallet-summary">
      <div className="wallet-summary__grid">
        <div className="wallet-summary__main">
          <section className="wallet-card wallet-banner">
            <p className="wallet-banner__label">SALDO UNIFICADO</p>
            <div className="wallet-banner__row">
              <p className="wallet-banner__amount">{unifiedSymbol} {unifiedBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="wallet-banner__actions">
                <button type="button" className="wallet-banner__btn wallet-banner__btn--primary" onClick={() => setDepositOpen(true)}>
                  <Plus className="wallet-banner__btn-icon" />
                  Cargar saldo
                </button>
                <button type="button" className="wallet-banner__btn wallet-banner__btn--dark" onClick={() => setTransferOpen(true)}>
                  <ArrowUpRight className="wallet-banner__btn-icon" />
                  Transferir
                </button>
                <button type="button" className="wallet-banner__btn wallet-banner__btn--dark" onClick={() => setRequestOpen(true)}>
                  <Download className="wallet-banner__btn-icon" />
                  Cobrar
                </button>
                <button type="button" className="wallet-banner__btn wallet-banner__btn--dark" onClick={() => setConvertOpen(true)}>
                  <Repeat className="wallet-banner__btn-icon" />
                  Convertir
                </button>
              </div>
            </div>
          </section>

          <section className="wallet-currencies">
            <div className="wallet-currencies__grid">
              {summary.map((item) => (
                <article key={item.currency_code} className="wallet-currency-card">
                  <div className="wallet-currency-card__header">
                    <span className="wallet-currency-card__icon">{item.currency_code}</span>
                    <div className="wallet-currency-card__info">
                      <p className="wallet-currency-card__code">{item.currency_code}</p>
                      <p className="wallet-currency-card__name">{item.currency_name}</p>
                    </div>
                    <div className="wallet-currency-card__balance">
                      <p className="wallet-currency-card__amount">
                        {item.symbol} {formatAmount(item.amount)}
                      </p>
                      <span className="wallet-currency-card__tag">
                        {item.currency_code === 'USD' ? 'Cuenta principal' : item.currency_code === 'EUR' ? 'IBAN virtual · ES21' : 'CVU local'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="wallet-currency-card__view"
                    onClick={() => setAccountDetail(item)}
                  >
                    Ver
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="wallet-card wallet-transactions">
            <div className="wallet-card__header">
              <h2 className="wallet-card__title">Últimos movimientos de la billetera</h2>
              <Link to="/dashboard/transactions" className="wallet-card__link">
                Ver todas las transacciones
                <ArrowRight className="wallet-card__link-icon" />
              </Link>
            </div>
            <ul className="wallet-transactions__list">
              {transactions.map((tx) => {
                const isPositive = tx.type === 'deposit' || tx.type === 'conversion'
                return (
                  <li key={tx.id} className="wallet-transaction">
                    <div className="wallet-transaction__info">
                      <p className="wallet-transaction__description">{tx.description}</p>
                    </div>
                    <span className="wallet-transaction__currency">
                      {tx.from_currency && tx.to_currency
                        ? `${tx.from_currency} → ${tx.to_currency}`
                        : tx.currency_code}
                    </span>
                    <span className="wallet-transaction__amount">
                      {isPositive ? '+' : '-'}{tx.amount.toLocaleString('es-AR')}
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
                <div
                  className="wallet-cards__stack"
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0].clientX
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartX.current === null) return
                    const dx = e.changedTouches[0].clientX - touchStartX.current
                    touchStartX.current = null
                    if (Math.abs(dx) < 40) return
                    setActiveCardIndex((i) =>
                      dx < 0 ? (i + 1) % cards.length : (i - 1 + cards.length) % cards.length,
                    )
                  }}
                >
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

          <section className="wallet-card wallet-retiros">
            <h2 className="wallet-card__title">Retiros</h2>
            <div className="wallet-retiros__wrap">
              <div className="wallet-retiros__blur">
                {paymentMethods.length > 0 ? (
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
                ) : (
                  <ul className="wallet-retiros__list">
                    <li className="wallet-retiro">
                      <span className="wallet-retiro__name">Tus cuentas vinculadas</span>
                      <span className="wallet-retiro__detail">Aparecerán acá</span>
                    </li>
                  </ul>
                )}
              </div>
              <div className="wallet-retiros__overlay">
                <span className="wallet-retiros__coming">
                  <Clock className="wallet-retiros__coming-icon" />
                  Próximamente
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <AccountDetailModal open={accountDetail !== null} item={accountDetail} onClose={() => setAccountDetail(null)} />

      <Modal open={depositOpen} onClose={() => setDepositOpen(false)} title="Depositar" step={depositStep} totalSteps={2}>
        <DepositWizard
          summary={summary}
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

      <Modal open={convertOpen} onClose={() => setConvertOpen(false)} title="Convertir" step={convertStep} totalSteps={2}>
        <ConvertWizard
          summary={summary}
          quotes={quotes}
          step={convertStep}
          setStep={setConvertStep}
          onDone={(msg) => {
            setConvertOpen(false)
            setConvertStep(1)
            setMessage(msg)
            reload()
          }}
          onError={setErrorMessage}
          sending={sending}
          setSending={setSending}
        />
      </Modal>

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transferir" step={transferStep} totalSteps={2}>
        <TransferWizard
          contacts={contacts}
          step={transferStep}
          setStep={setTransferStep}
          onDone={(msg) => {
            setTransferOpen(false)
            setTransferStep(1)
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
  step: number
  setStep: (v: number) => void
  onDone: (msg: string) => void
  onError: (msg: string) => void
  sending: boolean
  setSending: (v: boolean) => void
}

function DepositWizard({ summary, step, setStep, onDone, onError, sending, setSending }: DepositWizardProps) {
  const [currencyCode, setCurrencyCode] = useState('ARS')
  const [amount, setAmount] = useState('')

  const value = Number(amount)
  const isValid = value > 0

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    setStep(2)
  }

  const handleConfirm = async () => {
    onError('')
    setSending(true)
    try {
      await createDeposit({ currencyCode, amount: value, methodName: 'Método de pago demo' })
      onDone(`Depositados ${value.toLocaleString('es-AR')} ${currencyCode}`)
    } catch (err) {
      setAmount('')
      setStep(1)
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
            <dd className="tx-review__value">Método de pago demo</dd>
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
      <Select
        id="deposit-account"
        label="A qué cuenta"
        value={currencyCode}
        onChange={setCurrencyCode}
        options={summary.map((s) => ({
          value: s.currency_code,
          label: `${s.currency_name} (${s.currency_code})`,
        }))}
      />

      <div className="tx-form__field">
        <label htmlFor="deposit-method" className="tx-form__label">Método de pago</label>
        <input
          id="deposit-method"
          type="text"
          value="Método de pago demo"
          readOnly
          className="tx-form__control"
        />
        <p className="tx-form__hint">Depósito de prueba en entorno demo.</p>
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

      <button type="submit" disabled={!isValid} className="tx-button tx-button--primary tx-button--block">
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
  const isValid = Boolean(contact && contact.email) && value > 0

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    setStep(2)
  }

  const handleConfirm = async () => {
    if (!contact) return
    if (!contact.email) {
      setContactId('')
      setStep(1)
      onError('El contacto no tiene un correo cargado para cobrarle')
      return
    }
    onError('')
    setSending(true)
    try {
      await createMoneyRequest({
        recipient: contact.alias,
        recipientUserId: contact.recipient_user_id,
        currencyCode,
        amount: value,
        concept: concept.trim() || undefined,
        payerEmail: contact.email,
      })
      onDone(`Solicitud de ${value.toLocaleString('es-AR')} ${currencyCode} enviada a ${contact.alias}`)
    } catch (err) {
      setContactId('')
      setAmount('')
      setConcept('')
      setStep(1)
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
      <Select
        id="request-contact"
        label="Cobrarle a"
        value={contactId}
        onChange={setContactId}
        options={[
          { value: '', label: 'Elegí un contacto' },
          ...contacts.map((c) => ({ value: c.id, label: c.alias })),
        ]}
      />

      <Select
        id="request-currency"
        label="Moneda"
        value={currencyCode}
        onChange={setCurrencyCode}
        options={summary.map((s) => ({ value: s.currency_code, label: s.currency_code }))}
      />

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

      <button type="submit" disabled={!isValid} className="tx-button tx-button--primary tx-button--block">
        Continuar
      </button>
    </form>
  )
}

interface ConvertWizardProps {
  summary: BalanceSummaryItem[]
  quotes: ExchangeRate[]
  step: number
  setStep: (v: number) => void
  onDone: (msg: string) => void
  onError: (msg: string) => void
  sending: boolean
  setSending: (v: boolean) => void
}

function ConvertWizard({ summary, quotes, step, setStep, onDone, onError, sending, setSending }: ConvertWizardProps) {
  const [data, setData] = useState<ConvertData | null>(null)

  const handleConfirm = async () => {
    if (!data) return
    onError('')
    setSending(true)
    try {
      await createConversion({ fromCurrency: data.fromCurrency, toCurrency: data.toCurrency, amount: data.amount })
      onDone(`Convertidos ${data.amount.toLocaleString('es-AR')} ${data.fromCurrency} a ${data.toCurrency}`)
    } catch (err) {
      setData(null)
      setStep(1)
      onError(err instanceof Error ? err.message : 'No se pudo realizar la conversión')
    } finally {
      setSending(false)
    }
  }

  if (step === 2 && data) {
    return (
      <div className="tx-review">
        <dl className="tx-review__rows">
          <div className="tx-review__row">
            <dt className="tx-review__label">De la cuenta</dt>
            <dd className="tx-review__value">{data.fromCurrency}</dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">A la cuenta</dt>
            <dd className="tx-review__value">{data.toCurrency}</dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">Monto</dt>
            <dd className="tx-review__value tx-review__amount">
              {data.amount.toLocaleString('es-AR')} {data.fromCurrency}
            </dd>
          </div>
          <div className="tx-review__row">
            <dt className="tx-review__label">Recibirás</dt>
            <dd className="tx-review__value">
              {data.result > 0 ? `${data.result.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ${data.toCurrency}` : '—'}
            </dd>
          </div>
          {data.result > 0 && (
            <div className="tx-review__row">
              <dt className="tx-review__label">Comisión (0,4%)</dt>
              <dd className="tx-review__value">
                -{(data.result * 0.004).toLocaleString('es-AR', { maximumFractionDigits: 2 })} {data.toCurrency}
              </dd>
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
            {sending ? 'Convirtiendo...' : 'Confirmar conversión'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <ConvertForm
      balances={summary}
      quotes={quotes}
      submitLabel="Continuar"
      disabled={sending}
      disableWhenInvalid
      onValidSubmit={(d) => {
        setData(d)
        setStep(2)
      }}
    />
  )
}
