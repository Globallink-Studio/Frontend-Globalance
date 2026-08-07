import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import '../styles/components/modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  step: number
  totalSteps: number
  children: ReactNode
}

export default function Modal({ open, onClose, title, step, totalSteps, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div className="modal__header-text">
            <h2 className="modal__title">{title}</h2>
            <p className="modal__step">
              Paso {step} de {totalSteps}
            </p>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="modal__close-icon" />
          </button>
        </div>
        <div className="modal__progress">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`modal__progress-bar${i < step ? ' modal__progress-bar--active' : ''}`}
            />
          ))}
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
