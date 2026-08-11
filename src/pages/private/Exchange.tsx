import { useEffect, useState } from 'react'
import { DollarSign, Euro, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { getQuotes, refreshExchangeRates } from '../../api/exchangeRates'
import { getCurrentBalances } from '../../api/balances'
import { createConversion } from '../../api/transactions'
import ConvertForm, { type ConvertData } from '../../components/ConvertForm'
import RateChart from '../../components/RateChart'
import type { ExchangeRate } from '../../mocks/data/exchangeRates'
import type { Balance } from '../../mocks/data/balances'
import '../../styles/pages/private/transactions.css'

export default function Exchange() {
  const [quotes, setQuotes] = useState<ExchangeRate[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<ConvertData | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadExchangeData = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [q, b] = await Promise.all([getQuotes(), getCurrentBalances()])
      setQuotes(q)
      setBalances(b)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar las cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadExchangeData()
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  useEffect(() => {
    if (!refreshMessage) return
    const t = setTimeout(() => setRefreshMessage(null), 4000)
    return () => clearTimeout(t)
  }, [refreshMessage])

  const handleValidSubmit = (data: ConvertData) => {
    setPending(data)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pending) return
    setErrorMessage(null)
    setSending(true)
    try {
      await createConversion({ fromCurrency: pending.fromCurrency, toCurrency: pending.toCurrency, amount: pending.amount })
      setConfirmOpen(false)
      setPending(null)
      setMessage(`Convertidos ${pending.amount} ${pending.fromCurrency} a ${pending.toCurrency}`)
      setResetKey((k) => k + 1)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al convertir')
    } finally {
      setSending(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMessage(null)
    try {
      const rates = await refreshExchangeRates()
      setQuotes(rates)
      setRefreshKey((k) => k + 1)
      setRefreshMessage('Cotizaciones actualizadas')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudieron actualizar las cotizaciones')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-4${refreshing ? ' animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar cotizaciones'}
        </button>
      </div>

      {refreshMessage && <div className="tx-toast">{refreshMessage}</div>}

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={loadExchangeData}
            className="rounded-full border border-destructive/30 bg-transparent px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-surface"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Cargando cotizaciones…
        </div>
      )}

      {!loading && !loadError && quotes.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No hay cotizaciones disponibles por el momento.
        </div>
      )}

      {!loading && quotes.length > 0 && (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((q) => {
          const Icon = q.currency_code === 'EUR' ? Euro : DollarSign
          const delta = q.prev_buy_price > 0 ? ((q.buy_price - q.prev_buy_price) / q.prev_buy_price) * 100 : 0
          const rounded = Math.round(delta * 10) / 10
          const up = rounded > 0
          const down = rounded < 0
          const pair = q.currency_code === 'ARS' ? 'Moneda base' : `${q.currency_code} / ARS`
          const formatPrice = (v: number) => `$${v.toLocaleString('es-AR')}`
          return (
            <div key={q.id} className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
              <div className="flex items-start justify-between">
                <div className="grid size-12 place-items-center rounded-2xl border border-border/50 bg-surface">
                  <Icon className="size-5 text-foreground" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium${
                    up
                      ? ' border-success/30 bg-success/10 text-success'
                      : down
                        ? ' border-destructive/30 bg-destructive/10 text-destructive'
                        : ' border-border bg-surface text-muted-foreground'
                  }`}
                >
                  {up && <TrendingUp className="size-3" />}
                  {down && <TrendingDown className="size-3" />}
                  {rounded === 0 ? 'Estable' : `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('es-AR')}%`}
                </span>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium tracking-tight">{q.currency_name}</h2>
                <p className="text-sm text-muted-foreground">{pair}</p>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border py-3">
                  <span className="text-sm text-muted-foreground">Compra</span>
                  <span className="text-xl font-semibold tracking-tight">{formatPrice(q.buy_price)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">Venta</span>
                  <span className="text-xl font-semibold tracking-tight">
                    {q.currency_code === 'ARS' ? '—' : formatPrice(q.sell_price)}
                  </span>
                </div>
              </div>

              {q.provider && q.fetched_at && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Fuente: {q.provider}
                    <span className="mx-1.5 text-border">·</span>
                    {new Date(q.fetched_at).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          )
        })}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="tx-card lg:col-span-1">
          <h3 className="tx-section__title">Convertir</h3>
          <ConvertForm
            balances={balances}
            quotes={quotes}
            submitLabel="Confirmar conversión"
            disabled={sending || loading}
            resetKey={resetKey}
            onValidSubmit={handleValidSubmit}
            onError={setErrorMessage}
          />
        </div>

        <div className="lg:col-span-2">
          <RateChart refreshKey={refreshKey} />
        </div>
      </div>

      {message && (
        <div className="tx-toast">{message}</div>
      )}

      {confirmOpen && pending && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Confirmar conversión</h3>
            <p className="tx-modal__message">
              ¿Confirmás la conversión de {pending.amount.toLocaleString('es-AR')} {pending.fromCurrency} a{' '}
              {pending.result > 0 ? pending.result.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : '—'} {pending.toCurrency}?
            </p>
            {pending.result > 0 && (
              <p className="tx-modal__message">
                Se descontará una comisión del 0,4% ({(pending.result * 0.004).toLocaleString('es-AR')} {pending.toCurrency}).
              </p>
            )}
            <div className="tx-review__actions">
              <button
                type="button"
                disabled={sending}
                onClick={() => setConfirmOpen(false)}
                className="tx-button tx-button--secondary"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={handleConfirm}
                className="tx-button tx-button--primary"
              >
                {sending ? 'Convirtiendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
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
