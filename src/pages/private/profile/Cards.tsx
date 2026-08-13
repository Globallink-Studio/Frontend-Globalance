import { useEffect, useState, type FormEvent } from 'react'
import { getCurrentCards, addCard, blockCard, unblockCard, deleteCard } from '../../../api/cards'
import { getFriendlyErrorMessage } from '../../../api/errors'
import Modal from '../../../components/Modal'
import Select from '../../../components/Select'
import type { Card } from '../../../mocks/data/cards'
import { formatExpiry } from '../../../utils/cardFormat'
import '../../../styles/pages/private/transactions.css'

const brandLabel: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
}

const brandBadge: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
}

const statusLabel: Record<string, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  blocked: 'Bloqueada',
}

const cardVariants = [
  'cards-grid__card--iridescent',
  'cards-grid__card--ocean',
  'cards-grid__card--graphite',
]

interface ConfirmState {
  card: Card
  action: 'block' | 'unblock' | 'delete'
}

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  const loadCards = () => getCurrentCards().then(setCards)

  useEffect(() => {
    loadCards()
  }, [])

  const handleClose = () => {
    setOpen(false)
    setError('')
  }

  const handleConfirmAction = async () => {
    if (!confirm) return
    setSending(true)
    setError('')
    const { card, action } = confirm
    try {
      if (action === 'delete') await deleteCard(card.id)
      else if (action === 'block') await blockCard(card.id)
      else await unblockCard(card.id)
      setConfirm(null)
      await loadCards()
    } catch (err) {
      setError(getFriendlyErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tus tarjetas</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="tx-button tx-button--primary"
        >
          Agregar tarjeta
        </button>
      </div>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

      {cards.length === 0 && <p className="text-sm text-muted-foreground">Sin tarjetas.</p>}

      <div className="cards-grid">
        {cards.map((card, index) => (
          <article
            key={card.id}
            className={`cards-grid__card ${cardVariants[index % cardVariants.length]}${card.status === 'blocked' ? ' cards-grid__card--blocked' : ''}`}
          >
            <div className="cards-grid__header">
              <span className="cards-grid__brand">{brandBadge[card.brand] ?? card.brand}</span>
              <span className="cards-grid__status">{statusLabel[card.status] ?? card.status}</span>
            </div>

            <div className="cards-grid__chip" />
            <p className="cards-grid__number">{card.masked_number}</p>

            <div className="cards-grid__meta">
              <div>
                <p className="cards-grid__holder">{card.holder}</p>
                <p className="cards-grid__expiry">{card.expiry}</p>
              </div>
            </div>

            <div className="cards-grid__actions">
              <button
                type="button"
                onClick={() => setConfirm({ card, action: card.status === 'blocked' ? 'unblock' : 'block' })}
                disabled={sending}
                className="cards-grid__btn"
              >
                {card.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
              </button>
              <button
                type="button"
                onClick={() => setConfirm({ card, action: 'delete' })}
                disabled={sending}
                className="cards-grid__btn"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={handleClose} title="Agregar tarjeta" step={1} totalSteps={1}>
        <AddCardForm
          onDone={() => {
            handleClose()
            loadCards()
          }}
          onError={setError}
          sending={sending}
          setSending={setSending}
        />
      </Modal>

      {confirm && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">
              {confirm.action === 'delete'
                ? 'Eliminar tarjeta'
                : confirm.action === 'block'
                  ? 'Bloquear tarjeta'
                  : 'Desbloquear tarjeta'}
            </h3>
            <p className="tx-modal__message">
              {confirm.action === 'delete' &&
                `¿Seguro que quieres eliminar la tarjeta ${brandLabel[confirm.card.brand]} ····${confirm.card.last_four}? Esta acción no se puede deshacer.`}
              {confirm.action === 'block' &&
                `¿Seguro que quieres bloquear la tarjeta ${brandLabel[confirm.card.brand]} ····${confirm.card.last_four}? No vas a poder usarla hasta desbloquearla.`}
              {confirm.action === 'unblock' &&
                `¿Seguro que quieres desbloquear la tarjeta ${brandLabel[confirm.card.brand]} ····${confirm.card.last_four}?`}
            </p>
            {error && <p className="profile-edit__error" role="alert">{error}</p>}
            <div className="tx-review__actions">
              <button
                type="button"
                disabled={sending}
                onClick={() => setConfirm(null)}
                className="profile-edit__btn profile-edit__btn--ghost"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={handleConfirmAction}
                className={`profile-edit__btn ${confirm.action === 'delete' ? 'profile-edit__btn--danger' : 'profile-edit__btn--primary'}`}
              >
                {sending
                  ? 'Procesando...'
                  : confirm.action === 'delete'
                    ? 'Sí, eliminar'
                    : confirm.action === 'block'
                      ? 'Sí, bloquear'
                      : 'Sí, desbloquear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AddCardFormProps {
  onDone: () => void
  onError: (msg: string) => void
  sending: boolean
  setSending: (v: boolean) => void
}

function AddCardForm({ onDone, onError, sending, setSending }: AddCardFormProps) {
  const [brand, setBrand] = useState('visa')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [lastFour, setLastFour] = useState('')
  const [agreed, setAgreed] = useState(false)

  const isValid = holder.trim() !== '' && expiry.trim() !== '' && lastFour.length === 4 && agreed

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    onError('')
    setSending(true)
    try {
      await addCard({ brand: brand as Card['brand'], holder, expiry, last_four: lastFour })
      onDone()
    } catch (err) {
      onError(getFriendlyErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="tx-form">
      <Select
        id="card-brand"
        label="Marca"
        value={brand}
        onChange={setBrand}
        options={[
          { value: 'visa', label: 'Visa' },
          { value: 'mastercard', label: 'Mastercard' },
        ]}
      />

      <div className="tx-form__field">
        <label htmlFor="card-holder" className="tx-form__label">Titular</label>
        <input
          id="card-holder"
          type="text"
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
          placeholder="Nombre como figura en la tarjeta"
          className="tx-form__control"
        />
      </div>

      <div className="tx-form__field">
        <label htmlFor="card-expiry" className="tx-form__label">Vencimiento</label>
        <input
          id="card-expiry"
          type="text"
          inputMode="numeric"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          placeholder="MM/AA"
          className="tx-form__control"
        />
      </div>

      <div className="tx-form__field">
        <label htmlFor="card-last-four" className="tx-form__label">Últimos 4 dígitos</label>
        <input
          id="card-last-four"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={lastFour}
          onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))}
          placeholder="4242"
          className="tx-form__control"
        />
        <p className="tx-form__hint">Solo se guardan los últimos 4 dígitos de la tarjeta.</p>
      </div>

      <label className="tx-form__option">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>Estoy de acuerdo con agregar esta tarjeta al sitio</span>
      </label>

      <button
        type="submit"
        disabled={sending || !isValid}
        className="tx-button tx-button--primary tx-button--block"
      >
        {sending ? 'Agregando...' : 'Agregar tarjeta'}
      </button>
    </form>
  )
}
