import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { convertCurrency } from '../api/exchangeRates'
import Select from './Select'
import type { ExchangeRate } from '../mocks/data/exchangeRates'

export interface ConvertData {
  fromCurrency: string
  toCurrency: string
  amount: number
  result: number
}

interface ConvertFormProps {
  balances: { currency_code: string; amount: number }[]
  quotes: ExchangeRate[]
  submitLabel?: string
  disabled?: boolean
  disableWhenInvalid?: boolean
  resetKey?: number
  onValidSubmit: (data: ConvertData) => void
  onError?: (msg: string) => void
}

export default function ConvertForm({
  balances,
  quotes,
  submitLabel = 'Continuar',
  disabled = false,
  disableWhenInvalid = false,
  resetKey = 0,
  onValidSubmit,
  onError,
}: ConvertFormProps) {
  const [fromCurrency, setFromCurrency] = useState('ARS')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState('')
  const [activeField, setActiveField] = useState<'from' | 'to'>('from')

  const roundStr = (n: number) => String(Math.round(n * 100) / 100)

  const handleFromChange = (v: string) => {
    setActiveField('from')
    setAmount(v)
    const val = Number(v)
    if (val > 0 && fromCurrency !== toCurrency) {
      convertCurrency(fromCurrency, toCurrency, val).then((r) => setResult(roundStr(r)))
    } else {
      setResult('')
    }
  }

  const handleToChange = (v: string) => {
    setActiveField('to')
    setResult(v)
    const val = Number(v)
    if (val > 0 && fromCurrency !== toCurrency) {
      convertCurrency(toCurrency, fromCurrency, val).then((r) => setAmount(roundStr(r)))
    } else {
      setAmount('')
    }
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setAmount(result)
    setResult(amount)
    setActiveField('from')
  }

  useEffect(() => {
    if (fromCurrency === toCurrency) {
      setResult('')
      return
    }
    if (activeField === 'from') {
      const val = Number(amount)
      if (val > 0) convertCurrency(fromCurrency, toCurrency, val).then((r) => setResult(roundStr(r)))
    } else {
      const val = Number(result)
      if (val > 0) convertCurrency(toCurrency, fromCurrency, val).then((r) => setAmount(roundStr(r)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency])

  useEffect(() => {
    if (resetKey === 0) return
    setAmount('')
    setResult('')
    setActiveField('from')
  }, [resetKey])

  const fromBalance = balances.find((b) => b.currency_code === fromCurrency)
  const insufficient = fromBalance ? Number(amount) > fromBalance.amount : false
  const isValid = Boolean(Number(amount) > 0) && fromCurrency !== toCurrency && !insufficient

  const handleSubmit = () => {
    if (!isValid) {
      onError?.(
        insufficient
          ? 'Saldo insuficiente para realizar la conversión'
          : fromCurrency === toCurrency
            ? 'Elegí una moneda de destino distinta'
            : 'Ingresá un monto válido para continuar'
      )
      return
    }
    onValidSubmit({ fromCurrency, toCurrency, amount: Number(amount), result: Number(result) })
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Desde · {fromCurrency}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => handleFromChange(e.target.value)}
            placeholder="0"
            className="tx-amount font-display w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground"
          />
          <Select
            id="from"
            label="Desde"
            hideLabel
            variant="badge"
            value={fromCurrency}
            onChange={setFromCurrency}
            options={balances.map((b) => ({ value: b.currency_code, label: b.currency_code }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Disponible: {fromBalance ? `${fromBalance.amount.toLocaleString('es-AR')} ${fromBalance.currency_code}` : '—'}
        </p>
        {insufficient && (
          <p className="mt-1 text-xs font-medium text-destructive">Saldo insuficiente</p>
        )}
      </div>

      <div className="my-2 flex justify-center">
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Intercambiar monedas"
          title="Intercambiar"
          className="group grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-card transition-colors hover:bg-surface"
        >
          <ArrowLeftRight className="size-4 text-primary transition-transform duration-300 ease-in-out group-hover:rotate-90" />
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Hacia · {toCurrency}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <input
            type="number"
            min="0"
            step="any"
            value={result}
            onChange={(e) => handleToChange(e.target.value)}
            placeholder="0"
            className="tx-amount font-display w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground"
          />
          <Select
            id="to"
            label="Hacia"
            hideLabel
            variant="badge"
            value={toCurrency}
            onChange={setToCurrency}
            options={quotes
              .filter((q) => q.currency_code !== fromCurrency)
              .map((q) => ({ value: q.currency_code, label: q.currency_code }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Cotización · 1 {fromCurrency} ≈{' '}
          {Number(result) > 0 && Number(amount) > 0
            ? `${(Number(result) / Number(amount)).toLocaleString('es-AR', { maximumFractionDigits: 4 })} ${toCurrency}`
            : '—'}
        </p>
        {Number(result) > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Comisión (0,4%): -{(Number(result) * 0.004).toLocaleString('es-AR', { maximumFractionDigits: 2 })} {toCurrency}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || (disableWhenInvalid && !isValid)}
        className="tx-button tx-button--primary tx-button--block"
      >
        {submitLabel}
      </button>
    </>
  )
}
