import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import '../styles/components/select.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  hint?: string
}

export default function Select({ id, label, value, onChange, options, placeholder = '', hint }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  const selected = options.find((o) => o.value === value)

  return (
    <div className="tx-form__field">
      <label htmlFor={id} className="tx-form__label">{label}</label>
      <div className="select" ref={ref}>
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          className="tx-form__control select__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="select__value">{selected?.label ?? placeholder}</span>
          <ChevronDown className="select__chevron" />
        </button>
        {open && (
          <ul className="select__menu" role="listbox" aria-labelledby={id}>
            {options.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className="select__btn"
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && <p className="tx-form__hint">{hint}</p>}
    </div>
  )
}
