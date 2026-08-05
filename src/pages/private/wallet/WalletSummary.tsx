import { useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Download, Plus, Send, Repeat } from 'lucide-react'
import { getCurrentBalanceSummary } from '../../../api/balances'
import { getRecentTransactions } from '../../../api/transactions'
import { getCurrentCards } from '../../../api/cards'
import { getPaymentMethodsList } from '../../../api/paymentMethods'
import { getQuotes } from '../../../api/exchangeRates'
import type { BalanceSummaryItem } from '../../../api/balances'
import type { Transaction } from '../../../mocks/data/transactions'
import type { Card } from '../../../mocks/data/cards'
import type { PaymentMethod } from '../../../mocks/data/paymentMethods'
import type { ExchangeRate } from '../../../mocks/data/exchangeRates'
import '../../../styles/pages/private/wallet-summary.css'

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
  const [summary, setSummary] = useState<BalanceSummaryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  useEffect(() => {
    getCurrentBalanceSummary().then(setSummary)
    getRecentTransactions(4).then(setTransactions)
    getCurrentCards().then(setCards)
    getPaymentMethodsList().then(setPaymentMethods)
    getQuotes().then(setQuotes)
  }, [])

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
              <button type="button" className="wallet-banner__btn wallet-banner__btn--primary">
                <Plus className="wallet-banner__btn-icon" />
                Agregar dinero
              </button>
              <button type="button" className="wallet-banner__btn wallet-banner__btn--primary">
                <Download className="wallet-banner__btn-icon" />
                Cobrar
              </button>
              <button type="button" className="wallet-banner__btn wallet-banner__btn--dark">
                <Send className="wallet-banner__btn-icon" />
                Enviar
              </button>
              <button type="button" className="wallet-banner__btn wallet-banner__btn--dark">
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
              <a href="#" className="wallet-card__link">Historial global <ArrowRight className="wallet-card__link-icon" /></a>
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
                        ? 'translate(12%, -10%) scale(0.88)'
                        : 'translate(-12%, 8%) scale(0.88)'
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
    </div>
  )
}