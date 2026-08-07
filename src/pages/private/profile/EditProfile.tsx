import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InputField } from '../../../components/register/InputField'
import { getCurrentUser, getCurrentUserProfile, updateCurrentPersonProfile, updateCurrentUser } from '../../../api/users'
import { getCurrentWallet, updateCurrentWallet } from '../../../api/wallets'
import { currencies } from '../../../mocks/data/currencies'
import type { User } from '../../../mocks/data/users'
import type { PersonProfile } from '../../../mocks/data/personProfiles'
import type { CompanyProfile } from '../../../mocks/data/companyProfiles'
import type { Wallet } from '../../../mocks/data/wallets'

export default function EditProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | undefined>()
  const [profile, setProfile] = useState<PersonProfile | CompanyProfile | undefined>()
  const [wallet, setWallet] = useState<Wallet | undefined>()

  const [alias, setAlias] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [displayCurrency, setDisplayCurrency] = useState('ARS')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      setDisplayCurrency(u?.display_currency ?? 'ARS')
    })
    getCurrentUserProfile().then((p) => {
      setProfile(p)
      if (p) {
        if ('first_name' in p) {
          setFirstName(p.first_name)
          setLastName(p.last_name)
        }
        setPhone(p.phone ?? '')
      }
    })
    getCurrentWallet().then((w) => {
      setWallet(w)
      setAlias(w?.alias ?? '')
    })
  }, [])

  const isPerson = !!profile && 'first_name' in profile

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const normalizedAlias = alias.trim()
    if (!normalizedAlias) {
      setError('El alias no puede estar vacío.')
      setSaving(false)
      return
    }

    try {
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
      if (user) {
        await updateCurrentUser({ display_currency: displayCurrency })
      }
      navigate('/dashboard/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-page">
      <Link to="/dashboard/profile" className="profile-edit__back">
        ← Volver al perfil
      </Link>

      <form className="profile-edit" onSubmit={handleSubmit}>
        <h1 className="profile-edit__title">Editar perfil</h1>

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
          <button type="button" className="profile-edit__btn profile-edit__btn--ghost" onClick={() => navigate('/dashboard/profile')}>
            Cancelar
          </button>
          <button type="submit" className="profile-edit__btn profile-edit__btn--primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
