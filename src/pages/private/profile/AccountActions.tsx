import { useState } from 'react'
import { User, FileText, KeyRound, Trash2, Check } from 'lucide-react'
import Modal from '../../../components/Modal'
import { InputField } from '../../../components/register/InputField'
import TermsContent from './TermsContent'
import '../../../styles/pages/private/transactions.css'

type ModalKind = 'password' | 'terms' | 'delete' | null

interface AccountActionsProps {
  onEditProfile: () => void
}

export default function AccountActions({ onEditProfile }: AccountActionsProps) {
  const [modal, setModal] = useState<ModalKind>(null)

  const close = () => setModal(null)

  return (
    <section className="profile-card">
      <h2 className="profile-card__title">Ajustes</h2>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="profile-actions__btn profile-actions__btn--primary"
          onClick={onEditProfile}
        >
          <User className="profile-actions__icon" />
          Editar perfil
        </button>
        <button
          type="button"
          className="profile-actions__btn"
          onClick={() => setModal('password')}
        >
          <KeyRound className="profile-actions__icon" />
          Cambiar contraseña
        </button>
        <button
          type="button"
          className="profile-actions__btn"
          onClick={() => setModal('terms')}
        >
          <FileText className="profile-actions__icon" />
          Términos y condiciones
        </button>
        <button
          type="button"
          className="profile-actions__btn profile-actions__btn--danger"
          onClick={() => setModal('delete')}
        >
          <Trash2 className="profile-actions__icon" />
          Eliminar cuenta
        </button>
      </div>

      <PasswordModal open={modal === 'password'} onClose={close} />
      <TermsModal open={modal === 'terms'} onClose={close} />
      <DeleteAccountModal open={modal === 'delete'} onClose={close} />
    </section>
  )
}

/* ── Cambiar contraseña ─────────────────────────── */

function PasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({ current: false, next: false, confirm: false })
  const [done, setDone] = useState(false)

  const currentError = !touched.current ? '' : current.trim() === '' ? 'Ingresá tu contraseña actual.' : ''
  const nextError = !touched.next
    ? ''
    : next.length < 6
      ? 'Debe tener al menos 6 caracteres.'
      : ''
  const confirmError = !touched.confirm
    ? ''
    : confirm === ''
      ? 'Confirmá la nueva contraseña.'
      : confirm !== next
        ? 'Las contraseñas no coinciden.'
        : ''

  const isValid =
    current.trim() !== '' && next.length >= 6 && confirm !== '' && confirm === next

  const reset = () => {
    setStep(1)
    setCurrent('')
    setNext('')
    setConfirm('')
    setTouched({ current: false, next: false, confirm: false })
    setDone(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Cambiar contraseña" step={step} totalSteps={2}>
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-6 w-6" />
          </span>
          <p className="font-semibold">Contraseña actualizada</p>
          <p className="text-sm text-muted-foreground">
            Tu contraseña se cambió correctamente. Usala en tu próximo inicio de sesión.
          </p>
          <button type="button" className="profile-edit__btn profile-edit__btn--primary" onClick={handleClose}>
            Listo
          </button>
        </div>
      ) : step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setTouched({ current: true, next: true, confirm: true })
            if (isValid) setStep(2)
          }}
          className="tx-form"
          noValidate
        >
          <InputField
            label="Contraseña actual"
            type="password"
            id="pw-current"
            name="pw-current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, current: true }))}
            autoComplete="current-password"
            error={currentError}
            valid={touched.current && !currentError && current.trim() !== ''}
          />
          <InputField
            label="Nueva contraseña"
            type="password"
            id="pw-new"
            name="pw-new"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, next: true }))}
            autoComplete="new-password"
            error={nextError}
            valid={touched.next && !nextError && next.length >= 6}
          />
          <InputField
            label="Confirmar nueva contraseña"
            type="password"
            id="pw-confirm"
            name="pw-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            autoComplete="new-password"
            error={confirmError}
            valid={touched.confirm && !confirmError && confirm === next}
          />
          <button
            type="submit"
            disabled={!isValid}
            className="tx-button tx-button--primary tx-button--block"
          >
            Continuar
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            ¿Confirmás el cambio? Se cerrarán las demás sesiones y tendrás que usar la nueva
            contraseña la próxima vez que inicies sesión.
          </p>
          <div className="tx-review__actions">
            <button type="button" className="profile-edit__btn profile-edit__btn--ghost" onClick={() => setStep(1)}>
              Volver
            </button>
            <button type="button" className="profile-edit__btn profile-edit__btn--primary" onClick={() => setDone(true)}>
              Confirmar cambio
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ── Términos y condiciones ─────────────────────── */

function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Términos y Condiciones" step={1} totalSteps={1}>
      <div className="max-h-[24rem] overflow-y-auto rounded-xl border border-border p-4">
        <p className="profile-info-row__label mb-3">Última actualización: 10 de agosto de 2026</p>
        <TermsContent />
      </div>
    </Modal>
  )
}

/* ── Eliminar cuenta ────────────────────────────── */

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('')

  const handleClose = () => {
    setText('')
    onClose()
  }

  const confirmed = text.trim().toUpperCase() === 'ELIMINAR'

  return (
    <Modal open={open} onClose={handleClose} title="Eliminar cuenta" step={1} totalSteps={1}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Vas a eliminar tu cuenta de Globalance de forma permanente. Esta acción no se puede
          deshacer: se borrarán tus datos, tus billeteras y el historial de operaciones.
        </p>
        <p className="text-sm font-semibold text-destructive">
          Escribí «ELIMINAR» para confirmar.
        </p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ELIMINAR"
          className="tx-form__control"
        />
        <div className="tx-review__actions">
          <button type="button" className="profile-edit__btn profile-edit__btn--ghost" onClick={handleClose}>
            Cancelar
          </button>
          <button type="button" disabled={!confirmed} className="profile-edit__btn profile-edit__btn--danger">
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </Modal>
  )
}
