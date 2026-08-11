import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, getCurrentUserProfile } from '../../../api/users'
import { getFirebaseDisplayName } from '../../../api/auth'
import { getCurrentWallet } from '../../../api/wallets'
import { useNotificationPrefs } from '../../../hooks/useNotificationPrefs'
import AccountActions from './AccountActions'
import EditProfileModal from './EditProfileModal'
import type { User } from '../../../mocks/data/users'
import type { PersonProfile } from '../../../mocks/data/personProfiles'
import type { CompanyProfile } from '../../../mocks/data/companyProfiles'
import type { Wallet } from '../../../mocks/data/wallets'

const statusLabel: Record<string, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  blocked: 'Bloqueada',
}

const prefItems = [
  { key: 'notifications', label: 'Notificaciones' },
  { key: 'receivedPayments', label: 'Cobros recibidos' },
  { key: 'currencyUpdates', label: 'Actualizaciones de monedas' },
  { key: 'weeklySummary', label: 'Resumen semanal' },
] as const

type PrefKey = (typeof prefItems)[number]['key']

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="profile-info-row">
      <span className="profile-info-row__label">{label}</span>
      <span className="profile-info-row__value">{children}</span>
    </div>
  )
}

function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning'; children: ReactNode }) {
  return <span className={`profile-badge profile-badge--${tone}`}>{children}</span>
}

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

export default function PersonalData() {
  const [user, setUser] = useState<User | undefined>()
  const [profile, setProfile] = useState<PersonProfile | CompanyProfile | undefined>()
  const [wallet, setWallet] = useState<Wallet | undefined>()
  const [editOpen, setEditOpen] = useState(false)
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } = useNotificationPrefs()
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    notifications: notificationsEnabled,
    receivedPayments: true,
    currencyUpdates: true,
    weeklySummary: false,
  })

  useEffect(() => {
    getCurrentUser().then(setUser)
    getCurrentUserProfile().then(setProfile)
    getCurrentWallet().then(setWallet)
  }, [])

  useEffect(() => {
    setPrefs((prev) => ({ ...prev, notifications: notificationsEnabled }))
  }, [notificationsEnabled])

  const togglePref = (key: PrefKey) => {
    if (key === 'notifications') {
      setNotificationsEnabled(!prefs.notifications)
    }
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isPerson = !!profile && 'first_name' in profile
  const displayName = (() => {
    if (profile) {
      if (isPerson) {
        return `${(profile as PersonProfile).first_name} ${(profile as PersonProfile).last_name}`.trim()
      }
      return ((profile as CompanyProfile).legal_name ?? '').trim()
    }
    return ''
  })() || getFirebaseDisplayName() || ''
  const accountType = isPerson ? 'Personal' : 'Empresa'
  const subtitle = `${user?.email ?? ''} · Cuenta ${accountType}`

  return (
    <div className="profile-page">
      <div className="profile-top">
        <div className="profile-stack">
          {profile && (
            <section className="profile-identity">
              <span className="profile-identity__avatar">{getInitials(displayName)}</span>
              <div className="profile-identity__info">
                <p className="profile-identity__name">{displayName}</p>
                <p className="profile-identity__subtitle">{subtitle}</p>
              </div>
            </section>
          )}

          <div className="profile-main">
            {user && (
              <section className="profile-card">
                <h2 className="profile-card__title">Datos de Cuenta</h2>
                <InfoRow label="Alias">
                  <span className="profile-info-row__alias">{wallet?.alias ?? '—'}</span>
                </InfoRow>
                <InfoRow label="CVU">{wallet?.account_number ?? '—'}</InfoRow>
                <InfoRow label="Documento">
                  {isPerson ? 'DNI' : 'CUIT'}
                </InfoRow>
                <InfoRow label="Tipo de usuario">{accountType}</InfoRow>
                <InfoRow label="Moneda de visualización">
                  <Badge>{user.display_currency}</Badge>
                </InfoRow>
                <InfoRow label="Estado">
                  <Badge tone={user.status === 'active' ? 'success' : user.status === 'blocked' ? 'warning' : 'neutral'}>
                    ● {statusLabel[user.status] ?? user.status}
                  </Badge>
                </InfoRow>
              </section>
            )}

            <div className="profile-stack">
              {profile && (
                <section className="profile-card">
                  <h2 className="profile-card__title">Información personal</h2>
                  <InfoRow label="Nombre">{displayName || '—'}</InfoRow>
                  <InfoRow label="Email">{user?.email ?? '—'}</InfoRow>
                  <InfoRow label="Teléfono">
                    {profile.phone ? (
                      profile.phone
                    ) : (
                      <span className="profile-info-row__empty">
                        Sin registrar{' '}
                        <button type="button" className="profile-info-row__action" onClick={() => setEditOpen(true)}>
                          + Agregar teléfono
                        </button>
                      </span>
                    )}
                  </InfoRow>
                </section>
              )}

              <section className="profile-card">
                <h2 className="profile-card__title">Preferencias de usuario</h2>
                <ul className="profile-prefs__list">
                  {prefItems.map((pref) => (
                    <li key={pref.key}>
                      <button type="button" className="profile-prefs__row" onClick={() => togglePref(pref.key)}>
                        <span className="profile-prefs__label">{pref.label}</span>
                        <span className={`profile-switch${prefs[pref.key] ? ' profile-switch--on' : ''}`} aria-hidden="true">
                          <span className="profile-switch__thumb" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>

        <AccountActions onEditProfile={() => setEditOpen(true)} />
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={() => setEditOpen(false)} />
    </div>
  )
}
