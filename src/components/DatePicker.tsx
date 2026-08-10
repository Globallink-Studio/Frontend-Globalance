import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/components/date-picker.css'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const iso = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

interface DatePickerProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function DatePicker({ id, label, value, onChange, placeholder = 'Elegir fecha' }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const today = useMemo(() => {
    const now = new Date()
    return iso(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const initialView = (v: string) => {
    const [y, m] = v ? v.split('-').map(Number) : [NaN, NaN]
    const base = Number.isFinite(y) && Number.isFinite(m) ? new Date(y, m - 1, 1) : new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  }

  const [view, setView] = useState(() => initialView(value))

  useEffect(() => {
    if (open && value) {
      const [y, m] = value.split('-').map(Number)
      if (Number.isFinite(y) && Number.isFinite(m)) setView({ year: y, month: m - 1 })
    }
  }, [open, value])

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const days = useMemo(() => {
    const { year, month } = view
    const offset = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: 42 }, (_, i) => {
      const day = i - offset + 1
      return { day, iso: iso(year, month, day), inMonth: day >= 1 && day <= daysInMonth }
    })
  }, [view])

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
  const displayLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const displayValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  const shiftMonth = (delta: number) =>
    setView((v) => {
      const month = v.month + delta
      return month < 0 ? { year: v.year - 1, month: 11 } : month > 11 ? { year: v.year + 1, month: 0 } : { ...v, month }
    })

  return (
    <div className="tx-form__field">
      <label htmlFor={id} className="tx-form__label">{label}</label>
      <div className="dp" ref={ref}>
        <button
          type="button"
          id={id}
          className="tx-form__control dp__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={displayValue ? 'dp__value' : 'dp__value dp__value--empty'}>
            {displayValue ?? placeholder}
          </span>
          <Calendar className="dp__icon" />
        </button>
        {open && (
          <div className="dp__popover" role="dialog" aria-label={label}>
            <div className="dp__header">
              <button
                type="button"
                className="dp__nav"
                aria-label="Mes anterior"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft className="dp__nav-icon" />
              </button>
              <span className="dp__title">{displayLabel}</span>
              <button
                type="button"
                className="dp__nav"
                aria-label="Mes siguiente"
                onClick={() => shiftMonth(1)}
              >
                <ChevronRight className="dp__nav-icon" />
              </button>
            </div>
            <div className="dp__week">
              {WEEKDAYS.map((w) => (
                <span key={w} className="dp__weekday">{w}</span>
              ))}
            </div>
            <div className="dp__grid">
              {days.map((cell, i) =>
                cell.inMonth ? (
                  <button
                    key={i}
                    type="button"
                    className={[
                      'dp__day',
                      cell.iso === value ? 'dp__day--selected' : '',
                      cell.iso === today ? 'dp__day--today' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      onChange(cell.iso)
                      setOpen(false)
                    }}
                  >
                    {cell.day}
                  </button>
                ) : (
                  <span key={i} className="dp__day dp__day--empty" aria-hidden="true" />
                ),
              )}
            </div>
            <div className="dp__footer">
              <button
                type="button"
                className="dp__action"
                onClick={() => {
                  onChange(today)
                  setOpen(false)
                }}
              >
                Hoy
              </button>
              {value && (
                <button
                  type="button"
                  className="dp__action"
                  onClick={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
