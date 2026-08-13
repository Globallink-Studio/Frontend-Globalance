import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthCard } from '../../components/register/AuthCard'
import { InputField } from '../../components/register/InputField'
import LegalConsent from '../../components/register/LegalConsent'
import { useAuth } from '../../providers/authentication/AuthContext'
import { useAuthForm } from '../../hooks/useAuthForm'
import { getCurrentUser, getCurrentUserProfile } from '../../api/users'
import { getFriendlyErrorMessage } from '../../api/errors'
import { isProfileCompleted, markProfileCompleted } from '../../utils/profileCompletion'
import type { User } from '../../mocks/data/users'
import '../../styles/pages/public/auth-common.css'
import '../../styles/pages/public/signup.css'

type CompleteProfileValues = {
  firstName: string
  lastName: string
  document: string
  phone: string
}

const initialValues: CompleteProfileValues = {
  firstName: '',
  lastName: '',
  document: '',
  phone: '',
}

const ALIAS_CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randomAliasSuffix(length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALIAS_CHARSET[Math.floor(Math.random() * ALIAS_CHARSET.length)]
  }
  return out
}

function generateAlias(firstName: string, lastName: string): string {
  const base = `${firstName}.${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  const candidate = `${base || 'usuario'}.${randomAliasSuffix(4)}`
  const trimmed = candidate.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 30)
  return trimmed.length >= 6 ? trimmed : trimmed + randomAliasSuffix(6 - trimmed.length)
}

function validateField(field: keyof CompleteProfileValues, values: CompleteProfileValues): string | undefined {
  switch (field) {
    case 'firstName':
      if (!values.firstName.trim()) return 'El nombre es obligatorio.'
      return undefined
    case 'lastName':
      if (!values.lastName.trim()) return 'El apellido es obligatorio.'
      return undefined
    case 'document':
      if (!values.document.trim()) return 'El documento es obligatorio.'
      if (values.document.trim().length < 5) return 'El documento debe tener al menos 5 caracteres.'
      return undefined
    case 'phone':
      if (!values.phone.trim()) return 'El teléfono es obligatorio.'
      if (values.phone.trim().length < 7) return 'El teléfono debe tener al menos 7 caracteres.'
      return undefined
  }
}

function validateForm(values: CompleteProfileValues): Partial<Record<keyof CompleteProfileValues, string>> {
  const fields: (keyof CompleteProfileValues)[] = ['firstName', 'lastName', 'document', 'phone']
  return fields.reduce<Partial<Record<keyof CompleteProfileValues, string>>>((acc, field) => {
    const error = validateField(field, values)
    if (error) acc[field] = error
    return acc
  }, {})
}

function ProfileForm({ initial, email, uid }: { initial: CompleteProfileValues; email: string; uid: string }) {
  const navigate = useNavigate()
  const { logout, completeGoogleProfile } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)

  const scrollToConsent = () => {
    requestAnimationFrame(() => {
      document.querySelector('#legal-consent')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const form = useAuthForm<CompleteProfileValues>({
    initialValues: initial,
    validateField,
    validateForm,
    onSubmit: async (values) => {
      setErrorMessage('')
      if (!termsChecked || !privacyChecked) {
        setErrorMessage('Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.')
        scrollToConsent()
        return
      }
      try {
        await completeGoogleProfile({
          first_name: values.firstName.trim() || 'Usuario',
          last_name: values.lastName.trim(),
          document: values.document.trim(),
          phone: values.phone.trim(),
          alias: generateAlias(values.firstName, values.lastName),
        })
        markProfileCompleted(uid)
        navigate('/dashboard')
      } catch (err) {
        setErrorMessage(getFriendlyErrorMessage(err))
      }
    },
  })

  const { values, errors, isSubmitting, isChecked, handleChange, handleBlur, handleSubmit } = form

  const fieldsComplete = Object.keys(validateForm(values)).length === 0
  const consentDone = termsChecked && privacyChecked

  const handleChangeResetsError = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) setErrorMessage('')
    handleChange(e)
  }

  const handleGoBack = async () => {
    try {
      await logout()
    } finally {
      navigate('/')
    }
  }

  return (
    <AuthCard
      title="Completa tus datos"
      subtitle="Solo falta completar tu perfil para empezar a usar Globalance."
      errorMessage={errorMessage}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="complete-profile__email">
          <span className="complete-profile__email-label">Correo de tu cuenta Google</span>
          <strong className="complete-profile__email-value">{email || '—'}</strong>
        </div>

        <p className="complete-profile__hint">
          Estos datos son obligatorios para habilitar tu cuenta. Puedes editarlos después desde tu perfil.
        </p>

        <InputField
          label="Nombre"
          type="text"
          id="firstName"
          name="firstName"
          value={values.firstName}
          onChange={handleChangeResetsError}
          onBlur={handleBlur}
          placeholder="Juan"
          autoComplete="given-name"
          required
          error={errors.firstName}
          valid={isChecked('firstName') && !errors.firstName}
        />
        <InputField
          label="Apellido"
          type="text"
          id="lastName"
          name="lastName"
          value={values.lastName}
          onChange={handleChangeResetsError}
          onBlur={handleBlur}
          placeholder="Pérez"
          autoComplete="family-name"
          required
          error={errors.lastName}
          valid={isChecked('lastName') && !errors.lastName}
        />
        <InputField
          label="Documento"
          type="text"
          id="document"
          name="document"
          value={values.document}
          onChange={handleChangeResetsError}
          onBlur={handleBlur}
          placeholder="DNI 30123456"
          autoComplete="off"
          required
          error={errors.document}
          valid={isChecked('document') && !errors.document}
        />
        <InputField
          label="Teléfono"
          type="text"
          id="phone"
          name="phone"
          value={values.phone}
          onChange={handleChangeResetsError}
          onBlur={handleBlur}
          placeholder="+54 11 5555-0101"
          autoComplete="tel"
          required
          error={errors.phone}
          valid={isChecked('phone') && !errors.phone}
        />

        <LegalConsent
          termsChecked={termsChecked}
          privacyChecked={privacyChecked}
          onTermsChange={setTermsChecked}
          onPrivacyChange={setPrivacyChecked}
        />

        {fieldsComplete && !consentDone && (
          <p className="signup-panel__consent-hint" role="alert">
            Debes aceptar los Términos y Condiciones y la Política de Privacidad para crear tu cuenta.
          </p>
        )}

        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar y continuar'}
        </button>

        <div className="complete-profile__links">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault()
              void handleGoBack()
            }}
          >
            ← Volver al inicio (cancelar)
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}

export default function CompleteProfile() {
  const { isAuthenticated, initializing, user } = useAuth()
  const [ready, setReady] = useState(false)
  const [initial, setInitial] = useState<CompleteProfileValues>(initialValues)
  const [email, setEmail] = useState('')
  const [fbUser, setFbUser] = useState<User | null>(null)

  const uid = user?.firebase_uid ?? user?.id ?? fbUser?.firebase_uid ?? fbUser?.id ?? ''
  const completed = uid ? isProfileCompleted(uid) : false

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const u = await getCurrentUser()
        if (!mounted) return
        setFbUser(u ?? null)
        setEmail(u?.email ?? '')
      } catch {
        if (mounted) setFbUser(null)
      }
      try {
        const p = await getCurrentUserProfile()
        if (mounted && p && 'first_name' in p) {
          setInitial({
            firstName: p.first_name,
            lastName: p.last_name,
            document: '',
            phone: '',
          })
        }
      } catch {
        // El perfil todavía no existe: la cuenta se crea al guardar el formulario
      }
      if (mounted) setReady(true)
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  if (initializing || !ready) {
    return (
      <AuthCard title="Completa tus datos">
        <p className="complete-profile__hint">Cargando tu perfil…</p>
      </AuthCard>
    )
  }
  if (completed) return <Navigate to="/dashboard" replace />
  if (!isAuthenticated && !fbUser) return <Navigate to="/signin" replace />

  return <ProfileForm key={`${initial.firstName}-${initial.lastName}`} initial={initial} email={email} uid={uid} />
}
