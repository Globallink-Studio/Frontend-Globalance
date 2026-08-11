import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../../components/Modal'
import { InputField } from '../../../components/register/InputField'
import { getCurrentUser, getCurrentUserProfile, updateCurrentPersonProfile, updateCurrentUser } from '../../../api/users'
import { getAuthMode } from '../../../api/auth'
import { getCurrentWallet, updateCurrentWallet } from '../../../api/wallets'
import { currencies } from '../../../mocks/data/currencies'
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
  const [documentNumber, setDocumentNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [displayCurrency, setDisplayCurrency] = useState('ARS')
  const [initial, setInitial] = useState({ alias: '', firstName: '', lastName: '', phone: '', displayCurrency: 'ARS' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setSaving(false)
    Promise.all([getCurrentUser(), getCurrentUserProfile(), getCurrentWallet()]).then(([u, p, w]) => {
      setUser(u)
      setProfile(p)
      if (p) {
        if ('first_name' in p) {
          setFirstName(p.first_name)
          setLastName(p.last_name)
          setDocumentNumber(p.document ?? '')
        }
        setPhone(p.phone ?? '')
      }
      setWallet(w)

      const nextCurrency = u?.display_currency ?? 'ARS'
      const nextFirstName = p && 'first_name' in p ? p.first_name : ''
      const nextLastName = p && 'first_name' in p ? p.last_name : ''
      const nextPhone = p?.phone ?? ''
      const nextAlias = w?.alias ?? ''

      setAlias(nextAlias)
      setFirstName(nextFirstName)
      setLastName(nextLastName)
      setPhone(nextPhone)
      setDisplayCurrency(nextCurrency)
      setInitial({
        alias: nextAlias,
        firstName: nextFirstName,
        lastName: nextLastName,
        phone: nextPhone,
        displayCurrency: nextCurrency,
      })
    })
  }, [open])

  const isPerson = !!profile && 'first_name' in profile
  const isValid = alias.trim() !== ''

  const hasChanges =
    alias !== initial.alias ||
    firstName !== initial.firstName ||
    lastName !== initial.lastName ||
    phone !== initial.phone ||
    displayCurrency !== initial.displayCurrency

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) return
    setError('')
    setSaving(true)

    const normalizedAlias = alias.trim()

    try {
      if (getAuthMode() === 'firebase') {
        if (!profile || !isPerson) {
          throw new Error('La edición del perfil de empresa todavía no está disponible en el backend')
        }
        await updateCurrentPersonProfile({
          first_name: firstName.trim() || 'Usuario',
          last_name: lastName.trim(),
          document: documentNumber.trim(),
          phone: phone.trim() || null,
          alias: normalizedAlias,
          displayCurrency,
        })
      } else {
        if (wallet) {
          await updateCurrentWallet({ alias: normalizedAlias })
        }
        if (profile && isPerson) {
          await updateCurrentPersonProfile({
            first_name: firstName.trim() || 'Usuario',
            last_name: lastName.trim(),
            document: documentNumber.trim() || 'DNI pendiente',
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
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar los cambios.')
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
                <InputField
                  label="Documento"
                  type="text"
                  id="document"
                  name="document"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="DNI 30123456"
                />
              </>
            ) : (
              <p className="profile-edit__readonly">
                <span>Nombre</span>
                <strong>{profile ? (profile as CompanyProfile).legal_name : '—'}</strong>
              </p>
            )}
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
