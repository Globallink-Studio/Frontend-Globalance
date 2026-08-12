import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../../components/Modal'
import { InputField } from '../../../components/register/InputField'
import Select from '../../../components/Select'
import { getCurrentUser, getCurrentUserProfile, updateCurrentPersonProfile, updateCurrentCompanyProfile, updateCurrentUser } from '../../../api/users'
import { getFriendlyErrorMessage } from '../../../api/errors'
import { getAuthMode } from '../../../api/auth'
import { getCurrentWallet, updateCurrentWallet } from '../../../api/wallets'
import { currencies } from '../../../mocks/data/currencies'
import { timezones, DEFAULT_TIMEZONE } from '../../../mocks/data/timezones'
import type { User } from '../../../mocks/data/users'
import type { PersonProfile } from '../../../mocks/data/personProfiles'
import type { CompanyProfile } from '../../../mocks/data/companyProfiles'
import type { Wallet } from '../../../mocks/data/wallets'
import '../../../styles/pages/private/profile.css'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function EditProfileModal({ open, onClose, onSaved }: EditProfileModalProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | undefined>()
  const [profile, setProfile] = useState<PersonProfile | CompanyProfile | undefined>()
  const [wallet, setWallet] = useState<Wallet | undefined>()

  const [alias, setAlias] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [displayCurrency, setDisplayCurrency] = useState('ARS')
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE)
  const [initial, setInitial] = useState({
    alias: '',
    firstName: '',
    lastName: '',
    legalName: '',
    document: '',
    phone: '',
    displayCurrency: 'ARS',
    timezone: DEFAULT_TIMEZONE,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setSaving(false)
    Promise.all([getCurrentUser(), getCurrentUserProfile(), getCurrentWallet()]).then(([u, p, w]) => {
      setUser(u)
      setProfile(p)
      const nextDocument = p?.document ?? ''
      const nextPhone = p?.phone ?? ''
      const nextFirstName = p && 'first_name' in p ? p.first_name : ''
      const nextLastName = p && 'first_name' in p ? p.last_name : ''
      const nextLegalName = p && 'legal_name' in p ? p.legal_name : ''
      const nextAlias = w?.alias ?? ''
      const nextCurrency = u?.display_currency ?? 'ARS'
      const nextTimezone = p?.timezone ?? DEFAULT_TIMEZONE

      setDocumentNumber(nextDocument)
      setPhone(nextPhone)
      setFirstName(nextFirstName)
      setLastName(nextLastName)
      setLegalName(nextLegalName)
      setAlias(nextAlias)
      setDisplayCurrency(nextCurrency)
      setTimezone(nextTimezone)
      setWallet(w)
      setInitial({
        alias: nextAlias,
        firstName: nextFirstName,
        lastName: nextLastName,
        legalName: nextLegalName,
        document: nextDocument,
        phone: nextPhone,
        displayCurrency: nextCurrency,
        timezone: nextTimezone,
      })
    })
  }, [open])

  const isPerson = !!profile && 'first_name' in profile
  const isValid = alias.trim() !== ''

  const hasChanges =
    alias !== initial.alias ||
    firstName !== initial.firstName ||
    lastName !== initial.lastName ||
    legalName !== initial.legalName ||
    documentNumber !== initial.document ||
    phone !== initial.phone ||
    displayCurrency !== initial.displayCurrency ||
    timezone !== initial.timezone

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    setError('')

    if (getAuthMode() === 'firebase' && phone.trim().length < 7) {
      setError('Completá tu teléfono (mínimo 7 caracteres) para guardar los cambios.')
      return
    }

    setSaving(true)

    const normalizedAlias = alias.trim()

    try {
      if (getAuthMode() === 'firebase') {
        if (!profile) {
          throw new Error('No se pudo cargar el perfil.')
        }
        if (isPerson) {
          await updateCurrentPersonProfile({
            first_name: firstName.trim() || 'Usuario',
            last_name: lastName.trim(),
            phone: phone.trim() || null,
            alias: normalizedAlias,
            displayCurrency,
            timezone,
          })
        } else {
          await updateCurrentCompanyProfile({
            legal_name: legalName.trim(),
            phone: phone.trim() || null,
            alias: normalizedAlias,
            displayCurrency,
            timezone,
          })
        }
      } else {
        if (wallet) {
          await updateCurrentWallet({ alias: normalizedAlias })
        }
        if (profile && isPerson) {
          await updateCurrentPersonProfile({
            first_name: firstName.trim() || 'Usuario',
            last_name: lastName.trim(),
            phone: phone.trim() || null,
          })
        }
        if (profile && !isPerson) {
          await updateCurrentCompanyProfile({
            legal_name: legalName.trim(),
            phone: phone.trim() || null,
          })
        }
        if (user) {
          await updateCurrentUser({ display_currency: displayCurrency })
        }
      }
      onSaved()
      navigate('/dashboard/profile', { replace: true })
    } catch (err) {
      setError(getFriendlyErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar perfil"
      step={1}
      totalSteps={1}
      panelClassName="modal__panel--wide"
    >
      <form className="tx-form" onSubmit={handleSubmit}>
        <div className="profile-card">
          <h2 className="profile-card__title">Datos de Cuenta</h2>
          <div className="profile-edit__fields">
            <InputField
              label="Alias"
              type="text"
              id="alias"
              name="alias"
              value={alias}
              placeholder="ferposada.wallet"
              onChange={(e) => setAlias(e.target.value)}
            />
            <div className="profile-edit__field">
              <span className="profile-edit__label">Moneda de visualización</span>
              <div className="profile-currency" role="radiogroup" aria-label="Moneda de visualización">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    role="radio"
                    aria-checked={displayCurrency === c.code}
                    className={`profile-currency__option${displayCurrency === c.code ? ' profile-currency__option--active' : ''}`}
                    onClick={() => setDisplayCurrency(c.code)}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
            <Select
              id="timezone"
              label="Zona horaria"
              value={timezone}
              onChange={setTimezone}
              options={timezones.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
            />
            <p className="profile-edit__readonly">
              <span>Número de cuenta</span>
              <strong>{wallet?.account_number ?? '—'}</strong>
            </p>
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-card__title">Información personal</h2>
          <div className="profile-edit__fields">
            {isPerson ? (
              <>
                <InputField
                  label="Nombre"
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <InputField
                  label="Apellido"
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </>
            ) : (
              <InputField
                label="Razón social"
                type="text"
                id="legalName"
                name="legalName"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            )}
            <p className="profile-edit__readonly">
              <span>Documento</span>
              <strong>{documentNumber || '—'}</strong>
            </p>
            <InputField
              label="Teléfono"
              type="text"
              id="phone"
              name="phone"
              value={phone}
              placeholder="+54 11 5555-0000"
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="profile-edit__readonly">
              <span>Email</span>
              <strong>{user?.email ?? '—'}</strong>
            </p>
          </div>
        </div>

        {error && <p className="profile-edit__error">{error}</p>}

        <div className="profile-edit__actions">
          <button type="button" className="profile-edit__btn profile-edit__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="profile-edit__btn profile-edit__btn--primary" disabled={saving || !isValid || !hasChanges}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
